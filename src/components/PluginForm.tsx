'use client';

import { useState, useEffect } from 'react';
import { Lightbulb, User, Tag, Rocket, Loader2 } from 'lucide-react';

interface PluginFormProps {
  onSubmit: (data: FormData) => void;
  isLoading: boolean;
  onPluginNameChange: (pluginName: string, userId: string) => void;  onUserIdChange: (pluginName: string, userId: string) => void;
  projectStatus: string | null;
}

interface FormData {
  prompt: string;
  userId: string;
  pluginName?: string;
}

export function PluginForm({ 
  onSubmit, 
  isLoading, 
  onPluginNameChange, 
  onUserIdChange, 
  projectStatus 
}: PluginFormProps) {
  const [formData, setFormData] = useState<FormData>({
    prompt: '',
    userId: '',
    pluginName: ''
  });

  const examples = [
    "Create a teleportation plugin with /sethome and /home commands, including cooldowns",
    "Make a custom enchantment plugin that adds fire resistance and speed boost effects",
    "Build a economy plugin with virtual currency, shops, and player transactions",
    "Create a mini-game plugin for spleef with automatic arena management",
    "Make a custom mob spawner plugin with configurable spawn rates and locations"
  ];

  const [currentExample, setCurrentExample] = useState(0);

  useEffect(() => {
    const timer = setTimeout(() => {
      onPluginNameChange(formData.pluginName || '', formData.userId);
    }, 500);
    return () => clearTimeout(timer);
  }, [formData.pluginName, formData.userId, onPluginNameChange]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.prompt.trim()) {
      alert('Please describe your plugin idea');
      return;
    }
    
    if (!formData.userId.trim()) {
      alert('Please enter a user ID');
      return;
    }

    onSubmit(formData);
  };

  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const generateUserId = () => {
    if (!formData.userId) {
      const newUserId = 'user-' + Math.random().toString(36).substr(2, 8);
      setFormData(prev => ({ ...prev, userId: newUserId }));
    }
  };

  const handlePromptFocus = () => {
    if (!formData.prompt) {
      setCurrentExample((prev) => (prev + 1) % examples.length);
    }
  };

  return (
    <div className="bg-white overflow-hidden shadow rounded-lg">
      <div className="px-4 py-5 sm:p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Plugin Prompt */}
          <div>
            <label htmlFor="prompt" className="block text-sm font-medium text-gray-700 mb-2">
              <Lightbulb className="inline w-4 h-4 text-yellow-500 mr-2" />
              Describe your plugin idea
            </label>
            <textarea
              id="prompt"
              name="prompt"
              rows={4}
              className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 mt-1 block w-full sm:text-sm border-gray-300 rounded-md"
              placeholder={examples[currentExample]}
              value={formData.prompt}
              onChange={(e) => handleInputChange('prompt', e.target.value)}
              onFocus={handlePromptFocus}
              required
            />
          </div>

          {/* User ID */}
          <div>
            <label htmlFor="userId" className="block text-sm font-medium text-gray-700 mb-2">
              <User className="inline w-4 h-4 text-blue-500 mr-2" />
              User ID
            </label>
            <input
              type="text"
              id="userId"
              name="userId"
              className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 mt-1 block w-full sm:text-sm border-gray-300 rounded-md"
              placeholder="your-username"
              value={formData.userId}
              onChange={(e) => handleInputChange('userId', e.target.value)}
              onFocus={generateUserId}
              required
            />
          </div>

          {/* Plugin Name */}
          <div>
            <label htmlFor="pluginName" className="block text-sm font-medium text-gray-700 mb-2">
              <Tag className="inline w-4 h-4 text-green-500 mr-2" />
              Plugin Name (optional)
            </label>
            <input
              type="text"
              id="pluginName"
              name="pluginName"
              className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 mt-1 block w-full sm:text-sm border-gray-300 rounded-md"
              placeholder="MyAwesomePlugin (leave empty for auto-generated name)"
              value={formData.pluginName}
              onChange={(e) => handleInputChange('pluginName', e.target.value)}
            />
              {/* Project Status */}
            {projectStatus && (
              <div 
                className="mt-2 text-sm"
                dangerouslySetInnerHTML={{ __html: projectStatus }}
              />
            )}
          </div>

          {/* Generate Button */}
          <div className="flex justify-center">
            <button
              type="submit"
              disabled={isLoading}
              className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <>
                  <Loader2 className="animate-spin w-5 h-5 mr-2" />
                  Generating...
                </>
              ) : (
                <>
                  <Rocket className="w-5 h-5 mr-2" />
                  Generate Plugin
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
