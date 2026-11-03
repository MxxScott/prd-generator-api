import 'dotenv/config';
import express, { type Request, type Response } from 'express';
import cors from 'cors';
import { type ClientDiscoveryInput } from './types/index.js';
import { generatePRDFromAI } from './services/ai.service.js';
import { connectDB } from './config/db.js';

const app = express();

// Initialize Database
await connectDB();

const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

app.get('/api/health', (req: Request, res: Response) => {
  res.status(200).json({ status: 'API is running perfectly.' });
});

app.post('/api/generate-prd', async (req: Request<{}, {}, ClientDiscoveryInput>, res: Response) => {
  try {
    const { projectName, clientName, projectGoal, targetAudience, coreFeaturesRequired } = req.body;

    if (!projectName || !clientName || !projectGoal || !targetAudience || !coreFeaturesRequired) {
      return res.status(400).json({ error: 'Missing required client discovery fields.' });
    }

    console.log(`Received PRD request for: ${projectName} by ${clientName}`);

    const prd = await generatePRDFromAI(req.body);

    res.status(200).json({ 
      message: 'PRD Generated Successfully',
      data: prd 
    });

  } catch (error) {
    console.error('Error generating PRD:', error);
    res.status(500).json({ error: 'Internal server error while generating PRD.' });
  }
});

app.listen(PORT, () => {
  console.log(`Server running in strict TypeScript mode on port ${PORT}`);
});