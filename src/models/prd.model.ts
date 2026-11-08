import { Schema, model, type Document } from 'mongoose';
import { type PRDDocument, type ClientDiscoveryInput } from '../types/index.js';

// 1. The Interface: Merging our custom types with Mongoose's Document properties (like _id)
export interface IPRDRecord extends Document {
  input: ClientDiscoveryInput;
  prd: PRDDocument;
  createdAt: Date;
  updatedAt: Date;
}

// 2. The Schema: Enforcing the exact shape at runtime
const PRDSchema = new Schema<IPRDRecord>(
  {
    input: {
      projectName: { type: String, required: true },
      clientName: { type: String, required: true },
      projectGoal: { type: String, required: true },
      targetAudience: { type: String, required: true },
      coreFeaturesRequired: [{ type: String, required: true }] // Array of strings
    },
    prd: {
      title: { type: String, required: true },
      executiveSummary: { type: String, required: true },
      userPersonas: [{ type: String, required: true }],
      features: [
        {
          featureName: { type: String, required: true },
          description: { type: String, required: true },
          priority: { type: String, enum: ['High', 'Medium', 'Low'], required: true } 
        }
      ],
      techStackRecommendations: [{ type: String, required: true }]
    }
  },
  { 
    // Automatically manages 'createdAt' and 'updatedAt' fields
    timestamps: true 
  }
);

export const PRDModel = model<IPRDRecord>('PRD', PRDSchema);