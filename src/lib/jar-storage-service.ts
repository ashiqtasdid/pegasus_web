import { MongoClient, Db, Collection, ObjectId } from 'mongodb';

// Database connection
const getDatabase = (): Db => {
  const client = new MongoClient(process.env.MONGODB_URI!);
  return client.db("test");
};

// Plugin interface that matches the existing database structure
export interface PluginDocument {
  _id?: ObjectId | string;
  userId: string;
  pluginName: string;
  description?: string;
  minecraftVersion?: string;
  dependencies?: string[];
  files?: Array<{
    path: string;
    content: string;
    type?: string;
  }>;
  metadata?: {
    mainClass?: string;
    version?: string;
    author?: string;
    apiVersion?: string;
  };
  createdAt: Date;
  updatedAt: Date;
  isActive: boolean;
  lastSyncedAt?: Date;
  diskPath?: string;
  totalFiles?: number;
  totalSize?: number;
  jarCompiledAt?: Date;
  jarFile?: Buffer | null; // Binary JAR data (can be null)
  jarFileChecksum?: string;
  jarFileName?: string;
  jarFileSize?: number;
}

class JarStorageService {
  private collection: Collection<PluginDocument>;

  constructor() {
    const db = getDatabase();
    this.collection = db.collection('plugins');
  }

  // Get JAR file from existing plugin document
  async getJarFile(userId: string, pluginName: string): Promise<PluginDocument | null> {
    return await this.collection.findOne({ 
      userId, 
      pluginName, 
      isActive: true,
      jarFile: { $exists: true, $ne: null }
    });
  }

  // Download JAR file and increment download count (if we track it)
  async downloadJarFile(userId: string, pluginName: string): Promise<{
    buffer: Buffer;
    fileName: string;
    fileSize: number;
    contentType: string;
  } | null> {
    const plugin = await this.collection.findOne({ 
      userId, 
      pluginName, 
      isActive: true,
      jarFile: { $exists: true, $ne: null }
    });
    
    if (!plugin || !plugin.jarFile) {
      return null;
    }

    return {
      buffer: plugin.jarFile,
      fileName: plugin.jarFileName || `${pluginName}.jar`,
      fileSize: plugin.jarFileSize || plugin.jarFile.length,
      contentType: 'application/java-archive'
    };
  }

  // Check if JAR file exists in plugin document
  async jarExists(userId: string, pluginName: string): Promise<boolean> {
    const count = await this.collection.countDocuments({ 
      userId, 
      pluginName, 
      isActive: true,
      jarFile: { $exists: true, $ne: null }
    });
    return count > 0;
  }

  // Get JAR info without downloading
  async getJarInfo(userId: string, pluginName: string): Promise<{
    available: boolean;
    fileName?: string;
    fileSize?: number;
    lastModified?: string;
    checksum?: string;
    downloadUrl?: string;
    metadata?: {
      version?: string;
      author?: string;
      description?: string;
      minecraftVersion?: string;
      dependencies?: string[];
    };
  }> {
    const plugin = await this.collection.findOne({ 
      userId, 
      pluginName, 
      isActive: true 
    });
    
    if (!plugin || !plugin.jarFile) {
      return { available: false };
    }

    return {
      available: true,
      fileName: plugin.jarFileName || `${pluginName}.jar`,
      fileSize: plugin.jarFileSize || plugin.jarFile.length,
      lastModified: plugin.jarCompiledAt?.toISOString() || plugin.updatedAt?.toISOString() || new Date().toISOString(),
      checksum: plugin.jarFileChecksum,
      downloadUrl: `/api/plugin/download/${encodeURIComponent(userId)}/${encodeURIComponent(pluginName)}`,
      metadata: {
        version: plugin.metadata?.version || '1.0.0',
        author: plugin.metadata?.author || 'Unknown',
        description: plugin.description || 'No description available',
        minecraftVersion: plugin.minecraftVersion || '1.20.1',
        dependencies: plugin.dependencies || []
      }
    };
  }

  // Get plugins with JAR files for a user
  async getUserJarFiles(userId: string): Promise<PluginDocument[]> {
    return await this.collection
      .find({ 
        userId, 
        isActive: true,
        jarFile: { $exists: true, $ne: null }
      })
      .sort({ jarCompiledAt: -1, updatedAt: -1 })
      .toArray();
  }

  // Get JAR statistics
  async getJarStats(): Promise<{
    totalJars: number;
    totalSize: number;
    totalDownloads: number;
    uniqueUsers: number;
  }> {
    const pipeline = [
      {
        $match: {
          isActive: true,
          jarFile: { $exists: true, $ne: null }
        }
      },
      {
        $group: {
          _id: null,
          totalJars: { $sum: 1 },
          totalSize: { $sum: '$jarFileSize' },
          uniqueUsers: { $addToSet: '$userId' }
        }
      },
      {
        $project: {
          totalJars: 1,
          totalSize: 1,
          totalDownloads: { $literal: 0 }, // We don't track downloads in current schema
          uniqueUsers: { $size: '$uniqueUsers' }
        }
      }
    ];

    const results = await this.collection.aggregate(pipeline).toArray();
    
    if (results.length === 0) {
      return { totalJars: 0, totalSize: 0, totalDownloads: 0, uniqueUsers: 0 };
    }

    const result = results[0] as {
      totalJars?: number;
      totalSize?: number;
      totalDownloads?: number;
      uniqueUsers?: number;
    };
    return {
      totalJars: result.totalJars || 0,
      totalSize: result.totalSize || 0,
      totalDownloads: result.totalDownloads || 0,
      uniqueUsers: result.uniqueUsers || 0
    };
  }

  // Get plugin by ID or name (for compatibility)
  async getPlugin(userId: string, pluginIdentifier: string): Promise<PluginDocument | null> {
    // Try by plugin name first
    let plugin = await this.collection.findOne({ 
      userId, 
      pluginName: pluginIdentifier, 
      isActive: true 
    });
    
    if (!plugin && ObjectId.isValid(pluginIdentifier)) {
      // Try by ObjectId if name search failed
      plugin = await this.collection.findOne({ 
        _id: new ObjectId(pluginIdentifier),
        userId,
        isActive: true 
      });
    }
    
    return plugin;
  }
}

// Export singleton instance
export const jarStorageService = new JarStorageService();
