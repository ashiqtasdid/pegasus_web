import { MongoClient, Db, Collection, ObjectId } from 'mongodb';

// Database connection
const getDatabase = (): Db => {
  const client = new MongoClient(process.env.MONGODB_URI!);
  return client.db("pegasus_auth");
};

// Plugin interface
export interface Plugin {
  _id?: ObjectId | string;
  userId: string;
  pluginName: string;
  description?: string;
  minecraftVersion?: string;
  dependencies?: string[];
  files?: PluginFile[];
  metadata?: {
    mainClass?: string;
    version?: string;
    author?: string;
    apiVersion?: string;
  };
  createdAt: Date;
  updatedAt: Date;
  isActive: boolean;
}

export interface PluginFile {
  path: string;
  content: string;
  type: string; // 'java', 'yml', 'properties', etc.
}

// Plugin creation data
export interface CreatePluginData {
  userId: string;
  pluginName: string;
  description?: string;
  minecraftVersion?: string;
  dependencies?: string[];
  files?: PluginFile[];
  metadata?: {
    mainClass?: string;
    version?: string;
    author?: string;
    apiVersion?: string;
  };
}

class PluginService {
  private collection: Collection<Plugin>;

  constructor() {
    const db = getDatabase();
    this.collection = db.collection('plugins');
  }

  // Create a new plugin
  async createPlugin(data: CreatePluginData): Promise<Plugin> {
    const plugin: Plugin = {
      ...data,
      createdAt: new Date(),
      updatedAt: new Date(),
      isActive: true,
    };

    const result = await this.collection.insertOne(plugin);
    return { ...plugin, _id: result.insertedId.toString() };
  }

  // Get plugins by user ID
  async getPluginsByUserId(userId: string): Promise<Plugin[]> {
    return await this.collection
      .find({ userId, isActive: true })
      .sort({ createdAt: -1 })
      .toArray();
  }  // Get a specific plugin
  async getPlugin(pluginId: string): Promise<Plugin | null> {
    // Check if pluginId is a valid ObjectId (24 character hex string)
    if (pluginId.length === 24 && /^[0-9a-fA-F]{24}$/.test(pluginId)) {
      return await this.collection.findOne({ _id: new ObjectId(pluginId) });
    } else {
      // If not a valid ObjectId, treat it as a plugin name and search with testuser
      return await this.collection.findOne({ 
        pluginName: pluginId, 
        userId: 'testuser',
        isActive: true 
      });
    }
  }

  // Get a plugin by name and userId
  async getPluginByName(userId: string, pluginName: string): Promise<Plugin | null> {
    return await this.collection.findOne({ 
      userId, 
      pluginName, 
      isActive: true 
    });
  }

  // Update plugin
  async updatePlugin(pluginId: string, updateData: Partial<Plugin>): Promise<Plugin | null> {
    const result = await this.collection.findOneAndUpdate(
      { _id: new ObjectId(pluginId) },
      { 
        $set: { 
          ...updateData, 
          updatedAt: new Date() 
        } 
      },
      { returnDocument: 'after' }
    );
    return result;
  }

  // Delete plugin (soft delete)
  async deletePlugin(pluginId: string): Promise<boolean> {
    const result = await this.collection.updateOne(
      { _id: new ObjectId(pluginId) },
      { 
        $set: { 
          isActive: false,
          updatedAt: new Date()
        } 
      }
    );
    return result.modifiedCount > 0;
  }

  // Check if plugin name exists for user
  async pluginNameExists(userId: string, pluginName: string): Promise<boolean> {
    const count = await this.collection.countDocuments({
      userId,
      pluginName,
      isActive: true
    });
    return count > 0;
  }

  // Get plugin statistics for user
  async getUserPluginStats(userId: string): Promise<{
    totalPlugins: number;
    recentPlugins: Plugin[];
    favoriteMinecraftVersions: string[];
  }> {
    const totalPlugins = await this.collection.countDocuments({
      userId,
      isActive: true
    });

    const recentPlugins = await this.collection
      .find({ userId, isActive: true })
      .sort({ createdAt: -1 })
      .limit(5)
      .toArray();

    // Get most used Minecraft versions
    const versionStats = await this.collection.aggregate([
      { $match: { userId, isActive: true, minecraftVersion: { $exists: true } } },
      { $group: { _id: '$minecraftVersion', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 5 }
    ]).toArray();

    const favoriteMinecraftVersions = versionStats.map(stat => stat._id);

    return {
      totalPlugins,
      recentPlugins,
      favoriteMinecraftVersions
    };
  }
}

export const pluginService = new PluginService();
