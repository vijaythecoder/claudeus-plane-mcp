import fs from 'fs/promises';
import path from 'path';
import { z } from 'zod';
import { PlaneConfig as PlaneConfigType, PlaneInstanceConfigSchema } from '../api/types/config.js';

export interface PlaneInstance {
    name: string;
    baseUrl: string;
    defaultWorkspace: string;
    otherWorkspaces?: string[];
    apiKey: string;
}

export interface PlaneConfig {
    [key: string]: PlaneInstance;
}

export const DEFAULT_INSTANCE = 'cateai';

export async function loadInstanceConfig(): Promise<PlaneConfig> {
    const configPath = process.env.PLANE_INSTANCES_PATH || 'plane-instances.json';
    
    try {
        const configContent = await fs.readFile(configPath, 'utf-8');
        const config = JSON.parse(configContent);
        
        // Validate config structure
        if (!config || typeof config !== 'object') {
            throw new Error('Invalid config format: must be an object');
        }
        
        return config;
    } catch (error) {
        if (error instanceof Error) {
            throw new Error(`Failed to load Plane instances config: ${error.message}`);
        }
        throw error;
    }
}

export async function loadPlaneConfig(): Promise<PlaneConfigType> {
    try {
        const configPath = process.env.PLANE_INSTANCES_PATH || './plane-instances.json';
        const configData = await fs.readFile(configPath, 'utf-8');
        const config = JSON.parse(configData);

        // Validate each instance configuration
        const validatedConfig: PlaneConfigType = {};
        for (const [alias, instance] of Object.entries(config)) {
            try {
                validatedConfig[alias] = PlaneInstanceConfigSchema.parse(instance);
            } catch (error) {
                console.error(`Invalid configuration for instance ${alias}:`, error);
                throw error;
            }
        }

        return validatedConfig;
    } catch (error) {
        if (error instanceof Error) {
            throw new Error(`Failed to load Plane configuration: ${error.message}`);
        }
        throw new Error('Failed to load Plane configuration');
    }
} 