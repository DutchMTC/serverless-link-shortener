// API endpoint for /api/domains

export async function onRequestGet(context) {
  try {
    const { env } = context;
    const domainsString = env.DOMAINS || '';
    const domains = domainsString.split(',').map(d => d.trim()).filter(Boolean);

    return new Response(JSON.stringify({ domains }), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error(error);
    return new Response(JSON.stringify({ error: 'Failed to fetch domains.' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}