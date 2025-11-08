import { getNeonClient } from '@/lib/neon';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

/**
 * Server Action example using Neon DB
 * This demonstrates the recommended approach for Next.js Server Actions
 */
async function createComment(formData: FormData) {
  'use server';

  try {
    const comment = formData.get('comment') as string;

    if (!comment) {
      return { success: false, error: 'Comment is required' };
    }

    // Connect to the Neon database
    const sql = getNeonClient();

    // Insert the comment from the form into the Postgres database
    const rows = await sql`INSERT INTO comments (comment) VALUES (${comment}) RETURNING *`;

    return {
      success: true,
      message: 'Comment created successfully',
      data: rows[0] ?? null,
    };
  } catch (error) {
    console.error('Database error:', error);
    
    if (error instanceof Error && error.message.includes('does not exist')) {
      return {
        success: false,
        error: 'Table not found',
        hint: 'Please create the comments table in Neon SQL Editor: CREATE TABLE IF NOT EXISTS comments (id SERIAL PRIMARY KEY, comment TEXT, created_at TIMESTAMP DEFAULT NOW());',
      };
    }

    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

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

          <div className="space-y-2">
            <h3 className="text-lg font-semibold">Create Comment (Server Action)</h3>
            <p className="text-sm text-muted-foreground">
              This form uses a Server Action to insert data directly into the database
            </p>
            <form action={createComment} className="flex gap-2">
              <Input
                name="comment"
                placeholder="Write a comment..."
                required
              />
              <Button type="submit">Submit</Button>
            </form>
            <p className="text-xs text-muted-foreground">
              Note: Make sure you&apos;ve created the comments table in Neon SQL Editor:
              <code className="block mt-1 p-2 bg-muted rounded text-xs">
                CREATE TABLE IF NOT EXISTS comments (id SERIAL PRIMARY KEY, comment TEXT, created_at TIMESTAMP DEFAULT NOW());
              </code>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

