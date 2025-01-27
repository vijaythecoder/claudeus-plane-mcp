# Claudeus Plane MCP Documentation

## Overview

Claudeus Plane MCP is an AI-powered project management tool that integrates with Plane instances through the MCP protocol. It provides a comprehensive set of tools for managing projects, issues, cycles, and modules in Plane.

## Configuration

### Environment Variables

- `PLANE_INSTANCES_PATH`: Path to Plane instances configuration file
- `PORT`: Server port for health checks
- `NODE_ENV`: Node environment (development/production)
- `DEBUG`: Debug configuration pattern
- `AUTH_TYPE`: Authentication type (api_key)
- `SSL_VERIFY`: SSL certificate verification
- `LOG_LEVEL`: Logging level
- `BATCH_SIZE`: Maximum batch processing size

### Plane Instances Configuration

Example `plane-instances.json`:
```json
{
  "instances": [
    {
      "name": "example",
      "url": "https://plane.example.com",
      "apiKey": "your-api-key"
    }
  ]
}
```

## Tools

### Project Management

- `list_projects`: List all projects in a workspace
- `create_project`: Create a new project
- `update_project`: Update project details
- `delete_project`: Delete a project (dangerous operation)

### Issue Management

- `list_issues`: List issues in a project
- `create_issue`: Create a new issue
- `update_issue`: Update issue details
- `delete_issue`: Delete an issue (dangerous operation)

### Cycle Management

- `list_cycles`: List cycles in a project
- `create_cycle`: Create a new cycle
- `update_cycle`: Update cycle details
- `delete_cycle`: Delete a cycle (dangerous operation)

### Module Management

- `list_modules`: List modules in a project
- `create_module`: Create a new module
- `update_module`: Update module details
- `delete_module`: Delete a module (dangerous operation)

## Security

- All dangerous operations require explicit confirmation
- API keys must be stored securely
- SSL verification is enabled by default
- Access is limited to configured instances only

## Error Handling

- All errors include detailed messages
- Debug mode provides additional information
- Logging levels can be configured as needed

## Best Practices

1. Always use environment variables for sensitive data
2. Regularly rotate API keys
3. Keep instance configurations up to date
4. Monitor tool usage and access patterns
5. Follow proper error handling procedures

## Support

For support or questions, contact:
- 📧 CTO: amadeus.hritani@simhop.se
- 📱 Phone: +46-76-427-1243 