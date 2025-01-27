# Transformation Plan to Align with claudeus-wp-mcp Standards

## Overview
This document outlines the necessary changes to align `claudeus-plane-mcp` with the architecture, structure, and standards established in `claudeus-wp-mcp`.

## Complete Analysis (2024-01-25)

### Directory Structure Comparison

#### WP MCP (Reference Implementation)
```
src/
├── api/                  # Domain-specific API clients
│   ├── base-client.ts    # Base API client with error handling
│   ├── posts.ts         # Posts API client
│   ├── pages.ts         # Pages API client
│   ├── media.ts         # Media API client
│   ├── blocks.ts        # Blocks API client
│   ├── themes.ts        # Themes API client
│   └── shop.ts          # Shop API client
├── tools/               # Tool implementations
│   ├── index.ts         # Tool registration
│   ├── content/         # Content management tools
│   │   ├── index.ts     # Tool definitions
│   │   └── handlers.ts  # Tool handlers
│   ├── media/          # Media management tools
│   ├── shop/           # Shop management tools
│   └── discovery/      # Discovery tools
├── mcp/                # MCP protocol implementation
│   ├── server.ts       # Server implementation
│   └── tools.ts        # Tool registration & handling
├── types.ts            # Centralized type definitions
├── config.ts           # Configuration management
└── wordpress-client.ts # Main WordPress client

```

#### Plane MCP (Current Implementation)
```
src/
├── api/               # API implementation
│   ├── base-client.ts # Base API client
│   ├── client.ts      # Main client (mixed concerns)
│   ├── types/        # API types (scattered)
│   ├── client/       # Client implementations
│   └── endpoints/    # Endpoint definitions
├── tools/            # Tool implementations
│   ├── index.ts      # Tool registration
│   ├── projects/     # Project tools (class-based)
│   ├── comments/     # Comment tools
│   ├── tasks/        # Task tools
│   └── users/        # User tools
├── mcp/             # MCP implementation
│   ├── server.ts    # Server implementation
│   ├── tools.ts     # Tool registration
│   ├── transport/   # Transport implementations
│   └── types/       # MCP-specific types
├── types/          # Type definitions (scattered)
└── config/         # Configuration
```

### Critical Architectural Differences

#### 1. API Layer
##### WP MCP (Good):
- Clean separation of concerns with domain-specific clients
- Consistent error handling in base client
- Clear inheritance hierarchy
   - Strong typing for requests/responses

   ```typescript
// WP MCP base-client.ts
   export class BaseApiClient {
     protected handleError(error: AxiosError<ErrorResponse>): never {
       // Proper error handling with types
     }
   }

// WP MCP posts.ts
   export class PostsAPI extends BaseApiClient {
     async getPosts(filters?: PostFilters): Promise<Post[]> {
       return this.get('/posts', filters);
     }
   }
   ```

##### Plane MCP (Needs Improvement):
   - Mixed concerns in client.ts
- Scattered types across directories
- Inconsistent error handling
- Weak typing

   ```typescript
// Current client.ts
export class PlaneApiClient {
    // Mixed concerns, weak typing
    async listProjects(workspace?: string): Promise<unknown> {
        return this.get('/projects');
     }
   }
   ```

#### 2. Tools Layer
##### WP MCP (Good):
- Functional approach with clear separation
- Tools defined separately from handlers
- Clean organization by domain
- Consistent response formatting

   ```typescript
// WP MCP content/index.ts
   export const contentTools: Tool[] = [{
    name: 'wp_content_get_posts',
     description: '...',
    inputSchema: { ... }
}];

// WP MCP content/handlers.ts
export async function handleContentTools(name: string, args: Record<string, unknown>) {
     switch (name) {
        case 'wp_content_get_posts': {
         return {
           content: [{
             type: "text",
             text: JSON.stringify(result, null, 2)
           }]
         };
       }
     }
   }
   ```

##### Plane MCP (Needs Improvement):
- Class-based approach with mixed concerns
- No separation between definition and implementation
   - Inconsistent response formatting
- Complex inheritance

   ```typescript
// Current projects/list.ts
export class ListProjectsTool implements Tool {
    async execute(args: Record<string, unknown>) {
        return {
            result: {  // Wrong! Extra wrapping
                content: [...]
            }
        };
     }
   }
   ```

#### 3. MCP Layer
##### WP MCP (Good):
- Clean server implementation
- Proper tool registration
- Direct response handling
- Clear error management

   ```typescript
// WP MCP tools.ts
server.setRequestHandler(CallToolRequestSchema, async (request) => {
    const result = await handleTool(request);
    return result;  // Direct return, no wrapping
});
```

##### Plane MCP (Needs Improvement):
- Complex server setup
- Incorrect response wrapping
- Scattered MCP types
- Overcomplicated transport handling

   ```typescript
// Current tools.ts
     server.setRequestHandler(CallToolRequestSchema, async (request) => {
    const result = await toolInstance.execute(args);
    return { result };  // Wrong! Extra wrapping
});
```

### Required Changes (In Priority Order)

#### 1. Fix Response Handling (CRITICAL)
   ```typescript
// In src/mcp/tools.ts
- return { result };
+ return result;

// In src/types/mcp.ts
interface ToolResponse {
    isError?: boolean;
    content: Array<{
        type: string;
        text: string;
    }>;
}
```

#### 2. Restructure Tools Layer
1. Move to functional approach:
   ```typescript
   // tools/projects/index.ts
   export const projectTools: Tool[] = [{
       name: 'claudeus_plane_projects__list',
       description: '...',
       inputSchema: { ... }
   }];

   // tools/projects/handlers.ts
   export function handleProjectTools(name: string, args: Record<string, unknown>) {
       switch (name) {
           case 'claudeus_plane_projects__list': return listProjects(args);
     }
   }
   ```

#### 3. Refactor API Layer
1. Create domain-specific clients:
   ```typescript
   api/
   ├── base-client.ts
   ├── projects.ts
   ├── issues.ts
   ├── cycles.ts
   └── modules.ts
   ```

2. Implement proper error handling:
   ```typescript
   export class BaseApiClient {
       protected handleError(error: AxiosError<ErrorResponse>): never {
           throw new PlaneError(
               error.response?.data?.message || error.message,
               error.response?.status || 500
           );
     }
   }
   ```

#### 4. Consolidate Types
1. Move all types to central location:
   ```typescript
   types/
   ├── api.ts      # API types
   ├── mcp.ts      # MCP protocol types
   ├── tools.ts    # Tool types
   └── index.ts    # Type exports
   ```

## Implementation Strategy

### Phase 1: Critical Response Fix (Day 1)
1. Update MCP types
2. Fix response handling in tools.ts
3. Update all tool implementations
4. Test with MCP Inspector

### Phase 2: Tools Refactor (Days 2-3)
1. Create new tool structure
2. Implement functional handlers
3. Migrate existing tools
4. Add tests

### Phase 3: API Refactor (Days 4-5)
1. Create domain-specific clients
2. Implement proper error handling
3. Add request/response types
4. Add tests

### Phase 4: Type System (Day 6)
1. Consolidate types
2. Add validation schemas
3. Update imports
4. Add type tests

### Phase 5: MCP Layer (Days 7-8)
1. Simplify server implementation
2. Update tool registration
3. Add error handling
4. Add tests

### Phase 6: Final Integration (Days 9-10)
1. Integration testing
2. Performance testing
3. Documentation
4. Final review

## Success Criteria
1. All tools work correctly in MCP Inspector
2. Response format matches MCP protocol
3. Clean architecture matching WP MCP
4. Full test coverage
5. Complete documentation
