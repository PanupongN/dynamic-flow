import fs from 'fs-extra';
import { join } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Storage paths
const DATA_DIR = join(__dirname, '../../data');
const FLOWS_FILE = join(DATA_DIR, 'flows.json');
const RESPONSES_FILE = join(DATA_DIR, 'responses.json');
const ANALYTICS_FILE = join(DATA_DIR, 'analytics.json');

// Initialize storage directories and files
export async function initializeStorage() {
  try {
    // Ensure data directory exists
    await fs.ensureDir(DATA_DIR);
    
    // Initialize flows file
    if (!await fs.pathExists(FLOWS_FILE)) {
      await fs.writeJson(FLOWS_FILE, [], { spaces: 2 });
      console.log('✅ Created flows.json');
    }
    
    // Initialize responses file
    if (!await fs.pathExists(RESPONSES_FILE)) {
      await fs.writeJson(RESPONSES_FILE, [], { spaces: 2 });
      console.log('✅ Created responses.json');
    }
    
    // Initialize analytics file
    if (!await fs.pathExists(ANALYTICS_FILE)) {
      await fs.writeJson(ANALYTICS_FILE, {
        totalViews: 0,
        totalSubmissions: 0,
        flows: {}
      }, { spaces: 2 });
      console.log('✅ Created analytics.json');
    }
    
    console.log('📂 Storage initialized successfully');
  } catch (error) {
    console.error('❌ Failed to initialize storage:', error);
    throw error;
  }
}

// Generic JSON file operations
export class JsonStorage<T> {
  private filePath: string;

  constructor(filePath: string) {
    this.filePath = filePath;
  }

  async read(): Promise<T[]> {
    try {
      const data = await fs.readJson(this.filePath);
      return Array.isArray(data) ? data : [];
    } catch (error) {
      console.error(`Error reading ${this.filePath}:`, error);
      return [];
    }
  }

  async write(data: T[]): Promise<void> {
    try {
      await fs.writeJson(this.filePath, data, { spaces: 2 });
    } catch (error) {
      console.error(`Error writing ${this.filePath}:`, error);
      throw error;
    }
  }

  async findById(id: string): Promise<T | null> {
    const items = await this.read();
    return items.find((item: any) => item.id === id) || null;
  }

  async create(item: T): Promise<T> {
    const items = await this.read();
    items.push(item);
    await this.write(items);
    return item;
  }

  async update(id: string, updates: Partial<T>): Promise<T | null> {
    const items = await this.read();
    const index = items.findIndex((item: any) => item.id === id);
    
    if (index === -1) return null;
    
    items[index] = { ...items[index], ...updates };
    await this.write(items);
    return items[index];
  }

  async delete(id: string): Promise<boolean> {
    const items = await this.read();
    const filteredItems = items.filter((item: any) => item.id !== id);
    
    if (filteredItems.length === items.length) return false;
    
    await this.write(filteredItems);
    return true;
  }

  async search(query: Record<string, any>): Promise<T[]> {
    const items = await this.read();
    return items.filter((item: any) => {
      return Object.entries(query).every(([key, value]) => {
        if (typeof value === 'string') {
          return item[key]?.toString().toLowerCase().includes(value.toLowerCase());
        }
        return item[key] === value;
      });
    });
  }
}

// Storage instances
export const flowsStorage = new JsonStorage(FLOWS_FILE);
export const responsesStorage = new JsonStorage(RESPONSES_FILE);

// Analytics utilities
export async function updateAnalytics(flowId: string, action: 'view' | 'submit') {
  try {
    const analytics = await fs.readJson(ANALYTICS_FILE);
    
    if (action === 'view') {
      analytics.totalViews += 1;
      if (!analytics.flows[flowId]) {
        analytics.flows[flowId] = { views: 0, submissions: 0 };
      }
      analytics.flows[flowId].views += 1;
    } else if (action === 'submit') {
      analytics.totalSubmissions += 1;
      if (!analytics.flows[flowId]) {
        analytics.flows[flowId] = { views: 0, submissions: 0 };
      }
      analytics.flows[flowId].submissions += 1;
    }
    
    await fs.writeJson(ANALYTICS_FILE, analytics, { spaces: 2 });
  } catch (error) {
    console.error('Error updating analytics:', error);
  }
}

export async function getAnalytics(flowId?: string) {
  try {
    const analytics = await fs.readJson(ANALYTICS_FILE);
    
    if (flowId) {
      return {
        flowId,
        views: analytics.flows[flowId]?.views || 0,
        submissions: analytics.flows[flowId]?.submissions || 0,
        conversionRate: analytics.flows[flowId]?.views 
          ? ((analytics.flows[flowId]?.submissions || 0) / analytics.flows[flowId].views * 100).toFixed(2)
          : '0.00'
      };
    }
    
    return analytics;
  } catch (error) {
    console.error('Error getting analytics:', error);
    return null;
  }
}
