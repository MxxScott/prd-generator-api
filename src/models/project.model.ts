// src/models/project.model.ts
import { Schema, model, type Document } from 'mongoose';
import { type ProjectRecord } from '../types/index.js';

export interface IProjectModel extends ProjectRecord, Document {
  createdAt: Date;
  updatedAt: Date;
}

const ProjectSchema = new Schema<IProjectModel>(
  {
    status: { 
      type: String, 
      enum: ['DRAFT', 'PENDING_REVIEW', 'COMPLETED'], 
      default: 'DRAFT',
      required: true 
    },
    tier: { 
      type: String, 
      enum: ['FREE', 'PRO'], 
      default: 'FREE',
      required: true 
    },
    intakeData: {
      projectName: { type: String, required: true },
      clientName: { type: String, required: true },
      projectGoal: { type: String, required: true },
      targetAudience: { type: String, required: true },
      designPreferences: {
        primaryColor: { type: String },
        themeStyle: { 
          type: String, 
          enum: ['Minimalist', 'Playful', 'Corporate', 'Dark Mode', 'Undecided'] 
        }
      },
      coreFeaturesRequired: [{ type: String }]
    },
    aiSuggestions: [
      {
        suggestionId: { type: String, required: true },
        title: { type: String, required: true },
        description: { type: String, required: true },
        isAccepted: { type: Boolean, default: null }
      }
    ],
    generatedDocuments: [
      {
        documentType: { 
          type: String, 
          enum: ['PRD', 'DESIGN_DOC', 'API_SPEC', 'DB_SCHEMA'], 
          required: true 
        },
        content: { type: Schema.Types.Mixed, required: true }, // Mixed allows structured JSON or raw Markdown strings
        generatedAt: { type: Date, default: Date.now }
      }
    ]
  },
  { timestamps: true }
);

export const ProjectModel = model<IProjectModel>('Project', ProjectSchema);