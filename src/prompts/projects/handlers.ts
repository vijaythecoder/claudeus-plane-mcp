import { PromptHandler, PromptContext, PromptResponse } from '../../types/prompt.js';
import { PlaneApiClient, NotificationOptions, ToolExecutionOptions } from '../../api/client.js';
import { PlaneInstance } from '../../config/plane-config.js';

interface Project {
  name: string;
  total_members: number;
  total_cycles: number;
  total_modules: number;
  [key: string]: any;
}

interface ProjectMetrics {
  name: string;
  members: number;
  cycles: number;
  modules: number;
  complexity: number;
}

interface ProjectStructureAnalysis {
  name: string;
  missingFeatures: string[];
  cycleGap: number;
  moduleGap: number;
  memberGap: number;
}

interface ProjectRecommendation {
  project: string;
  recommendations: string[];
}

export const analyzeWorkspaceHealthHandler: PromptHandler = async (args: Record<string, unknown>, context: PromptContext): Promise<PromptResponse> => {
  try {
    const planeInstance: PlaneInstance = {
      name: 'default',
      baseUrl: process.env.PLANE_BASE_URL || '',
      defaultWorkspace: 'cate-ai',
      apiKey: process.env.PLANE_API_KEY || ''
    };
    
    const client = new PlaneApiClient(planeInstance, context);
    const workspace_slug = args.workspace_slug as string | undefined;
    const include_archived = args.include_archived as boolean | undefined;

    // Get projects using the tool
    const toolResult = await client.executeTool('claudeus_plane_projects__list', {
      progressToken: workspace_slug || '',
      workspace: workspace_slug || 'cate-ai'
    });
    
    // Note: include_archived is handled separately in the actual implementation

    if (!toolResult?.content?.[0]?.text) {
      throw new Error('Invalid tool result format');
    }

    const projects = JSON.parse(toolResult.content[0].text) as Project[];

    // Analyze project health metrics
    const totalProjects = projects.length;
    const metrics = {
      memberDistribution: projects.map((p: Project) => ({
        name: p.name,
        memberCount: p.total_members
      })),
      cycleUsage: projects.map((p: Project) => ({
        name: p.name,
        cycleCount: p.total_cycles
      })),
      moduleUsage: projects.map((p: Project) => ({
        name: p.name,
        moduleCount: p.total_modules
      }))
    };

    // Generate insights
    const insights: string[] = [];
    
    // Member distribution insights
    const avgMembers = metrics.memberDistribution.reduce((acc: number, p) => acc + p.memberCount, 0) / totalProjects;
    insights.push(`Average team size: ${avgMembers.toFixed(1)} members per project`);
    
    const underStaffed = metrics.memberDistribution.filter(p => p.memberCount < avgMembers * 0.5);
    if (underStaffed.length > 0) {
      insights.push(`Potentially understaffed projects: ${underStaffed.map(p => p.name).join(', ')}`);
    }

    // Feature usage insights
    const lowCycleUsage = metrics.cycleUsage.filter(p => p.cycleCount === 0);
    if (lowCycleUsage.length > 0) {
      insights.push(`Projects not using cycles: ${lowCycleUsage.map(p => p.name).join(', ')}`);
    }

    const lowModuleUsage = metrics.moduleUsage.filter(p => p.moduleCount === 0);
    if (lowModuleUsage.length > 0) {
      insights.push(`Projects not using modules: ${lowModuleUsage.map(p => p.name).join(', ')}`);
    }

    const response: PromptResponse = {
      messages: [{
        role: 'assistant',
        content: {
          type: 'text',
          text: '# Workspace Health Analysis\n\n' +
                `Analyzed ${totalProjects} projects${workspace_slug ? ` in workspace ${workspace_slug}` : ''}\n\n` +
                '## Key Insights\n\n' +
                insights.map(i => `- ${i}`).join('\n') + '\n\n' +
                '## Recommendations\n\n' +
                '1. Consider redistributing team members for more balanced project staffing\n' +
                '2. Encourage use of cycles for better project planning\n' +
                '3. Leverage modules for improved project organization'
        }
      }],
      metadata: {
        metrics,
        insights
      }
    };

    return response;
  } catch (error) {
    console.error('Failed to analyze workspace health:', error);
    return {
      messages: [{
        role: 'assistant',
        content: {
          type: 'text',
          text: `Error analyzing workspace health: ${error instanceof Error ? error.message : String(error)}`
        }
      }],
      metadata: {
        error: error instanceof Error ? error.message : String(error)
      }
    };
  }
};

export const suggestResourceAllocationHandler: PromptHandler = async (args: Record<string, unknown>, context: PromptContext): Promise<PromptResponse> => {
  try {
    const planeInstance = {
      name: 'default',
      baseUrl: process.env.PLANE_BASE_URL || '',
      defaultWorkspace: 'cate-ai',
      apiKey: process.env.PLANE_API_KEY || ''
    };
    
    const client = new PlaneApiClient(planeInstance, context);
    const workspace_slug = args.workspace_slug as string | undefined;
    const focus_area = (args.focus_area as string) || 'members';

    // Get projects using the tool
    const toolResult = await client.executeTool('claudeus_plane_projects__list', {
      progressToken: workspace_slug || '',
      workspace: workspace_slug
    });

    if (!toolResult?.content?.[0]?.text) {
      throw new Error('Invalid tool result format');
    }

    const projects = JSON.parse(toolResult.content[0].text) as Project[];

    // Analyze current allocation
    const allocation: ProjectMetrics[] = projects.map(p => ({
      name: p.name,
      members: p.total_members,
      cycles: p.total_cycles,
      modules: p.total_modules,
      complexity: (p.total_cycles * 0.4) + (p.total_modules * 0.6) // Weighted complexity score
    }));

    // Generate recommendations based on focus area
    const recommendations: string[] = [];
    switch (focus_area) {
      case 'members': {
        const avgMembers = allocation.reduce((acc: number, p) => acc + p.members, 0) / projects.length;
        allocation.forEach(p => {
          const recommendedMembers = Math.ceil(p.complexity / avgMembers * p.members);
          if (recommendedMembers !== p.members) {
            recommendations.push(`${p.name}: ${p.members} → ${recommendedMembers} members (based on complexity)`);
          }
        });
        break;
      }
      case 'cycles': {
        const avgCycles = allocation.reduce((acc: number, p) => acc + p.cycles, 0) / projects.length;
        allocation.forEach(p => {
          if (p.cycles < avgCycles * 0.5) {
            recommendations.push(`${p.name}: Consider increasing cycle usage (current: ${p.cycles}, avg: ${avgCycles.toFixed(1)})`);
          }
        });
        break;
      }
      case 'modules': {
        const avgModules = allocation.reduce((acc: number, p) => acc + p.modules, 0) / projects.length;
        allocation.forEach(p => {
          if (p.modules < avgModules * 0.5) {
            recommendations.push(`${p.name}: Consider increasing module usage (current: ${p.modules}, avg: ${avgModules.toFixed(1)})`);
          }
        });
        break;
      }
    }

    const response: PromptResponse = {
      messages: [{
        role: 'assistant',
        content: {
          type: 'text',
          text: '# Resource Allocation Recommendations\n\n' +
                `Focus Area: ${focus_area}\n\n` +
                '## Recommendations\n\n' +
                recommendations.map(r => `- ${r}`).join('\n') + '\n\n' +
                '## Additional Notes\n\n' +
                '- Recommendations are based on project complexity and current resource usage\n' +
                '- Consider team expertise and project priorities when implementing changes'
        }
      }],
      metadata: {
        allocation,
        recommendations
      }
    };

    return response;
  } catch (error) {
    console.error('Failed to analyze resource allocation:', error);
    return {
      messages: [{
        role: 'assistant',
        content: {
          type: 'text',
          text: `Error analyzing resource allocation: ${error instanceof Error ? error.message : String(error)}`
        }
      }],
      metadata: {
        error: error instanceof Error ? error.message : String(error)
      }
    };
  }
};

export const recommendProjectStructureHandler: PromptHandler = async (args: Record<string, unknown>, context: PromptContext): Promise<PromptResponse> => {
  try {
    const planeInstance = {
      name: 'default',
      baseUrl: process.env.PLANE_BASE_URL || '',
      defaultWorkspace: 'cate-ai',
      apiKey: process.env.PLANE_API_KEY || ''
    };
    
    const client = new PlaneApiClient(planeInstance, context);
    const workspace_slug = args.workspace_slug as string | undefined;
    const template_project = args.template_project as string | undefined;

    // Get projects using the tool
    const toolResult = await client.executeTool('claudeus_plane_projects__list', {
      progressToken: workspace_slug || '',
      workspace: workspace_slug
    });

    if (!toolResult?.content?.[0]?.text) {
      throw new Error('Invalid tool result format');
    }

    const projects = JSON.parse(toolResult.content[0].text) as Project[];

    // Define best practices
    const bestPractices = {
      minCycles: 1,
      minModules: 2,
      minMembers: 2,
      recommendedFeatures: ['cycles', 'modules', 'project_lead'] as const
    };

    // If template project specified, use its metrics as best practices
    if (template_project) {
      const templateData = projects.find((p: Project) => p.name === template_project);
      if (templateData) {
        bestPractices.minCycles = templateData.total_cycles;
        bestPractices.minModules = templateData.total_modules;
        bestPractices.minMembers = templateData.total_members;
      }
    }

    // Analyze each project
    const structureAnalysis: ProjectStructureAnalysis[] = projects.map((p: Project) => ({
      name: p.name,
      missingFeatures: bestPractices.recommendedFeatures.filter((f) => !p[f]),
      cycleGap: Math.max(0, bestPractices.minCycles - p.total_cycles),
      moduleGap: Math.max(0, bestPractices.minModules - p.total_modules),
      memberGap: Math.max(0, bestPractices.minMembers - p.total_members)
    }));

    // Generate recommendations
    const recommendations: ProjectRecommendation[] = structureAnalysis
      .filter((p) => p.missingFeatures.length > 0 || p.cycleGap > 0 || p.moduleGap > 0 || p.memberGap > 0)
      .map((p) => ({
        project: p.name,
        recommendations: [
          ...p.missingFeatures.map((f) => `Enable ${f} feature`),
          p.cycleGap > 0 ? `Add ${p.cycleGap} more cycle(s)` : null,
          p.moduleGap > 0 ? `Add ${p.moduleGap} more module(s)` : null,
          p.memberGap > 0 ? `Add ${p.memberGap} more team member(s)` : null
        ].filter((rec): rec is string => rec !== null)
      }));

    const response: PromptResponse = {
      messages: [{
        role: 'assistant',
        content: {
          type: 'text',
          text: '# Project Structure Recommendations\n\n' +
                (template_project ? `Using "${template_project}" as template\n\n` : 'Using best practices as template\n\n') +
                '## Project-Specific Recommendations\n\n' +
                recommendations.map((r) => 
                  `### ${r.project}\n` +
                  r.recommendations.map((rec) => `- ${rec}`).join('\n')
                ).join('\n\n') + '\n\n' +
                '## General Guidelines\n\n' +
                '- Maintain consistent project structure across workspace\n' +
                '- Regularly review and update project organization\n' +
                '- Document project structure decisions'
        }
      }],
      metadata: {
        bestPractices,
        structureAnalysis,
        recommendations
      }
    };

    return response;
  } catch (error) {
    console.error('Failed to analyze project structure:', error);
    return {
      messages: [{
        role: 'assistant',
        content: {
          type: 'text',
          text: `Error analyzing project structure: ${error instanceof Error ? error.message : String(error)}`
        }
      }],
      metadata: {
        error: error instanceof Error ? error.message : String(error)
      }
    };
  }
};

export async function handleProjectPrompts(
  promptId: string,
  args: Record<string, unknown>,
  client: PlaneApiClient
): Promise<PromptResponse> {
  try {
    switch (promptId) {
      case 'analyze_workspace_health': {
        const result = await client.listProjects(client.instance.defaultWorkspace);
        return {
          messages: [{
            role: 'assistant',
            content: {
              type: 'text',
              text: JSON.stringify(result, null, 2)
            }
          }]
        };
      }

      case 'suggest_resource_allocation': {
        const result = await client.listProjects(client.instance.defaultWorkspace);
        return {
          messages: [{
            role: 'assistant',
            content: {
              type: 'text',
              text: JSON.stringify(result, null, 2)
            }
          }]
        };
      }

      case 'recommend_project_structure': {
        const result = await client.listProjects(client.instance.defaultWorkspace);
        return {
          messages: [{
            role: 'assistant',
            content: {
              type: 'text',
              text: JSON.stringify(result, null, 2)
            }
          }]
        };
      }

      default:
        throw new Error(`Unknown prompt: ${promptId}`);
    }
  } catch (error) {
    return {
      messages: [{
        role: 'assistant',
        content: {
          type: 'text',
          text: `Error: ${error instanceof Error ? error.message : String(error)}`
        }
      }]
    };
  }
} 
