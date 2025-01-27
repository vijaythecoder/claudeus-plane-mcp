#!/usr/bin/env node
import { config } from 'dotenv';
import { McpServer } from './mcp/server.js';
import { loadInstanceConfig } from './config/plane-config.js';
import { PlaneApiClient } from './api/client.js';
import { registerTools } from './mcp/tools.js';
import { projectPrompts } from './prompts/projects/index.js';
import { PromptContext } from './types/prompt.js';

// Load environment variables
config();

// Custom logger that ensures we only write to stderr for non-MCP communication
const log = {
  info: (...args: unknown[]) => console.error('\x1b[32m%s\x1b[0m', '[INFO]', ...args),
  error: (...args: unknown[]) => console.error('\x1b[31m%s\x1b[0m', '[ERROR]', ...args),
  debug: (...args: unknown[]) => console.error('\x1b[36m%s\x1b[0m', '[DEBUG]', ...args)
};

async function main() {
  try {
    // Load configuration
    const config = await loadInstanceConfig();
    log.info('Loaded', Object.keys(config).length, 'Plane instance configurations');

    // Initialize API clients
    const clients = new Map<string, PlaneApiClient>();
    for (const [name, instance] of Object.entries(config)) {
      const planeInstance = {
        name,
        baseUrl: instance.baseUrl,
        defaultWorkspace: instance.defaultWorkspace,
        otherWorkspaces: instance.otherWorkspaces,
        apiKey: instance.apiKey
      };
      
      const context: PromptContext = {
        workspace: instance.defaultWorkspace || '',
        connectionId: name
      };

      const client = new PlaneApiClient(planeInstance, context);
      clients.set(name, client);
      log.info('Initialized API client for instance:', name);
    }

    // Initialize MCP server
    const server = new McpServer();
    log.info('Initialized MCP server');

    // Register tools before connecting
    registerTools(server.getServer(), clients);
    log.info('Registered tools');

    // Register prompts
    for (const prompt of projectPrompts) {
      server.registerPrompt(prompt);
    }
    log.info('Registered prompts');

    // Connect to transport and start server
    await server.initialize();
    log.info('Server initialized');

    await server.start();
    log.info('Server started');
  } catch (error) {
    if (error instanceof Error) {
      log.error('Failed to start server:', error.message);
      log.debug('Stack trace:', error.stack);
    } else {
      log.error('Failed to start server:', String(error));
    }
    process.exit(1);
  }
}

// Handle uncaught errors
process.on('uncaughtException', (error) => {
  log.error('Uncaught exception:', error);
  process.exit(1);
});

process.on('unhandledRejection', (reason) => {
  log.error('Unhandled rejection:', reason);
  process.exit(1);
});

main(); 