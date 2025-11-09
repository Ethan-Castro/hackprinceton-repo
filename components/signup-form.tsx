"use client";

import { useState } from "react";
import { GalleryVerticalEnd } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
  FieldSeparator,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, CheckCircle2 } from "lucide-react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";

export function SignupForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPasswordField, setShowPasswordField] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    // If password field is not shown yet, just show it
    if (!showPasswordField) {
      setShowPasswordField(true);
      return;
    }

    // Validation
    if (password.length < 8) {
      setError("Password must be at least 8 characters long");
      return;
    }

    setLoading(true);

    try {
      // Register user
      const registerResponse = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, name: name || undefined }),
      });

      const data = await registerResponse.json();

      if (!registerResponse.ok) {
        setError(data.error || "Registration failed");
        setLoading(false);
        return;
      }

      // Auto sign in after registration
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        setError(
          "Registration successful, but sign in failed. Please try logging in."
        );
        setLoading(false);
      } else {
        // Redirect to main app
        router.push("/");
        router.refresh();
      }
    } catch (err) {
      setError("An error occurred. Please try again.");
      setLoading(false);
    }
  };

  const handleContinueAnonymously = () => {
    // Just redirect to main app - no auth needed
    router.push("/");
  };

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <form onSubmit={handleSubmit}>
        <FieldGroup>
          <div className="flex flex-col items-center gap-2 text-center">
            <a
              href="/"
              className="flex flex-col items-center gap-2 font-medium"
            >
              <div className="flex size-8 items-center justify-center rounded-md">
                <GalleryVerticalEnd className="size-6" />
              </div>
              <span className="sr-only">Augment</span>
            </a>
            <h1 className="text-xl font-bold">Welcome to Augment</h1>
            <FieldDescription>
              Already have an account?{" "}
              <a href="/auth/login" className="text-primary hover:underline">
                Sign in
              </a>
            </FieldDescription>
          </div>

          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <Field>
            <FieldLabel htmlFor="name">Name (Optional)</FieldLabel>
            <Input
              id="name"
              type="text"
              placeholder="John Doe"
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={loading}
            />
          </Field>

          <Field>
            <FieldLabel htmlFor="email">Email</FieldLabel>
            <Input
              id="email"
              type="email"
              placeholder="m@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={loading}
            />
          </Field>

          {showPasswordField && (
            <Field>
              <FieldLabel htmlFor="password">Password</FieldLabel>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={loading}
                minLength={8}
              />
              <FieldDescription>Must be at least 8 characters</FieldDescription>
            </Field>
          )}

          <Field>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading
                ? "Creating Account..."
                : showPasswordField
                ? "Create Account"
                : "Continue"}
            </Button>
          </Field>

          <FieldSeparator>Or</FieldSeparator>

          <Field>
            <Button
              variant="outline"
              type="button"
              className="w-full"
              onClick={handleContinueAnonymously}
              disabled={loading}
            >
              Continue Without Account
            </Button>
          </Field>

          <div className="rounded-lg border bg-muted/50 p-4">
            <p className="text-sm font-medium mb-2">Why create an account?</p>
            <ul className="space-y-1 text-sm text-muted-foreground">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-green-500 flex-shrink-0" />
                Save your chat history across devices
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-green-500 flex-shrink-0" />
                Access your projects anytime
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-green-500 flex-shrink-0" />
                Sync health data and trackers
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-green-500 flex-shrink-0" />
                Higher usage limits (50 chats/day)
              </li>
            </ul>
          </div>
        </FieldGroup>
      </form>
      <FieldDescription className="text-center">
        By continuing, you agree to our{" "}
        <a href="/terms" className="text-primary hover:underline">
          Terms of Service
        </a>{" "}
        and{" "}
        <a href="/privacy" className="text-primary hover:underline">
          Privacy Policy
        </a>
        .
      </FieldDescription>
    </div>
  );
}

