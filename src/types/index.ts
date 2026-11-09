export type ProjectStatus = 'DRAFT' | 'PENDING_REVIEW' | 'COMPLETED';
export type AccountTier = 'FREE' | 'PRO';
export type DocumentType = 'PRD' | 'DESIGN_DOC' | 'API_SPEC' | 'DB_SCHEMA';

// Phase 1: The Expanded Form Data (Visuals + Tech)
export interface IntakeData {
  projectName: string;
  clientName: string;
  projectGoal: string;
  targetAudience: string;
  designPreferences: {
    primaryColor?: string;
    themeStyle?: 'Minimalist' | 'Playful' | 'Corporate' | 'Dark Mode' | 'Undecided';
  };
  coreFeaturesRequired: string[];
}

// Phase 2: The AI Audit Upsell
export interface AISuggestion {
  suggestionId: string;
  title: string;
  description: string;
  isAccepted: boolean | null; // null means the user hasn't reviewed it yet
}

// Phase 3: The Generated Output
export interface GeneratedDocument {
  documentType: DocumentType;
  content: any; // We use 'any' here so it can hold the JSON PRD, Design.md string, etc.
  generatedAt: Date;
}

// The Master Project Interface
export interface ProjectRecord {
  status: ProjectStatus;
  tier: AccountTier;
  intakeData: IntakeData;
  aiSuggestions: AISuggestion[];
  generatedDocuments: GeneratedDocument[];
}