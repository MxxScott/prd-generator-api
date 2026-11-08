import 'dotenv/config';
import express, { type Request, type Response } from 'express';
import cors from 'cors';
import { type ClientDiscoveryInput } from './types/index.js';
import { generatePRDFromAI } from './services/ai.service.js';
import { connectDB } from './config/db.js';
import { PRDModel } from './models/prd.model.js';
import { generateMarkdownPRD } from './utils/markdown.util.js';

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Initialize Database
await connectDB();

app.get('/api/health', (req: Request, res: Response) => {
  res.status(200).json({ status: 'API is running perfectly.' });
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