import { createFileRoute } from "@tanstack/react-router";
import { GROK_PROVIDERS, authEnabled, signIn } from "@/lib/auth/client";

export const Route = createFileRoute("/login")({ component: Login });

function Login() {
  return (
    <main className="grid min-h-screen place-items-center bg-[#0d1a24] px-6 text-[#eef6fb]">
      <div className="w-full max-w-sm space-y-5 rounded-2xl border border-white/15 bg-[#0a2030]/70 p-6 shadow-[0_12px_40px_rgba(6,22,36,.45)] backdrop-blur-md">
        <div>
          <p className="text-[11px] font-extrabold tracking-[0.28em] text-[#9fe6a0]">
            FLOWLINE
          </p>
          <h1 className="mt-1 text-2xl font-extrabold tracking-tight">Sign in</h1>
          <p className="mt-1 text-sm text-white/60">
            Optional — drop in as a guest anytime.
          </p>
        </div>
        {authEnabled ? (
          GROK_PROVIDERS.map((p) => (
            <button
              key={p.providerId}
              type="button"
              onClick={() => signIn(p.providerId, { callbackURL: "/" })}
              className="w-full rounded-xl border border-white/20 bg-white/8 px-4 py-2.5 font-semibold hover:bg-white/14"
            >
              Continue with {p.label}
            </button>
          ))
        ) : (
          <p className="text-sm text-white/50">Sign-in is disabled.</p>
        )}
        <a href="/" className="block text-center text-sm font-semibold text-[#ffc65e] hover:underline">
          Back to the mountain
        </a>
      </div>
    </main>
  );
}
