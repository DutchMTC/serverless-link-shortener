// API endpoint for /api/auth/status

export async function onRequestGet(context) {
  const { env } = context;

  // Check for both the admin password and the public link creation password.
  const isPasswordSet = env.ADMIN_PASSWORD && env.ADMIN_PASSWORD.length > 0;
  const passwordProtected = env.LINK_SHORTENER_PASSWORD && env.LINK_SHORTENER_PASSWORD.length > 0;

  return new Response(JSON.stringify({ isPasswordSet, passwordProtected }), {
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
    },
  });
}