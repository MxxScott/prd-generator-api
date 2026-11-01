// Interface for the input to the client discovery process
export interface ClientDiscoveryInput {
  projectName: string;
  clientName: string;
  projectGoal: string;
  targetAudience: string;
  coreFeaturesRequired: string[];
}

// Interface for the output of the PRD generation process
export interface PRDDocument {
  title: string;
  executiveSummary: string;
  userPersonas: string[];
  features: {
    featureName: string;
    description: string;
    priority: "High" | "Medium" | "Low";
  }[];
  techStackRecommendations: string[];
}