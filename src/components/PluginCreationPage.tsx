'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { usePluginGenerator } from '@/hooks/usePluginGenerator';
import { 
  ArrowLeft,
  Rocket,
  Bot,
  FileCode,
  CheckCircle,
  Loader2,
  Sparkles,
  Code,
  Package
} from 'lucide-react';

export function PluginCreationPage() {
  const router = useRouter();
  const {
    isLoading,
    results,
    generatePlugin,
    currentProject
  } = usePluginGenerator();
  const [formData, setFormData] = useState({
    pluginName: '',
    description: '',
    minecraftVersion: '1.20.1',
    prompt: '',
    userId: 'testuser' // In real app, get from auth
  });

  const [step, setStep] = useState<'form' | 'generating' | 'success'>('form');

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.pluginName || !formData.prompt) {
      return;
    }

    setStep('generating');

    try {
      await generatePlugin({
        prompt: formData.prompt,
        userId: formData.userId,
        pluginName: formData.pluginName
      });
      
      setStep('success');
    } catch (error) {
      console.error('Error generating plugin:', error);
      setStep('form');
    }
  };

  const handleGoToEditor = () => {
    if (currentProject) {
      router.push(`/dashboard/editor?plugin=${currentProject.pluginName}&userId=${currentProject.userId}`);
    }
  };

  const handleBackToDashboard = () => {
    router.push('/dashboard');
  };

  if (step === 'generating') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 flex items-center justify-center p-6">
        <Card className="w-full max-w-md border-0 shadow-2xl bg-card/80 backdrop-blur-sm">
          <CardContent className="p-8">
            <div className="text-center space-y-6">
              <div className="relative">
                <div className="w-20 h-20 mx-auto bg-primary/10 rounded-full flex items-center justify-center">
                  <Bot className="h-10 w-10 text-primary animate-pulse" />
                </div>
                <div className="absolute -top-2 -right-2">
                  <Sparkles className="h-6 w-6 text-yellow-500 animate-bounce" />
                </div>
              </div>
              
              <div className="space-y-2">
                <h2 className="text-2xl font-bold">Generating Your Plugin</h2>
                <p className="text-muted-foreground">
                  AI is crafting your Minecraft plugin...
                </p>
              </div>

              <div className="flex items-center justify-center space-x-2">
                <Loader2 className="h-5 w-5 animate-spin text-primary" />
                <span className="text-sm text-muted-foreground">This may take a few moments</span>
              </div>

              <div className="bg-muted/50 rounded-lg p-4 text-left">
                <div className="space-y-2 text-sm">
                  <div className="flex items-center space-x-2 text-green-600">
                    <CheckCircle className="h-4 w-4" />
                    <span>Analyzing requirements</span>
                  </div>
                  <div className="flex items-center space-x-2 text-blue-600">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Generating code structure</span>
                  </div>
                  <div className="flex items-center space-x-2 text-muted-foreground">
                    <div className="h-4 w-4 rounded-full border-2 border-muted-foreground/30" />
                    <span>Creating plugin files</span>
                  </div>
                  <div className="flex items-center space-x-2 text-muted-foreground">
                    <div className="h-4 w-4 rounded-full border-2 border-muted-foreground/30" />
                    <span>Finalizing project</span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (step === 'success') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 flex items-center justify-center p-6">
        <Card className="w-full max-w-lg border-0 shadow-2xl bg-card/80 backdrop-blur-sm">
          <CardContent className="p-8">
            <div className="text-center space-y-6">
              <div className="relative">
                <div className="w-20 h-20 mx-auto bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center">
                  <CheckCircle className="h-10 w-10 text-green-600" />
                </div>
                <div className="absolute -top-2 -right-2">
                  <Package className="h-6 w-6 text-blue-500" />
                </div>
              </div>
              
              <div className="space-y-2">
                <h2 className="text-2xl font-bold text-green-600">Plugin Created Successfully!</h2>
                <p className="text-muted-foreground">
                  Your Minecraft plugin <strong>{formData.pluginName}</strong> has been generated and saved.
                </p>
              </div>

              {results && (
                <div className="bg-muted/50 rounded-lg p-4 text-left">
                  <h3 className="font-semibold mb-2 flex items-center">
                    <FileCode className="h-4 w-4 mr-2" />
                    Plugin Details
                  </h3>
                  <div className="space-y-1 text-sm text-muted-foreground">
                    <p><span className="font-medium">Name:</span> {formData.pluginName}</p>
                    <p><span className="font-medium">Version:</span> {formData.minecraftVersion}</p>
                    <p><span className="font-medium">Generated:</span> {new Date().toLocaleString()}</p>
                  </div>
                </div>
              )}

              <div className="flex flex-col space-y-3">
                <Button size="lg" onClick={handleGoToEditor} className="w-full">
                  <Code className="h-5 w-5 mr-2" />
                  Take Me to the Editor
                </Button>
                
                <Button variant="outline" onClick={handleBackToDashboard} className="w-full">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Dashboard
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center space-x-4">
          <Button variant="ghost" size="sm" onClick={handleBackToDashboard}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Button>
          <div className="flex-1">
            <h1 className="text-3xl font-bold">Create New Plugin</h1>
            <p className="text-muted-foreground">Generate a Minecraft plugin with AI assistance</p>
          </div>
          <Badge variant="secondary" className="gap-1.5 px-3 py-1">
            <Rocket className="h-4 w-4" />
            AI-Powered
          </Badge>
        </div>

        <Separator />

        {/* Plugin Creation Form */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Form */}
          <div className="lg:col-span-2">
            <Card className="border-0 shadow-lg bg-card/50 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Package className="h-5 w-5 mr-2" />
                  Plugin Configuration
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="pluginName">Plugin Name</Label>
                      <Input
                        id="pluginName"
                        placeholder="MyAwesomePlugin"
                        value={formData.pluginName}
                        onChange={(e) => handleInputChange('pluginName', e.target.value)}
                        required
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="minecraftVersion">Minecraft Version</Label>
                      <Input
                        id="minecraftVersion"
                        placeholder="1.20.1"
                        value={formData.minecraftVersion}
                        onChange={(e) => handleInputChange('minecraftVersion', e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description">Description (Optional)</Label>
                    <Input
                      id="description"
                      placeholder="A brief description of your plugin"
                      value={formData.description}
                      onChange={(e) => handleInputChange('description', e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="prompt">
                      Plugin Requirements
                      <span className="text-destructive ml-1">*</span>
                    </Label>
                    <Textarea
                      id="prompt"
                      placeholder="Describe what you want your plugin to do. For example: 'Create a plugin that adds a /heal command that restores player health and sends a message.'"
                      value={formData.prompt}
                      onChange={(e) => handleInputChange('prompt', e.target.value)}
                      rows={6}
                      required
                      className="min-h-[120px]"
                    />
                    <p className="text-xs text-muted-foreground">
                      Be specific about features, commands, events, and functionality you want.
                    </p>
                  </div>

                  <Button 
                    type="submit" 
                    size="lg" 
                    className="w-full" 
                    disabled={isLoading || !formData.pluginName || !formData.prompt}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                        Generating...
                      </>
                    ) : (
                      <>
                        <Rocket className="h-5 w-5 mr-2" />
                        Generate Plugin
                      </>
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar Info */}
          <div className="space-y-6">
            <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-500/5 to-blue-500/10 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-lg flex items-center">
                  <Bot className="h-5 w-5 mr-2 text-blue-500" />
                  AI Assistant Tips
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <h4 className="font-medium text-sm">Be Specific</h4>
                  <p className="text-xs text-muted-foreground">
                    Describe exact commands, events, and features you want.
                  </p>
                </div>
                
                <Separator />
                
                <div className="space-y-2">
                  <h4 className="font-medium text-sm">Example Ideas</h4>
                  <ul className="text-xs text-muted-foreground space-y-1">
                    <li>• Custom commands with permissions</li>
                    <li>• Event listeners and handlers</li>
                    <li>• Player data management</li>
                    <li>• Economy systems</li>
                    <li>• Custom items and blocks</li>
                  </ul>
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg bg-gradient-to-br from-green-500/5 to-green-500/10 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-lg flex items-center">
                  <FileCode className="h-5 w-5 mr-2 text-green-500" />
                  What You&apos;ll Get
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex items-center space-x-2 text-sm">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span>Complete plugin structure</span>
                </div>
                <div className="flex items-center space-x-2 text-sm">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span>Main class and plugin.yml</span>
                </div>
                <div className="flex items-center space-x-2 text-sm">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span>Event handlers and commands</span>
                </div>
                <div className="flex items-center space-x-2 text-sm">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span>Ready-to-compile code</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
