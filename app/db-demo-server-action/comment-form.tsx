'use client';

import { useFormState } from 'react-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { createComment, type CommentActionState } from './actions';

export function CommentForm() {
  const [state, formAction] = useFormState<CommentActionState, FormData>(
    createComment,
    null
  );

  return (
    <div className="space-y-2">
      <h3 className="text-lg font-semibold">Create Comment (Server Action)</h3>
      <p className="text-sm text-muted-foreground">
        This form uses a Server Action to insert data directly into the database
      </p>
      <form action={formAction} className="flex gap-2">
        <Input
          name="comment"
          placeholder="Write a comment..."
          required
        />
        <Button type="submit">Submit</Button>
      </form>
      {state?.success === false && (
        <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-md">
          <p className="text-sm text-destructive font-medium">Error:</p>
          <p className="text-sm text-destructive">{state.error}</p>
          {state.hint && (
            <p className="text-xs text-muted-foreground mt-2">{state.hint}</p>
          )}
        </div>
      )}
      {state?.success === true && (
        <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-md">
          <p className="text-sm text-green-600 dark:text-green-400 font-medium">
            ✓ {state.message}
          </p>
        </div>
      )}
      <p className="text-xs text-muted-foreground">
        Note: Make sure you&apos;ve created the comments table in Neon SQL Editor:
        <code className="block mt-1 p-2 bg-muted rounded text-xs">
          CREATE TABLE IF NOT EXISTS comments (id SERIAL PRIMARY KEY, comment TEXT, created_at TIMESTAMP DEFAULT NOW());
        </code>
      </p>
    </div>
  );
}


