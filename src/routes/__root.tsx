import { createRootRoute, HeadContent, Outlet, Scripts } from "@tanstack/react-router";
import { AuthProvider } from "@/lib/auth/provider";
import { PreviewHostBridge } from "@/components/preview-host-bridge";
import appCss from "../styles.css?url";

const APP_NAME = "FLOWLINE";
const host = import.meta.env.VITE_PUBLIC_HOSTNAME;
const ogImage = host ? `https://${host}/og.jpg` : undefined;

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      {
        name: "viewport",
        content:
          "width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no, viewport-fit=cover",
      },
      { title: "FLOWLINE — an endless mountain" },
      {
        name: "description",
        content:
          "One endless sunlit mountain. Carve clean lines, build flow, ride it forever — together.",
      },
      { name: "apple-mobile-web-app-title", content: APP_NAME },
      { name: "theme-color", content: "#8ec6e8" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: "FLOWLINE — an endless mountain" },
      {
        name: "twitter:description",
        content:
          "Carve clean, build flow, chase the horizon. An endless snowboarding mountain shared by everyone online.",
      },
      { property: "og:type", content: "x:game" },
      { property: "og:title", content: "FLOWLINE — an endless mountain" },
      {
        property: "og:description",
        content:
          "Carve clean, build flow, chase the horizon. An endless snowboarding mountain shared by everyone online.",
      },
      ...(ogImage
        ? [
            { property: "og:image", content: ogImage },
            { property: "og:image:width", content: "1200" },
            { property: "og:image:height", content: "630" },
            { name: "twitter:image", content: ogImage },
          ]
        : []),
    ],
    links: [
      { rel: "icon", type: "image/svg+xml", href: "/favicon.svg" },
      { rel: "stylesheet", href: appCss },
      { rel: "manifest", href: "/__grok/manifest.webmanifest" },
      { rel: "apple-touch-icon", href: "/__grok/icon-180.png" },
    ],
  }),
  component: () => (
    <html lang="en" suppressHydrationWarning>
      <head>
        <HeadContent />
      </head>
      <body className="h-full overflow-hidden bg-[#0d1a24] text-white antialiased">
        <PreviewHostBridge />
        <AuthProvider>
          <Outlet />
        </AuthProvider>
        <Scripts />
      </body>
    </html>
  ),
});
