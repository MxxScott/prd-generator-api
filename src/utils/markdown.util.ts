import { type PRDDocument, type ClientDiscoveryInput } from '../types/index.js';

export function generateMarkdownPRD(input: ClientDiscoveryInput, prd: PRDDocument): string {
  const date = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

  let md = `# ${prd.title}\n\n`;
  
  md += `**Client:** ${input.clientName}\n`;
  md += `**Project:** ${input.projectName}\n`;
  md += `**Date Generated:** ${date}\n\n`;
  md += `---\n\n`;

  md += `## Executive Summary\n\n`;
  md += `${prd.executiveSummary}\n\n`;

  md += `## Target Audience & User Personas\n\n`;
  md += `**Primary Audience:** ${input.targetAudience}\n\n`;
  prd.userPersonas.forEach(persona => {
    md += `- ${persona}\n`;
  });
  md += `\n`;

  md += `## Feature Requirements\n\n`;
  prd.features.forEach(feature => {
    md += `### ${feature.featureName} [${feature.priority} Priority]\n\n`;
    md += `${feature.description}\n\n`;
  });

  md += `## Tech Stack Recommendations\n\n`;
  prd.techStackRecommendations.forEach(tech => {
    md += `- ${tech}\n`;
  });

  return md;
}