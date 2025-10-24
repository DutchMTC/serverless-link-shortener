import { useState, useEffect } from 'react';
import './Admin.css';

function Admin() {
  const [password, setPassword] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [links, setLinks] = useState([]);
  const [editingLink, setEditingLink] = useState(null);
  const [isPasswordSet, setIsPasswordSet] = useState(null); // null = loading

  const handleLogin = (e) => {
    e.preventDefault();
    // For simplicity, we'll verify the password on the first API call.
    setIsAuthenticated(true);
  };

  useEffect(() => {
    const checkPasswordStatus = async () => {
      try {
        const response = await fetch('/api/auth/status');
        const data = await response.json();
        setIsPasswordSet(data.isPasswordSet);
      } catch (err) {
        setError('Could not connect to the server to check password status.');
        setIsPasswordSet(false); // Fallback to show an error
      }
    };
    checkPasswordStatus();
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      fetchLinks();
    }
  }, [isAuthenticated]);

  const fetchLinks = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/admin/links', {
        headers: { 'X-Admin-Password': password },
      });
      if (!response.ok) {
        let errorText;
        try {
          const data = await response.json();
          errorText = data.error;
        } catch (e) {
          errorText = await response.text();
        }
        throw new Error(errorText || 'Failed to fetch links.');
      }
      const data = await response.json();
      setLinks(data.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0)));
    } catch (err) {
      setError(err.message);
      setIsAuthenticated(false); // De-auth on error
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (path) => {
    if (!window.confirm(`Are you sure you want to delete the link for "${path}"?`)) {
      return;
    }
    try {
      const response = await fetch('/api/admin/links', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'X-Admin-Password': password,
        },
        body: JSON.stringify({ path }),
      });
      if (!response.ok) throw new Error('Failed to delete link.');
      setLinks(links.filter((link) => link.path !== path));
    } catch (err) {
      setError(err.message);
    }
  };

  const handleUpdate = async (path, newUrl) => {
    try {
      const response = await fetch('/api/admin/links', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'X-Admin-Password': password,
        },
        body: JSON.stringify({ path, newUrl }),
      });
      if (!response.ok) throw new Error('Failed to update link.');
      setEditingLink(null);
      fetchLinks(); // Refresh the list
    } catch (err) {
      setError(err.message);
    }
  };

  if (isPasswordSet === null) {
    return (
      <div className="admin-container">
        <div className="login-card">
          <h1>Admin Access</h1>
          <p>Checking configuration...</p>
        </div>
      </div>
    );
  }

  if (!isPasswordSet) {
    return (
      <div className="admin-container">
        <div className="login-card">
          <h1>Admin Access</h1>
          <p className="error" style={{ marginTop: '1rem' }}>
            A password is not set yet. Please set it in your environment variables.
          </p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="admin-container">
        <div className="login-card">
          <h1>Admin Access</h1>
          <form onSubmit={handleLogin}>
            <div className="form-group">
              <label htmlFor="admin-password">Password</label>
              <input
                type="password"
                id="admin-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <button type="submit" className="primary">Login</button>
            {error && <p className="error" style={{ marginTop: '1rem' }}>{error}</p>}
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-container">
      <h1>Admin Panel</h1>
      {loading && <p>Loading links...</p>}
      {error && <p className="error">{error}</p>}
      <div className="table-responsive">
        <table className="links-table">
          <thead>
            <tr>
              <th>Short Path</th>
              <th>Destination URL</th>
              <th>Created</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {links.map((link) => (
              <tr key={link.path}>
                <td data-label="Short Path">{link.path}</td>
                <td data-label="Destination URL">
                  {editingLink === link.path ? (
                    <input
                      type="url"
                      defaultValue={link.url}
                      onBlur={(e) => handleUpdate(link.path, e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') handleUpdate(link.path, e.target.value);
                        if (e.key === 'Escape') setEditingLink(null);
                      }}
                      autoFocus
                    />
                  ) : (
                    <a href={link.url} target="_blank" rel="noopener noreferrer">{link.url}</a>
                  )}
                </td>
                <td data-label="Created">
                  {link.createdAt ? new Date(link.createdAt).toLocaleString() : 'N/A'}
                </td>
                <td data-label="Actions">
                  <button onClick={() => setEditingLink(link.path)} className="secondary">Edit</button>
                  <button onClick={() => handleDelete(link.path)} className="danger">Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default Admin;