import { createFileRoute } from "@tanstack/react-router";
import gameHtml from "../../public/flowline.html?raw";

export const Route = createFileRoute("/")({
  server: {
    handlers: {
      GET: () =>
        new Response(gameHtml, {
          headers: {
            "content-type": "text/html; charset=utf-8",
            "cache-control": "no-cache",
          },
        }),
    },
  },
  component: Home,
});

function Home() {
  if (typeof window !== "undefined") {
    window.location.replace("/");
  }
  return (
    <main className="grid min-h-screen place-items-center bg-[#0d1a24] text-white">
      <p className="text-sm font-semibold tracking-[0.28em] text-white/70">FLOWLINE</p>
    </main>
  );
}
