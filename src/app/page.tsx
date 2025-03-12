'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { openai } from '@/lib/openai';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import Link from 'next/link';
import { Skeleton } from '@/components/ui/skeleton';

export default function Home() {
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [isSupabaseLoading, setIsSupabaseLoading] = useState(false);
  const [supabaseStatus, setSupabaseStatus] = useState<{
    success: boolean;
    message: string;
  } | null>(null);
  
  const handleSupabaseTest = async () => {
    try {
      setIsSupabaseLoading(true);
      setSupabaseStatus(null);
      
      // Use the supabase client directly for a simple health check
      const { data, error } = await supabase.auth.getSession();
      
      if (error) {
        throw new Error(`Connection failed: ${error.message}`);
      } else {
        setSupabaseStatus({
          success: true,
          message: 'Successfully connected to Supabase!'
        });
      }
    } catch (error) {
      console.error('Error:', error);
      setSupabaseStatus({
        success: false,
        message: error instanceof Error ? error.message : 'Unknown error occurred'
      });
    } finally {
      setIsSupabaseLoading(false);
    }
  };

  const handleAITest = async () => {
    try {
      setIsAiLoading(true);
      const completion = await openai.chat.completions.create({
        messages: [{ role: 'user', content: 'Hello!' }],
        model: 'gpt-3.5-turbo',
      });
      setMessage(completion.choices[0]?.message?.content || '');
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setIsAiLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-12">
        <Card>
          <CardHeader>
            <CardTitle>Modern Web Template</CardTitle>
          </CardHeader>
          <CardContent className="space-y-8">
            <div>
              <h2 className="text-xl font-semibold mb-4">Supabase Integration</h2>
              <div className="space-y-4">
                <Button 
                  onClick={handleSupabaseTest}
                  disabled={isSupabaseLoading}
                  variant="default"
                >
                  {isSupabaseLoading ? 'Connecting...' : 'Test Supabase Connection'}
                </Button>
                
                {supabaseStatus && (
                  <div className={`p-4 ${supabaseStatus.success ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'} rounded-md mt-4`}>
                    <p className="font-medium">{supabaseStatus.success ? 'Success!' : 'Error:'}</p>
                    <p className="text-sm">{supabaseStatus.message}</p>
                    {!supabaseStatus.success && (
                      <p className="text-sm mt-2">
                        Make sure your Supabase URL and anon key are correct in your .env.local file.
                      </p>
                    )}
                  </div>
                )}
                
                <div className="mt-4 flex space-x-4">
                  <Link href="/test-data" className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2">
                    Go to Test Data Management
                  </Link>
                </div>
              </div>
            </div>

            <div>
              <h2 className="text-xl font-semibold mb-4">OpenAI Integration</h2>
              <div className="space-y-4">
                <Button onClick={handleAITest} disabled={isAiLoading}>
                  {isAiLoading ? 'Loading...' : 'Test AI Integration'}
                </Button>
                {message && (
                  <div className="p-4 bg-blue-50 text-blue-800 rounded-md">
                    <p className="font-medium">AI Response:</p>
                    <p className="text-sm">{message}</p>
                  </div>
                )}
              </div>
            </div>

            <div>
              <h2 className="text-xl font-semibold mb-4">Image Generation</h2>
              <div className="space-y-4">
                <Link href="/image-generator">
                  <Button>Go to Image Generator</Button>
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
