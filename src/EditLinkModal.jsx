import { useState, useEffect } from 'react';
import './EditLinkModal.css';

function EditLinkModal({ link, onSave, onCancel }) {
  const [formData, setFormData] = useState({});

  useEffect(() => {
    if (link) {
      setFormData({
        url: link.url || '',
        embeds: link.embeds !== false, // Default to true if undefined
        cloaking: link.cloaking || false,
        metadata: link.metadata || { title: '', description: '', image: '' },
      });
    }
  }, [link]);

  if (!link) {
    return null;
  }

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (name.startsWith('metadata.')) {
      const key = name.split('.')[1];
      setFormData(prev => ({
        ...prev,
        metadata: { ...prev.metadata, [key]: value }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: type === 'checkbox' ? checked : value
      }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(link.path, formData);
  };

  return (
    <div className="modal-backdrop">
      <div className="modal-content">
        <h2>Edit Link: {link.path}</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="url">Destination URL</label>
            <input
              type="url"
              id="url"
              name="url"
              value={formData.url}
              onChange={handleChange}
              required
            />
          </div>

          <div className="setting-item">
            <label htmlFor="embeds">Enable link previews (embeds)</label>
            <label className="switch">
              <input
                type="checkbox"
                id="embeds"
                name="embeds"
                checked={formData.embeds}
                onChange={handleChange}
              />
              <span className="slider"></span>
            </label>
          </div>

          <div className="setting-item">
            <label htmlFor="cloaking">Enable link cloaking</label>
            <label className="switch">
              <input
                type="checkbox"
                id="cloaking"
                name="cloaking"
                checked={formData.cloaking}
                onChange={handleChange}
              />
              <span className="slider"></span>
            </label>
          </div>

          <div className="setting-item">
            <label>Enable custom metadata</label>
            <label className="switch">
              <input
                type="checkbox"
                checked={!!formData.metadata}
                onChange={(e) => {
                  if (e.target.checked) {
                    setFormData(prev => ({ ...prev, metadata: { title: '', description: '', image: '' } }));
                  } else {
                    setFormData(prev => ({ ...prev, metadata: null }));
                  }
                }}
              />
              <span className="slider"></span>
            </label>
          </div>

          {formData.metadata && (
            <>
              <div className="form-group">
                <label htmlFor="metadata.title">Title</label>
                <input
                  type="text"
                  id="metadata.title"
                  name="metadata.title"
                  value={formData.metadata.title}
                  onChange={handleChange}
                />
              </div>
              <div className="form-group">
                <label htmlFor="metadata.description">Description</label>
                <input
                  type="text"
                  id="metadata.description"
                  name="metadata.description"
                  value={formData.metadata.description}
                  onChange={handleChange}
                />
              </div>
              <div className="form-group">
                <label htmlFor="metadata.image">Favicon/Image URL</label>
                <input
                  type="url"
                  id="metadata.image"
                  name="metadata.image"
                  value={formData.metadata.image}
                  onChange={handleChange}
                />
              </div>
            </>
          )}

          <div className="modal-actions">
            <button type="button" onClick={onCancel} className="secondary">Cancel</button>
            <button type="submit" className="primary">Save Changes</button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default EditLinkModal;