import 'dotenv/config';
import { GoogleGenerativeAI, SchemaType } from '@google/generative-ai';
import { type ClientDiscoveryInput, type PRDDocument } from '../types/index.js';
import { randomUUID } from 'crypto';

// 1. Initialize genAI globally so all functions in this file can share it
const apiKey = process.env.GEMINI_API_KEY;

if (!apiKey) {
  throw new Error("CRITICAL: GEMINI_API_KEY is missing in your .env file.");
}

const genAI = new GoogleGenerativeAI(apiKey);

export async function generatePRDFromAI(input: ClientDiscoveryInput): Promise<PRDDocument> {
  const model = genAI.getGenerativeModel({
    model: 'gemini-3.5-flash',
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
  console.log('PRD Generated Successfully✔');
  
  return JSON.parse(responseText) as PRDDocument;
}

// Phase 2 Audit Schema
const AISuggestionSchema = {
  type: SchemaType.ARRAY,
  description: "A list of 3 to 5 critical feature suggestions missing from the client's current scope.",
  items: {
    type: SchemaType.OBJECT,
    properties: {
      title: {
        type: SchemaType.STRING,
        description: "The name of the suggested feature (e.g., 'Push Notifications', 'Role-Based Dashboards')."
      },
      description: {
        type: SchemaType.STRING,
        description: "Why this feature is critical for the project's success and user experience."
      }
    },
    required: ["title", "description"]
  }
};

// Phase 2 Audit Function
export async function auditProjectWithAI(intakeData: any) {
  const model = genAI.getGenerativeModel({
    model: 'gemini-3.5-flash',
    generationConfig: {
      responseMimeType: 'application/json',
      responseSchema: AISuggestionSchema,
    }
  });

  const prompt = `
    You are an elite Senior Product Manager and Software Architect. 
    Review the following client project draft and identify critical missing features, blind spots, or technical requirements they forgot to include.
    
    Here is the comprehensive client intake data:
    ${JSON.stringify(intakeData, null, 2)}
    
    Do not suggest features they already explicitly requested in the intake data. 
    Suggest 3 to 5 high-value additions (e.g., security, analytics, communication, monetization) that would make this a complete, enterprise-grade product.
  `;

  const result = await model.generateContent(prompt);
  const responseText = result.response.text();
  
  // Parse the JSON array returned by the AI
  const suggestions = JSON.parse(responseText);

  // Map over the AI's suggestions and attach the database state fields
  return suggestions.map((s: any) => ({
    suggestionId: randomUUID(),
    title: s.title,
    description: s.description,
    isAccepted: null 
  }));
}