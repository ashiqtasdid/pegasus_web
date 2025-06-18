'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  Rocket, 
  Loader2, 
  Sparkles,
  Code,
  Package,
  Zap,
  CheckCircle2,
  ChevronDown,
  Download,
  Edit,
  ArrowRight
} from 'lucide-react';
import { usePluginGenerator } from '@/hooks/usePluginGenerator';

interface CreatePluginModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreatePlugin: (data: { prompt: string; userId: string; pluginName?: string }) => void;
  isLoading?: boolean;
  userId: string;
}

const minecraftVersions = [
  '1.20.4',
  '1.20.2', 
  '1.20.1',
  '1.19.4',
  '1.19.2',
  '1.18.2',
  '1.17.1',
  '1.16.5'
];

const pluginTemplates = [
  {
    id: 'basic',
    name: 'Basic Plugin',
    description: 'Simple plugin with basic commands and events',
    icon: Package,
    prompt: 'Create a basic Minecraft plugin with a simple command and player join event handler.'
  },
  {
    id: 'economy',
    name: 'Economy Plugin', 
    description: 'Player economy system with currency and shops',
    icon: Code,
    prompt: 'Create an economy plugin with virtual currency, player balances, and shop functionality.'
  },
  {
    id: 'minigame',
    name: 'Mini-Game',
    description: 'Fun mini-game with arena and scoring system',
    icon: Zap,
    prompt: 'Create a mini-game plugin with arena management, player scoring, and game rounds.'
  },
  {
    id: 'utility',
    name: 'Utility Plugin',
    description: 'Server administration and utility commands',
    icon: Sparkles,
    prompt: 'Create a utility plugin with teleportation, player management, and server administration commands.'
  }
];

export function CreatePluginModal({ open, onOpenChange, onCreatePlugin, isLoading, userId }: CreatePluginModalProps) {
  const router = useRouter();
  const { downloadJar } = usePluginGenerator();
  const [pluginName, setPluginName] = useState('');
  const [description, setDescription] = useState('');
  const [minecraftVersion, setMinecraftVersion] = useState('1.20.4');
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
  const [customPrompt, setCustomPrompt] = useState('');  const [step, setStep] = useState<'template' | 'details' | 'confirm' | 'generating' | 'success' | 'error'>('template');
  const [generatedPluginName, setGeneratedPluginName] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  // Listen for plugin generation events
  useEffect(() => {
    const handlePluginGenerated = (event: CustomEvent) => {
      const { pluginName: genPluginName, success } = event.detail;
      if (success) {
        setGeneratedPluginName(genPluginName);
        setStep('success');
      } else {
        setErrorMessage('Plugin generation failed. Please try again.');
        setStep('error');
      }
    };

    if (typeof window !== 'undefined') {
      window.addEventListener('plugin-generated', handlePluginGenerated as EventListener);
      return () => {
        window.removeEventListener('plugin-generated', handlePluginGenerated as EventListener);
      };
    }
  }, []);

  const handleTemplateSelect = (templateId: string) => {
    const template = pluginTemplates.find(t => t.id === templateId);
    if (template) {
      setSelectedTemplate(templateId);
      setCustomPrompt(template.prompt);
      setStep('details');
    }
  };

  const handleCustomTemplate = () => {
    setSelectedTemplate('custom');
    setCustomPrompt('');
    setStep('details');
  };  const handleCreate = () => {
    if (!pluginName.trim() || !customPrompt.trim()) return;
    
    const prompt = `${customPrompt} Plugin name: ${pluginName}. Description: ${description || 'No description provided'}. Minecraft version: ${minecraftVersion}.`;
    
    // Set generating state
    setStep('generating');
    
    onCreatePlugin({
      prompt,
      userId,
      pluginName: pluginName.trim()
    });
  };

  const handleBack = () => {
    if (step === 'details') {
      setStep('template');
    } else if (step === 'confirm') {
      setStep('details');
    }
  };

  const handleNext = () => {
    if (step === 'details') {
      setStep('confirm');
    }
  };  const resetModal = () => {
    setPluginName('');
    setDescription('');
    setMinecraftVersion('1.20.4');
    setSelectedTemplate(null);
    setCustomPrompt('');
    setStep('template');
    setGeneratedPluginName('');
    setErrorMessage('');
  };

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen && !isLoading) {
      resetModal();
    }
    onOpenChange(newOpen);
  };

  const selectedTemplateData = pluginTemplates.find(t => t.id === selectedTemplate);
  return (
    <Sheet open={open} onOpenChange={handleOpenChange}>
      <SheetContent className="w-full sm:max-w-4xl overflow-y-auto" side="right">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2 text-2xl">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Rocket className="h-6 w-6 text-primary" />
            </div>
            Create New Plugin
          </SheetTitle>
          <SheetDescription>
            Build a custom Minecraft plugin with AI assistance. Choose a template or start from scratch.
          </SheetDescription>
        </SheetHeader>

        <div className="space-y-6">          {/* Progress Indicator */}
          <div className="flex items-center justify-center gap-2">
            <div className={`w-3 h-3 rounded-full transition-colors ${step === 'template' ? 'bg-primary' : 'bg-primary/30'}`} />
            <div className={`w-8 h-1 rounded transition-colors ${step !== 'template' ? 'bg-primary' : 'bg-muted'}`} />
            <div className={`w-3 h-3 rounded-full transition-colors ${step === 'details' ? 'bg-primary' : step === 'confirm' || step === 'generating' || step === 'success' || step === 'error' ? 'bg-primary/60' : 'bg-muted'}`} />
            <div className={`w-8 h-1 rounded transition-colors ${step === 'confirm' || step === 'generating' || step === 'success' || step === 'error' ? 'bg-primary' : 'bg-muted'}`} />
            <div className={`w-3 h-3 rounded-full transition-colors ${step === 'confirm' || step === 'generating' || step === 'success' || step === 'error' ? 'bg-primary' : 'bg-muted'}`} />
          </div>

          {/* Step 1: Template Selection */}
          {step === 'template' && (
            <div className="space-y-6">
              <div className="text-center">
                <h3 className="text-lg font-semibold mb-2">Choose a Template</h3>
                <p className="text-sm text-muted-foreground">Select a starting point for your plugin</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {pluginTemplates.map((template) => (
                  <Card 
                    key={template.id} 
                    className="cursor-pointer hover:shadow-lg transition-all duration-300 border-2 hover:border-primary/50"
                    onClick={() => handleTemplateSelect(template.id)}
                  >
                    <CardHeader className="pb-3">
                      <CardTitle className="flex items-center gap-3">
                        <div className="p-2 bg-primary/10 rounded-lg">
                          <template.icon className="h-5 w-5 text-primary" />
                        </div>
                        {template.name}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground">{template.description}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>

              <Separator />

              <Card 
                className="cursor-pointer hover:shadow-lg transition-all duration-300 border-2 border-dashed hover:border-primary/50"
                onClick={handleCustomTemplate}
              >
                <CardContent className="flex items-center justify-center p-8">
                  <div className="text-center space-y-2">
                    <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mx-auto">
                      <Code className="h-6 w-6 text-muted-foreground" />
                    </div>
                    <h3 className="font-semibold">Custom Plugin</h3>
                    <p className="text-sm text-muted-foreground">Start from scratch with your own requirements</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Step 2: Plugin Details */}
          {step === 'details' && (
            <div className="space-y-6">
              <div className="text-center">
                <h3 className="text-lg font-semibold mb-2">Plugin Details</h3>
                <p className="text-sm text-muted-foreground">Configure your plugin settings</p>
              </div>

              {selectedTemplateData && (
                <Card className="bg-primary/5">
                  <CardContent className="flex items-center gap-3 p-4">
                    <div className="p-2 bg-primary/10 rounded-lg">
                      <selectedTemplateData.icon className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <h4 className="font-medium">{selectedTemplateData.name}</h4>
                      <p className="text-sm text-muted-foreground">{selectedTemplateData.description}</p>
                    </div>
                  </CardContent>
                </Card>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="pluginName" className="text-sm font-medium">Plugin Name *</Label>
                    <Input
                      id="pluginName"
                      placeholder="e.g., MyAwesomePlugin"
                      value={pluginName}
                      onChange={(e) => setPluginName(e.target.value)}
                      className="mt-1"
                    />
                  </div>                  <div>
                    <Label htmlFor="minecraftVersion" className="text-sm font-medium">Minecraft Version</Label>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="outline" className="w-full justify-between mt-1">
                          {minecraftVersion}
                          <ChevronDown className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent className="w-full">
                        {minecraftVersions.map((version) => (
                          <DropdownMenuItem 
                            key={version} 
                            onClick={() => setMinecraftVersion(version)}
                          >
                            {version}
                          </DropdownMenuItem>
                        ))}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>

                <div>
                  <Label htmlFor="description" className="text-sm font-medium">Description</Label>
                  <Textarea
                    id="description"
                    placeholder="Describe what your plugin should do..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="mt-1 min-h-[100px]"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="customPrompt" className="text-sm font-medium">AI Prompt *</Label>
                <Textarea
                  id="customPrompt"
                  placeholder="Describe the functionality you want in your plugin..."
                  value={customPrompt}
                  onChange={(e) => setCustomPrompt(e.target.value)}
                  className="mt-1 min-h-[120px]"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Be specific about features, commands, and functionality you want.
                </p>
              </div>
            </div>
          )}

          {/* Step 3: Confirmation */}
          {step === 'confirm' && (
            <div className="space-y-6">
              <div className="text-center">
                <h3 className="text-lg font-semibold mb-2">Review & Create</h3>
                <p className="text-sm text-muted-foreground">Review your plugin configuration before creating</p>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CheckCircle2 className="h-5 w-5 text-green-600" />
                    Plugin Configuration
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label className="text-sm font-medium text-muted-foreground">Plugin Name</Label>
                      <p className="font-medium">{pluginName}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-muted-foreground">Minecraft Version</Label>
                      <Badge variant="outline">{minecraftVersion}</Badge>
                    </div>
                  </div>
                  
                  {description && (
                    <div>
                      <Label className="text-sm font-medium text-muted-foreground">Description</Label>
                      <p className="text-sm">{description}</p>
                    </div>
                  )}

                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">AI Prompt</Label>
                    <p className="text-sm bg-muted p-3 rounded-lg">{customPrompt}</p>
                  </div>
                </CardContent>              </Card>
            </div>
          )}

          {/* Step 4: Generating */}
          {step === 'generating' && (
            <div className="space-y-6">
              <div className="text-center">
                <div className="w-16 h-16 mx-auto mb-4 bg-primary/10 rounded-full flex items-center justify-center">
                  <Loader2 className="h-8 w-8 text-primary animate-spin" />
                </div>
                <h3 className="text-lg font-semibold mb-2">Generating Your Plugin</h3>
                <p className="text-sm text-muted-foreground">Please wait while we create your custom Minecraft plugin...</p>
              </div>

              <Card className="bg-gradient-to-r from-primary/5 to-primary/10">
                <CardContent className="p-6">
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 bg-primary rounded-full animate-pulse"></div>
                      <span className="text-sm font-medium">Analyzing requirements</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 bg-primary/60 rounded-full"></div>
                      <span className="text-sm text-muted-foreground">Generating plugin code</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 bg-muted rounded-full"></div>
                      <span className="text-sm text-muted-foreground">Compiling and packaging</span>
                    </div>
                  </div>
                  
                  <div className="mt-4 p-3 bg-muted/50 rounded-lg">
                    <p className="text-xs text-muted-foreground text-center">
                      This usually takes 30-60 seconds depending on plugin complexity
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Step 5: Success */}
          {step === 'success' && (
            <div className="space-y-6">
              <div className="text-center">
                <div className="w-16 h-16 mx-auto mb-4 bg-green-500/10 rounded-full flex items-center justify-center">
                  <CheckCircle2 className="h-8 w-8 text-green-600" />
                </div>
                <h3 className="text-lg font-semibold mb-2 text-green-800 dark:text-green-200">Plugin Created Successfully!</h3>
                <p className="text-sm text-muted-foreground">Your Minecraft plugin has been generated and is ready to use.</p>
              </div>

              <Card className="bg-gradient-to-r from-green-50 to-green-100/50 dark:from-green-950/50 dark:to-green-900/30 border-green-200 dark:border-green-800">
                <CardContent className="p-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-semibold text-green-800 dark:text-green-200">
                          {generatedPluginName || pluginName}
                        </h4>
                        <p className="text-sm text-green-600 dark:text-green-400">
                          Minecraft {minecraftVersion}
                        </p>
                      </div>
                      <Badge variant="outline" className="bg-green-500/10 text-green-700 border-green-300">
                        Ready
                      </Badge>
                    </div>
                    
                    <Separator className="bg-green-200 dark:bg-green-800" />
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">                      <Button 
                        onClick={() => router.push(`/dashboard/editor?plugin=${encodeURIComponent(generatedPluginName || pluginName)}&userId=${encodeURIComponent(userId)}`)}
                        className="w-full bg-green-600 hover:bg-green-700 text-white"
                      >
                        <Edit className="h-4 w-4 mr-2" />
                        Open in Editor
                      </Button>
                      
                      <Button 
                        variant="outline" 
                        onClick={() => downloadJar(userId, generatedPluginName || pluginName)}
                        className="w-full border-green-300 text-green-700 hover:bg-green-50 dark:text-green-400 dark:border-green-600 dark:hover:bg-green-950/20"
                      >
                        <Download className="h-4 w-4 mr-2" />
                        Download JAR
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <div className="text-center">
                <Button 
                  variant="ghost" 
                  onClick={() => handleOpenChange(false)}
                  className="text-muted-foreground hover:text-foreground"
                >
                  Close and View Dashboard
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </div>
            </div>
          )}

          {/* Step 6: Error */}
          {step === 'error' && (
            <div className="space-y-6">
              <div className="text-center">
                <div className="w-16 h-16 mx-auto mb-4 bg-red-500/10 rounded-full flex items-center justify-center">
                  <Package className="h-8 w-8 text-red-600" />
                </div>
                <h3 className="text-lg font-semibold mb-2 text-red-800 dark:text-red-200">Generation Failed</h3>
                <p className="text-sm text-muted-foreground">There was an issue creating your plugin. Please try again.</p>
              </div>

              <Card className="bg-gradient-to-r from-red-50 to-red-100/50 dark:from-red-950/50 dark:to-red-900/30 border-red-200 dark:border-red-800">
                <CardContent className="p-6">
                  <div className="space-y-4">
                    <div className="p-3 bg-red-500/10 rounded-lg">
                      <p className="text-sm text-red-700 dark:text-red-400">
                        {errorMessage || 'An unexpected error occurred during plugin generation.'}
                      </p>
                    </div>
                    
                    <div className="flex flex-col sm:flex-row gap-3">
                      <Button 
                        onClick={() => setStep('template')}
                        className="flex-1"
                      >
                        Try Again
                      </Button>
                      
                      <Button 
                        variant="outline" 
                        onClick={() => handleOpenChange(false)}
                        className="flex-1"
                      >
                        Close
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}          {/* Navigation Buttons - Only show for template/details/confirm steps */}
          {(step === 'template' || step === 'details' || step === 'confirm') && (
            <div className="flex justify-between pt-4">
              <div>
                {step !== 'template' && (
                  <Button variant="outline" onClick={handleBack} disabled={isLoading}>
                    Back
                  </Button>
                )}
              </div>
              
              <div className="flex gap-2">
                {step === 'details' && (
                  <Button 
                    onClick={handleNext} 
                    disabled={!pluginName.trim() || !customPrompt.trim()}
                  >
                    Review
                  </Button>
                )}
                
                {step === 'confirm' && (
                  <Button 
                    onClick={handleCreate} 
                    disabled={isLoading || !pluginName.trim() || !customPrompt.trim()}
                    className="min-w-[120px]"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Creating...
                      </>
                    ) : (
                      <>
                        <Rocket className="h-4 w-4 mr-2" />
                        Create Plugin
                      </>
                    )}
                  </Button>
                )}
              </div>
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
