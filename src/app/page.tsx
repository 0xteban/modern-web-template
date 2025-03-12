'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { openai } from '@/lib/openai';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import Link from 'next/link';

export default function Home() {
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleSupabaseTest = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase.from('test').select('*');
      if (error) throw error;
      console.log('Supabase connection successful:', data);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAITest = async () => {
    try {
      setIsLoading(true);
      const completion = await openai.chat.completions.create({
        messages: [{ role: 'user', content: 'Hello!' }],
        model: 'gpt-3.5-turbo',
      });
      setMessage(completion.choices[0]?.message?.content || '');
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-12">
        <Card>
          <CardHeader>
            <CardTitle>Modern Web Template</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <h2 className="text-xl font-semibold mb-4">Supabase Integration</h2>
              <Button 
                onClick={handleSupabaseTest}
                disabled={isLoading}
              >
                Test Supabase Connection
              </Button>
            </div>

            <div>
              <h2 className="text-xl font-semibold mb-4">OpenAI Integration</h2>
              <Button 
                onClick={handleAITest}
                disabled={isLoading}
              >
                Test AI Integration
              </Button>
              {message && (
                <div className="mt-4 p-4 bg-muted rounded-lg">
                  <p>{message}</p>
                </div>
              )}
            </div>

            <div>
              <h2 className="text-xl font-semibold mb-4">Image Generator</h2>
              <Button asChild>
                <Link href="/image-generator">
                  Try Image Generator
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
