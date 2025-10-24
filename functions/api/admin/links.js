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
    const { env } = context;
    const list = await env.LINKS.list();
    const links = [];

    for (const key of list.keys) {
      const value = await env.LINKS.get(key.name);
      if (value) {
        const data = JSON.parse(value);
        links.push({
          path: key.name,
          ...data,
        });
      }
    }
    return new Response(JSON.stringify(links), { headers: { 'Content-Type': 'application/json' } });
  } catch (error) {
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
    const { path, ...updatedProperties } = await request.json();

    const existingValue = await env.LINKS.get(path);
    if (!existingValue) {
      return new Response(JSON.stringify({ error: 'Link not found.' }), { status: 404 });
    }

    const data = JSON.parse(existingValue);
    // Merge the updated properties into the existing data
    const newData = { ...data, ...updatedProperties };

    await env.LINKS.put(path, JSON.stringify(newData));
    return new Response(JSON.stringify({ message: 'Link updated successfully.' }), { status: 200 });
  } catch (error) {
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
    const { path } = await request.json();

    await env.LINKS.delete(path);
    return new Response(JSON.stringify({ message: 'Link deleted successfully.' }), { status: 200 });
  } catch (error) {
    return new Response(JSON.stringify({ error: 'Failed to delete link.' }), { status: 500 });
  }
}