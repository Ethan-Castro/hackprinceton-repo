'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function DbDemoPage() {
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<Record<string, unknown> | null>(null);
  const [error, setError] = useState<string | null>(null);

  const testConnection = async () => {
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await fetch('/api/db-example');
      const data = await response.json();
      
      if (data.success) {
        setResult(data);
      } else {
        setError(data.error || 'Connection failed');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  const createComment = async () => {
    if (!comment.trim()) {
      setError('Please enter a comment');
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await fetch('/api/db-example', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ comment }),
      });

      const data = await response.json();
      
      if (data.success) {
        setResult(data);
        setComment('');
      } else {
        setError(data.error || data.hint || 'Failed to create comment');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-6 max-w-2xl">
      <Card>
        <CardHeader>
          <CardTitle>Neon DB Integration Demo</CardTitle>
          <CardDescription>
            Test your Neon PostgreSQL database connection and create sample records
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <h3 className="text-lg font-semibold">Test Connection</h3>
            <p className="text-sm text-muted-foreground">
              Click the button below to test your database connection
            </p>
            <Button onClick={testConnection} disabled={loading}>
              {loading ? 'Testing...' : 'Test Connection'}
            </Button>
          </div>

          <div className="space-y-2">
            <h3 className="text-lg font-semibold">Create Comment</h3>
            <p className="text-sm text-muted-foreground">
              Create a sample comment record in the database
            </p>
            <div className="flex gap-2">
              <Input
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Enter a comment..."
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !loading) {
                    createComment();
                  }
                }}
              />
              <Button onClick={createComment} disabled={loading || !comment.trim()}>
                {loading ? 'Creating...' : 'Create'}
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              Note: Make sure you&apos;ve created the comments table in Neon SQL Editor:
              <code className="block mt-1 p-2 bg-muted rounded text-xs">
                CREATE TABLE IF NOT EXISTS comments (id SERIAL PRIMARY KEY, comment TEXT, created_at TIMESTAMP DEFAULT NOW());
              </code>
            </p>
          </div>

          {error && (
            <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-md">
              <p className="text-sm text-destructive font-medium">Error:</p>
              <p className="text-sm text-destructive">{error}</p>
            </div>
          )}

          {result && (
            <div className="p-4 bg-muted rounded-md">
              <p className="text-sm font-medium mb-2">Result:</p>
              <pre className="text-xs overflow-auto">
                {JSON.stringify(result, null, 2)}
              </pre>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
