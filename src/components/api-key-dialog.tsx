"use client";

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ExternalLinkIcon, KeyIcon } from 'lucide-react';

interface ApiKeyDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onApiKeySaved: () => void;
}

export function ApiKeyDialog({ open, onOpenChange, onApiKeySaved }: ApiKeyDialogProps) {
  const [apiKey, setApiKey] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSave = async () => {
    if (!apiKey.trim()) return;
    
    setIsLoading(true);
    try {
      // Save to localStorage
      localStorage.setItem('openai_api_key', apiKey.trim());
      
      // Close dialog and notify parent
      onOpenChange(false);
      onApiKeySaved();
      
      // Reset form
      setApiKey('');
    } catch (error) {
              console.error('Error saving OpenAI API key:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSave();
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader className="text-center">
          <DialogTitle className="flex items-center justify-center gap-2 text-xl">
            <KeyIcon className="w-5 h-5" />
            OpenAI API Key Required
          </DialogTitle>
          <DialogDescription className="text-center space-y-3">
            <p>You need an OpenAI API key to generate images.</p>
            <p className="text-sm text-muted-foreground">
              Get your OpenAI API key from the OpenAI Platform
            </p>
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 pt-4">
          {/* Link to Google AI Studio */}
          <Button
            variant="outline"
            className="w-full"
            onClick={() => window.open('https://platform.openai.com/api-keys', '_blank')}
          >
            <ExternalLinkIcon className="w-4 h-4 mr-2" />
            Get OpenAI API Key from Platform
          </Button>

          {/* API Key Input */}
          <div className="space-y-2">
            <Label htmlFor="api-key">Enter your OpenAI API key:</Label>
            <Input
              id="api-key"
              type="password"
              placeholder="sk-..."
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              onKeyDown={handleKeyDown}
              className="font-mono text-sm"
            />
          </div>

          {/* Save Button */}
          <Button
            onClick={handleSave}
            disabled={!apiKey.trim() || isLoading}
            className="w-full"
          >
            {isLoading ? 'Saving...' : 'Save OpenAI API Key'}
          </Button>

          {/* Help Text */}
          <p className="text-xs text-muted-foreground text-center">
            Your OpenAI API key is stored locally in your browser and never sent anywhere.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
} 