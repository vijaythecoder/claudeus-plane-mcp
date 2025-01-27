import { PromptDefinition } from '../../types/prompt.js';
import {
  analyzeWorkspaceHealth,
  suggestResourceAllocation,
  recommendProjectStructure
} from './definitions.js';

export const projectPrompts: PromptDefinition[] = [
  analyzeWorkspaceHealth,
  suggestResourceAllocation,
  recommendProjectStructure
]; 