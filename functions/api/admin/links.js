// API endpoint for /api/admin/links

// Middleware to check for the admin password
const checkAdminAuth = (context) => {
  const { request, env } = context;
  if (!env.ADMIN_PASSWORD) {
    return new Response(JSON.stringify({ error: 'Admin password is not set up.' }), { status: 500 });
  }
  const providedPassword = request.headers.get('X-Admin-Password');
  if (providedPassword !== env.ADMIN_PASSWORD) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
  }
  return null; // Auth successful
};

/**
 * Handles GET requests to list all links.
 */
export async function onRequestGet(context) {
  const authError = checkAdminAuth(context);
  if (authError) return authError;

  try {
    const { env, request } = context;
    const url = new URL(request.url);
    const domainFilter = url.searchParams.get('domain');

    const list = await env.LINKS.list();
    const links = [];

    for (const key of list.keys) {
      const [domain, ...pathParts] = key.name.split(':');
      const path = pathParts.join(':');

      if (!domainFilter || domain === domainFilter) {
        const value = await env.LINKS.get(key.name);
        if (value) {
          const data = JSON.parse(value);
          links.push({
            key: key.name,
            path: path,
            domain: domain,
            ...data,
          });
        }
      }
    }
    return new Response(JSON.stringify(links), { headers: { 'Content-Type': 'application/json' } });
  } catch (error) {
    console.error(error);
    return new Response(JSON.stringify({ error: 'Failed to fetch links.' }), { status: 500 });
  }
}

/**
 * Handles PUT requests to update a link.
 */
export async function onRequestPut(context) {
  const authError = checkAdminAuth(context);
  if (authError) return authError;

  try {
    const { request, env } = context;
    const { key, ...updatedProperties } = await request.json();

    const existingValue = await env.LINKS.get(key);
    if (!existingValue) {
      return new Response(JSON.stringify({ error: 'Link not found.' }), { status: 404 });
    }

    const existingData = JSON.parse(existingValue);
    const newData = { ...existingData, ...updatedProperties };

    // Check if the domain has changed
    if (updatedProperties.domain && updatedProperties.domain !== existingData.domain) {
      const [_originalDomain, ...pathParts] = key.split(':');
      const path = pathParts.join(':');
      const newKey = `${updatedProperties.domain}:${path}`;

      // Check for conflict with the new key
      const conflictCheck = await env.LINKS.get(newKey);
      if (conflictCheck) {
        return new Response(JSON.stringify({ error: `The path "${path}" already exists on the domain "${updatedProperties.domain}".` }), { status: 409 });
      }

      // "Move" the link by creating a new entry and deleting the old one
      await env.LINKS.put(newKey, JSON.stringify(newData));
      await env.LINKS.delete(key);
    } else {
      // Just update the data if the domain is the same
      await env.LINKS.put(key, JSON.stringify(newData));
    }

    return new Response(JSON.stringify({ message: 'Link updated successfully.' }), { status: 200 });
  } catch (error) {
    console.error(error);
    return new Response(JSON.stringify({ error: 'Failed to update link.' }), { status: 500 });
  }
}

/**
 * Handles DELETE requests to remove a link.
 */
export async function onRequestDelete(context) {
  const authError = checkAdminAuth(context);
  if (authError) return authError;

  try {
    const { request, env } = context;
    const { key } = await request.json();

    await env.LINKS.delete(key);
    return new Response(JSON.stringify({ message: 'Link deleted successfully.' }), { status: 200 });
  } catch (error) {
    return new Response(JSON.stringify({ error: 'Failed to delete link.' }), { status: 500 });
  }
}