'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Lightbulb, User, Tag, Rocket, Loader2 } from 'lucide-react';

interface DashboardPluginFormProps {
  onSubmit: (data: FormData) => void;
  isLoading: boolean;
  onPluginNameChange: (pluginName: string, userId: string) => void;
  onUserIdChange: (pluginName: string, userId: string) => void;
  projectStatus: string | null;
}

interface FormData {
  prompt: string;
  userId: string;
  pluginName?: string;
}

export function DashboardPluginForm({ 
  onSubmit, 
  isLoading, 
  onPluginNameChange,
  projectStatus 
}: DashboardPluginFormProps) {
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

  const handleUseExample = (example: string) => {
    setFormData(prev => ({ ...prev, prompt: example }));
  };
  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Plugin Prompt */}
      <div className="space-y-4">
        <label htmlFor="prompt" className="text-base font-semibold flex items-center gap-2">
          <Lightbulb className="h-5 w-5 text-amber-500" />
          Describe your plugin idea
        </label>
        <Textarea
          id="prompt"
          placeholder={examples[currentExample]}
          value={formData.prompt}
          onChange={(e) => handleInputChange('prompt', e.target.value)}
          onFocus={handlePromptFocus}
          className="min-h-[120px] resize-none text-base border-0 bg-muted/30 focus:bg-muted/50 transition-all duration-200 rounded-xl"
          required
        />
        
        {/* Example buttons */}
        <div className="flex flex-wrap gap-3 mt-4">
          <span className="text-sm font-medium text-muted-foreground">Quick examples:</span>
          {examples.slice(0, 2).map((example, index) => (
            <Button
              key={index}
              type="button"
              variant="outline"
              size="sm"
              onClick={() => handleUseExample(example)}
              className="text-sm h-8 rounded-lg border-0 bg-muted/30 hover:bg-muted/60 transition-all duration-200"
            >
              {example.split(' ').slice(0, 3).join(' ')}...
            </Button>
          ))}
        </div>
      </div>      {/* User ID and Plugin Name in a grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-3">
          <label htmlFor="userId" className="text-base font-semibold flex items-center gap-2">
            <User className="h-5 w-5 text-blue-500" />
            User ID
          </label>
          <Input
            id="userId"
            placeholder="your-username"
            value={formData.userId}
            onChange={(e) => handleInputChange('userId', e.target.value)}
            onFocus={generateUserId}
            className="h-12 text-base border-0 bg-muted/30 focus:bg-muted/50 transition-all duration-200 rounded-xl"
            required
          />
        </div>

        <div className="space-y-3">
          <label htmlFor="pluginName" className="text-base font-semibold flex items-center gap-2">
            <Tag className="h-5 w-5 text-emerald-500" />
            Plugin Name (optional)
          </label>
          <Input
            id="pluginName"
            placeholder="MyAwesomePlugin"
            value={formData.pluginName}
            onChange={(e) => handleInputChange('pluginName', e.target.value)}
            className="h-12 text-base border-0 bg-muted/30 focus:bg-muted/50 transition-all duration-200 rounded-xl"
          />
        </div>
      </div>
        {/* Project Status */}
      {projectStatus && (
        <div 
          className="text-sm rounded-xl p-4 bg-muted/50 border border-muted transition-all duration-200"
          dangerouslySetInnerHTML={{ __html: projectStatus }}
        />
      )}

      {/* Generate Button */}
      <Button
        type="submit"
        disabled={isLoading}
        className="w-full h-14 text-lg font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-200"
        size="lg"
      >
        {isLoading ? (
          <>
            <Loader2 className="h-5 w-5 mr-3 animate-spin" />
            Generating Plugin...
          </>
        ) : (
          <>
            <Rocket className="h-5 w-5 mr-3" />
            Generate Plugin
          </>
        )}
      </Button>
    </form>
  );
}
