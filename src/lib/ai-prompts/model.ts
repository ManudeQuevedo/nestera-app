import { google } from '@ai-sdk/google';

/**
 * Centralized AI models using the default v1beta API
 * (v1beta is required for Gemini 1.5 models and structured output)
 */
export const AI_MODELS = {
  reasoning: google('gemini-2.5-flash'), // Use 2.5-pro once billing is enabled
  fast: google('gemini-2.5-flash'),
};

export default AI_MODELS;