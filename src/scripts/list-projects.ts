import { config } from 'dotenv';
import { loadInstanceConfig } from '../config/plane-config.js';
import { PlaneApiClient } from '../api/client.js';
import { PromptContext } from '../types/prompt.js';
import { ProjectsAPI } from '../api/projects.js';

// Load environment variables
config();

async function main() {
  try {
    // Load configuration
    const config = await loadInstanceConfig();
    console.log('Loaded', Object.keys(config).length, 'Plane instance configurations');

    // Get the first instance
    const [name, instance] = Object.entries(config)[0];
    
    console.log('Using instance:', name);
    console.log('Base URL:', instance.baseUrl);
    console.log('Default workspace:', instance.defaultWorkspace);
    
    const planeInstance = {
      name,
      baseUrl: instance.baseUrl,
      defaultWorkspace: instance.defaultWorkspace || 'cate-ai',
      otherWorkspaces: instance.otherWorkspaces,
      apiKey: instance.apiKey
    };
    
    const context: PromptContext = {
      workspace: instance.defaultWorkspace || '',
      connectionId: name
    };

    // Create API client
    const client = new PlaneApiClient(planeInstance, context);
    
    // Create projects API
    const projectsAPI = new ProjectsAPI(planeInstance);
    
    // List projects
    console.log('Listing projects for workspace:', planeInstance.defaultWorkspace);
    try {
      const projects = await projectsAPI.listProjects(planeInstance.defaultWorkspace);
      console.log('Projects:', JSON.stringify(projects, null, 2));
    } catch (error) {
      console.error('Error listing projects:', error);
    }
  } catch (error) {
    console.error('Failed to run script:', error);
  }
}

main();
