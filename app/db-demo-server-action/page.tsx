import { getNeonClient } from '@/lib/neon';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { CommentForm } from './comment-form';

async function testConnection() {
  'use server';

  try {
    const sql = getNeonClient();
    const rows = await sql`SELECT NOW() AS current_time`;
    
    return {
      success: true,
      message: 'Database connection successful',
      data: rows,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      hint: 'Make sure DATABASE_URL is set in your .env.local file',
    };
  }
}

export default async function DbDemoServerActionPage() {
  const connectionTest = await testConnection();

  return (
    <div className="container mx-auto p-6 max-w-2xl">
      <Card>
        <CardHeader>
          <CardTitle>Neon DB Server Action Demo</CardTitle>
          <CardDescription>
            Example using Next.js Server Actions with Neon PostgreSQL
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <h3 className="text-lg font-semibold">Connection Status</h3>
            {connectionTest.success ? (
              <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-md">
                <p className="text-sm text-green-600 dark:text-green-400 font-medium">
                  ✓ {connectionTest.message}
                </p>
                <pre className="text-xs mt-2 overflow-auto">
                  {JSON.stringify(connectionTest.data, null, 2)}
                </pre>
              </div>
            ) : (
              <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-md">
                <p className="text-sm text-destructive font-medium">Error:</p>
                <p className="text-sm text-destructive">{connectionTest.error}</p>
                {connectionTest.hint && (
                  <p className="text-xs text-muted-foreground mt-2">{connectionTest.hint}</p>
                )}
              </div>
            )}
          </div>

          <CommentForm />
        </CardContent>
      </Card>
    </div>
  );
}
