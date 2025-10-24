// API endpoint for /api/auth/status

export async function onRequestGet(context) {
  const { env } = context;

  // ADMIN_PASSWORD will be an environment variable set in the Cloudflare dashboard.
  const isPasswordSet = env.ADMIN_PASSWORD && env.ADMIN_PASSWORD.length > 0;

  return new Response(JSON.stringify({ isPasswordSet }), {
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
    },
  });
}