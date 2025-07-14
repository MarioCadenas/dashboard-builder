
import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Moon, Sun, Settings, User } from 'lucide-react';
import { trpc } from '@/utils/trpc';
// Type-only import for better TypeScript compliance
import type { ThemeResponse } from '../../server/src/schema';

type Theme = 'light' | 'dark';

function App() {
  const [theme, setTheme] = useState<Theme>('light');
  const [isLoading, setIsLoading] = useState(false);
  const [userId] = useState('user_123'); // In real app, this would come from auth
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  // Apply theme to document
  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove('light', 'dark');
    root.classList.add(theme);
  }, [theme]);

  // Load theme from localStorage and API on mount
  const loadTheme = useCallback(async () => {
    // First, check localStorage for immediate theme application
    const savedTheme = localStorage.getItem('theme') as Theme | null;
    if (savedTheme && (savedTheme === 'light' || savedTheme === 'dark')) {
      setTheme(savedTheme);
    }

    // Then fetch from API (stub implementation - returns null)
    try {
      const preferences = await trpc.getUserPreferences.query({ user_id: userId });
      if (preferences && preferences.theme) {
        setTheme(preferences.theme);
        setLastUpdated(preferences.updated_at);
        // Sync localStorage with API
        localStorage.setItem('theme', preferences.theme);
      }
    } catch (error) {
      console.error('Failed to load user preferences:', error);
    }
  }, [userId]);

  useEffect(() => {
    loadTheme();
  }, [loadTheme]);

  // Toggle theme handler
  const toggleTheme = async () => {
    const newTheme: Theme = theme === 'light' ? 'dark' : 'light';
    setIsLoading(true);
    
    try {
      // Update theme immediately for responsive UI
      setTheme(newTheme);
      localStorage.setItem('theme', newTheme);
      
      // Update via API (stub implementation)
      const response: ThemeResponse = await trpc.upsertUserTheme.mutate({
        user_id: userId,
        theme: newTheme
      });
      
      setLastUpdated(response.updated_at);
    } catch (error) {
      console.error('Failed to update theme:', error);
      // Revert on error
      setTheme(theme);
      localStorage.setItem('theme', theme);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground transition-colors duration-200">
      <div className="container mx-auto p-6 max-w-4xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-2">
            <Settings className="h-6 w-6 text-primary" />
            <h1 className="text-3xl font-bold">App Builder</h1>
          </div>
          
          {/* Theme Toggle */}
          <div className="flex items-center gap-3">
            <Sun className="h-4 w-4 text-yellow-500" />
            <Switch
              checked={theme === 'dark'}
              onCheckedChange={toggleTheme}
              disabled={isLoading}
              aria-label="Toggle dark mode"
            />
            <Moon className="h-4 w-4 text-blue-500" />
          </div>
        </div>

        {/* Main Content */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {/* Welcome Card */}
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Welcome to App Builder! 👋
              </CardTitle>
              <CardDescription>
                Build amazing applications with our intuitive tools. Your theme preference is automatically saved.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">Current Theme:</span>
                  <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs bg-primary/10 text-primary">
                    {theme === 'light' ? (
                      <>
                        <Sun className="h-3 w-3" />
                        Light Mode
                      </>
                    ) : (
                      <>
                        <Moon className="h-3 w-3" />
                        Dark Mode
                      </>
                    )}
                  </span>
                </div>
                
                {lastUpdated && (
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">Last Updated:</span>
                    <span className="text-sm text-muted-foreground">
                      {lastUpdated.toLocaleString()}
                    </span>
                  </div>
                )}
                
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">User ID:</span>
                  <span className="text-sm text-muted-foreground font-mono">
                    {userId}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Theme Controls Card */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Theme Settings</CardTitle>
              <CardDescription>
                Customize your visual experience
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="theme-toggle" className="text-sm font-medium">
                  Dark Mode
                </Label>
                <Switch
                  id="theme-toggle"
                  checked={theme === 'dark'}
                  onCheckedChange={toggleTheme}
                  disabled={isLoading}
                />
              </div>
              
              <Button 
                onClick={toggleTheme} 
                disabled={isLoading}
                variant="outline"
                className="w-full"
              >
                {isLoading ? 'Updating...' : `Switch to ${theme === 'light' ? 'Dark' : 'Light'} Mode`}
              </Button>
              
              <div className="text-xs text-muted-foreground">
                💡 Your theme preference is automatically saved and synced across sessions
              </div>
            </CardContent>
          </Card>

          {/* Feature Cards */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">🚀 Quick Start</CardTitle>
              <CardDescription>
                Get started with building your app
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full">
                Create New Project
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">📚 Templates</CardTitle>
              <CardDescription>
                Browse pre-built templates
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="outline" className="w-full">
                View Templates
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">⚙️ Settings</CardTitle>
              <CardDescription>
                Configure your workspace
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="outline" className="w-full">
                Open Settings
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Footer */}
        <div className="mt-12 text-center text-sm text-muted-foreground">
          <p>App Builder - Your theme preference is automatically saved locally and synced to your profile.</p>
          <p className="mt-1">
            {/* Stub notification - indicating API is using placeholder implementation */}
            <span className="inline-block w-2 h-2 rounded-full bg-amber-500 mr-2"></span>
            Note: Backend API is using stub implementation for demonstration
          </p>
        </div>
      </div>
    </div>
  );
}

export default App;
