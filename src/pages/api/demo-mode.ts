export const prerender = false;

import type { APIRoute } from 'astro';

export const GET: APIRoute = async ({ locals }) => {
  const runtime = (locals as Record<string, unknown>).runtime as { env: Record<string, string> } | undefined;
  const isDemo = runtime?.env?.PUBLIC_DEMO_MODE === 'true' || import.meta.env.PUBLIC_DEMO_MODE === 'true';

  return new Response(JSON.stringify({ demo: isDemo }), {
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'public, max-age=3600',
    },
  });
};
