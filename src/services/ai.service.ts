import 'dotenv/config';
import { GoogleGenerativeAI, SchemaType } from '@google/generative-ai';
import { type ClientDiscoveryInput, type PRDDocument } from '../types/index.js';

export async function generatePRDFromAI(input: ClientDiscoveryInput): Promise<PRDDocument> {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    throw new Error("CRITICAL: GEMINI_API_KEY is missing in your .env file.");
  }

  const genAI = new GoogleGenerativeAI(apiKey);

  const model = genAI.getGenerativeModel({
    model: 'gemini-flash-latest',
    generationConfig: {
      responseMimeType: "application/json",
      responseSchema: {
        type: SchemaType.OBJECT,
        properties: {
          title: { type: SchemaType.STRING },
          executiveSummary: { type: SchemaType.STRING },
          userPersonas: {
            type: SchemaType.ARRAY,
            items: { type: SchemaType.STRING }
          },
          features: {
            type: SchemaType.ARRAY,
            items: {
              type: SchemaType.OBJECT,
              properties: {
                featureName: { type: SchemaType.STRING },
                description: { type: SchemaType.STRING },
                priority: { type: SchemaType.STRING, format: "enum", enum: ["High", "Medium", "Low"] }
              },
              required: ["featureName", "description", "priority"]
            }
          },
          techStackRecommendations: {
            type: SchemaType.ARRAY,
            items: { type: SchemaType.STRING }
          }
        },
        required: ["title", "executiveSummary", "userPersonas", "features", "techStackRecommendations"]
      }
    }
  });

  const prompt = `
    You are an expert Senior AI Product Engineer and Technical Architect.
    Generate a comprehensive, professional Product Requirements Document (PRD) based on the following client discovery inputs:

    Project Name: ${input.projectName}
    Client Name: ${input.clientName}
    Project Goal: ${input.projectGoal}
    Target Audience: ${input.targetAudience}
    Core Features Required: ${input.coreFeaturesRequired.join(', ')}
  `;

  console.log('Sending prompt to Gemini...');
  const result = await model.generateContent(prompt);
  const responseText = result.response.text();
  
  return JSON.parse(responseText) as PRDDocument;
}