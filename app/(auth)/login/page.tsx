import { LoginForm } from "./login-form";

export default function LoginPage() {
  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden px-4">
      <div className="blob pointer-events-none absolute -left-24 -top-24 h-72 w-72 rounded-full bg-brand-violet/30 blur-3xl" />
      <div
        className="blob pointer-events-none absolute -bottom-24 -right-16 h-80 w-80 rounded-full bg-brand-orange/30 blur-3xl"
        style={{ animationDelay: "-6s" }}
      />
      <div
        className="blob pointer-events-none absolute right-1/3 top-10 h-56 w-56 rounded-full bg-brand-teal/20 blur-3xl"
        style={{ animationDelay: "-3s" }}
      />

      <div className="card relative z-10 w-full max-w-sm p-8">
        <div className="mb-6 text-center">
          <p className="mb-2 text-3xl">🧪🩺</p>
          <h1 className="gradient-text text-3xl font-extrabold tracking-tight">
            The Crohnicles
          </h1>
          <p className="mt-2 text-sm text-muted">
            An epic 8-week saga of shakes, sweets, and staying regular.
          </p>
        </div>
        <LoginForm />
        <p className="mt-6 text-center text-xs text-muted">
          Two passwords live here: one for the hero of this story, one for the
          consultants who get to read it without touching anything.
        </p>
      </div>
    </main>
  );
}
