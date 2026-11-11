import 'dotenv/config';
import express, { type Request, type Response } from 'express';
import cors from 'cors';
import { type ClientDiscoveryInput } from './types/index.js';
import { connectDB } from './config/db.js';
import { PRDModel } from './models/prd.model.js';
import { ProjectModel } from './models/project.model.js';
import { generatePRDFromAI, auditProjectWithAI, generateDesignDocFromAI } from './services/ai.service.js';
import { generateMarkdownPRD, generateDesignDocMarkdown} from './utils/markdown.util.js';

const app = express();
app.use(cors());
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Initialize Database
await connectDB();

app.get('/api/health', (req: Request, res: Response) => {
  res.status(200).json({ status: 'API is running perfectly.' });
});

// POST: Phase 1 - Create a new Project Draft
app.post('/api/projects', async (req: Request, res: Response) => {
  try {
    const { projectName, clientName, projectGoal, targetAudience, designPreferences, coreFeaturesRequired } = req.body;

    // Basic validation to ensure the form isn't completely empty
    if (!projectName || !clientName) {
      return res.status(400).json({ error: 'Project Name and Client Name are required to start a draft.' });
    }

    // Save the raw intake data as a DRAFT
    const newProject = await ProjectModel.create({
      status: 'DRAFT',
      tier: 'FREE', // We default to FREE until you build a Stripe/Paywall integration
      intakeData: {
        projectName,
        clientName,
        projectGoal: projectGoal || '',
        targetAudience: targetAudience || '',
        designPreferences: designPreferences || { themeStyle: 'Undecided' },
        coreFeaturesRequired: Array.isArray(coreFeaturesRequired) ? coreFeaturesRequired : []
      }
    });

    res.status(201).json({
      message: 'Project draft created successfully.',
      projectId: newProject._id,
      status: newProject.status
    });
  } catch (error) {
    console.error('Error creating project draft:', error);
    res.status(500).json({ error: 'Internal server error while saving draft.' });
  }
});

// POST: Phase 2 - Trigger AI Audit (The Upsell)
app.post('/api/projects/:id/audit', async (req: Request<{ id: string }>, res: Response) => {
  try {
    const project = await ProjectModel.findById(req.params.id);

    if (!project) {
      return res.status(404).json({ error: 'Project not found.' });
    }

    if (project.status !== 'DRAFT') {
      return res.status(400).json({ error: 'Only DRAFT projects can be audited.' });
    }

    console.log(`Auditing project: ${project.intakeData.projectName}...`);

    // 1. Ask Gemini to review the draft
    const suggestions = await auditProjectWithAI(project.intakeData);

    // 2. Save the suggestions and update status
    project.aiSuggestions = suggestions;
    project.status = 'PENDING_REVIEW';
    await project.save();

    // 3. Return the suggestions so the frontend can render the "Accept/Decline" UI
    res.status(200).json({
      message: 'Audit complete. Pending user review.',
      status: project.status,
      suggestions: project.aiSuggestions
    });
  } catch (error) {
    console.error('Error auditing project:', error);
    res.status(500).json({ error: 'Internal server error while auditing project.' });
  }
});

// PATCH: Phase 2 - Accept or Decline Suggestions
app.patch('/api/projects/:id/suggestions', async (req: Request<{ id: string }>, res: Response) => {
  try {
    const { acceptedSuggestionIds } = req.body; // Expects an array of string IDs

    if (!Array.isArray(acceptedSuggestionIds)) {
      return res.status(400).json({ error: 'acceptedSuggestionIds must be an array.' });
    }

    const project = await ProjectModel.findById(req.params.id);

    if (!project) {
      return res.status(404).json({ error: 'Project not found.' });
    }

    // Update the isAccepted flag for every suggestion
    project.aiSuggestions = project.aiSuggestions.map(suggestion => ({
      suggestionId: suggestion.suggestionId,
      title: suggestion.title,
      description: suggestion.description,
      isAccepted: acceptedSuggestionIds.includes(suggestion.suggestionId)
    }));

    await project.save();

    res.status(200).json({
      message: 'User decisions saved.',
      suggestions: project.aiSuggestions
    });
  } catch (error) {
    console.error('Error updating suggestions:', error);
    res.status(500).json({ error: 'Internal server error while updating suggestions.' });
  }
});

// POST: Phase 3 - Generate the final Document
app.post('/api/projects/:id/generate', async (req: Request<{ id: string }>, res: Response) => {
  try {
    const { documentType = 'PRD' } = req.body; // Default to PRD, future proofed for DESIGN_DOC

    const project = await ProjectModel.findById(req.params.id);

    if (!project) {
      return res.status(404).json({ error: 'Project not found.' });
    }

    // Check if we already generated this document type
    const existingDoc = project.generatedDocuments.find(doc => doc.documentType === documentType);
    
    if (existingDoc) {
      console.log(`Document ${documentType} already exists. Returning from database.`);
      
      // Re-generate the markdown string from the saved JSON
      let markdownOutput = '';
      if (documentType === 'DESIGN_DOC') {
        markdownOutput = generateDesignDocMarkdown(existingDoc.content);
      } else if (documentType === 'PRD') {
        // We recreate finalInput on the fly for the PRD markdown utility
        const acceptedFeatures = project.aiSuggestions.filter(s => s.isAccepted).map(s => `${s.title}: ${s.description}`);
        const finalInput = {
          projectName: project.intakeData.projectName,
          clientName: project.intakeData.clientName,
          projectGoal: project.intakeData.projectGoal,
          targetAudience: project.intakeData.targetAudience,
          coreFeaturesRequired: [...project.intakeData.coreFeaturesRequired, ...acceptedFeatures]
        };
        markdownOutput = generateMarkdownPRD(finalInput, existingDoc.content); 
      }

      return res.status(200).json({
        message: `${documentType} retrieved successfully from database.`,
        status: project.status,
        document: existingDoc.content,
        markdown: markdownOutput
      });
    }

    console.log(`Generating ${documentType} for: ${project.intakeData.projectName}...`);

    // 1. Extract only the accepted AI suggestions
    const acceptedFeatures = project.aiSuggestions
      .filter(suggestion => suggestion.isAccepted === true)
      .map(suggestion => `${suggestion.title}: ${suggestion.description}`);

    // 2. Merge them with the original user requests
    const combinedFeatures = [
      ...project.intakeData.coreFeaturesRequired,
      ...acceptedFeatures
    ];

    // 3. Map to the format expected by our AI service (Now including designPreferences!)
    const finalInput = {
      projectName: project.intakeData.projectName,
      clientName: project.intakeData.clientName,
      projectGoal: project.intakeData.projectGoal,
      targetAudience: project.intakeData.targetAudience,
      designPreferences: project.intakeData.designPreferences, // Crucial for the Design Doc
      coreFeaturesRequired: combinedFeatures
    };

    // 4. Generate the document via Gemini based on the requested type
    let generatedContent;
    if (documentType === 'DESIGN_DOC') {
      generatedContent = await generateDesignDocFromAI(finalInput);
    } else {
      // Default fallback is the PRD
      generatedContent = await generatePRDFromAI(finalInput);
    }

    // 5. Save the document to the array and mark the project as COMPLETED
    project.generatedDocuments.push({
      documentType: documentType as any,
      content: generatedContent,
      generatedAt: new Date()
    });
    
    project.status = 'COMPLETED';
    await project.save();

    // Generate the markdown string based on the document type
    let markdownOutput = '';
    if (documentType === 'DESIGN_DOC') {
      markdownOutput = generateDesignDocMarkdown(generatedContent);
    } else {
      markdownOutput = generateMarkdownPRD(finalInput, generatedContent);
    }

    res.status(200).json({
      message: `${documentType} generated successfully.`,
      status: project.status,
      document: generatedContent, // The raw JSON for UI rendering
      markdown: markdownOutput    // The formatted string for downloading
    });
  } catch (error) {
    console.error('Error generating document:', error);
    res.status(500).json({ error: 'Internal server error while generating document.' });
  }
});

// POST: Generate PRD and Save to Database
app.post('/api/generate-prd', async (req: Request<{}, {}, ClientDiscoveryInput>, res: Response) => {
  try {
    const { projectName, clientName, projectGoal, targetAudience, coreFeaturesRequired } = req.body;

    if (!projectName || !clientName || !projectGoal || !targetAudience || !coreFeaturesRequired) {
      return res.status(400).json({ error: 'Missing required client discovery fields.' });
    }

    // Vulnerability Patch: Reject if coreFeaturesRequired is not an array
    if (!Array.isArray(coreFeaturesRequired)) {
      return res.status(400).json({ error: 'coreFeaturesRequired must be an array of strings.' });
    }

    console.log(`Generating PRD for: ${projectName} by ${clientName}`);

    // 1. Generate via Gemini
    const generatedPrd = await generatePRDFromAI(req.body);

    // 2. Persist to MongoDB
    const savedRecord = await PRDModel.create({
      input: req.body,
      prd: generatedPrd
    });

    // 3. Return the new database ID alongside the payload
    res.status(201).json({
      message: 'PRD generated and saved successfully',
      id: savedRecord._id,
      data: savedRecord.prd
    });
  } catch (error) {
    console.error('Error generating PRD:', error);
    res.status(500).json({ error: 'Internal server error while generating PRD.' });
  }
});

// GET: Retrieve a saved PRD by its MongoDB ID
app.get('/api/prds/:id', async (req: Request<{ id: string }>, res: Response) => {
  try {
    const record = await PRDModel.findById(req.params.id);

    if (!record) {
      return res.status(404).json({ error: 'PRD not found.' });
    }

    res.status(200).json({
      id: record._id,
      input: record.input,
      prd: record.prd,
      createdAt: record.createdAt
    });
  } catch (error) {
    console.error('Error fetching PRD:', error);
    res.status(400).json({ error: 'Invalid PRD ID format.' });
  }
});

// GET: Export a saved PRD as a Markdown file
app.get('/api/prds/:id/export/md', async (req: Request<{ id: string }>, res: Response) => {
  try {
    const record = await PRDModel.findById(req.params.id);

    if (!record) {
      return res.status(404).json({ error: 'PRD not found.' });
    }

    const markdownContent = generateMarkdownPRD(record.input, record.prd);
    
    // Create a clean filename replacing spaces with underscores
    const filename = `${record.input.projectName.replace(/\s+/g, '_')}_PRD.md`;

    // These headers force the client to download the response as a file
    res.setHeader('Content-Type', 'text/markdown');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);

    res.status(200).send(markdownContent);
  } catch (error) {
    console.error('Error exporting PRD:', error);
    res.status(400).json({ error: 'Invalid PRD ID format or export failed.' });
  }
});

app.listen(PORT, () => {
  console.log(`Server running in strict TypeScript mode on port ${PORT}`);
});