import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  Camera,
  X,
  Tag,
  FileText,
  DollarSign,
  MapPin,
  Layers,
  PackagePlus,
  AlertCircle,
  CheckCircle,
  ImagePlus,
  Sparkles
} from 'lucide-react';

const CATEGORIES = ['Books', 'Electronics', 'Cycles', 'Furniture', 'Essentials', 'Clothing', 'Sports', 'Other'];
const CONDITIONS = ['New', 'Like New', 'Good', 'Fair', 'Poor'];

const SellPage = () => {
  const { token, user } = useAuth();
  const navigate = useNavigate();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [category, setCategory] = useState('');
  const [condition, setCondition] = useState('Good');
  const [hostel, setHostel] = useState(user?.hostel || '');
  const [images, setImages] = useState([]);
  const [previews, setPreviews] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleImageSelect = (e) => {
    const files = Array.from(e.target.files);
    if (images.length + files.length > 5) {
      setError('Maximum 5 images allowed.');
      return;
    }

    const newImages = [...images, ...files];
    setImages(newImages);

    // Generate previews
    files.forEach(file => {
      const reader = new FileReader();
      reader.onload = (ev) => {
        setPreviews(prev => [...prev, ev.target.result]);
      };
      reader.readAsDataURL(file);
    });
    setError('');
  };

  const removeImage = (index) => {
    setImages(prev => prev.filter((_, i) => i !== index));
    setPreviews(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!title || !description || !price || !category) {
      setError('Please fill in all required fields.');
      return;
    }
    if (images.length === 0) {
      setError('Please add at least one product image.');
      return;
    }

    setSubmitting(true);

    try {
      const formData = new FormData();
      formData.append('title', title);
      formData.append('description', description);
      formData.append('price', price);
      formData.append('category', category);
      formData.append('condition', condition);
      formData.append('hostel', hostel);
      images.forEach(img => formData.append('images', img));

      const res = await fetch('/api/products', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      const data = await res.json();
      if (data.success) {
        setSuccess('Product listed successfully!');
        setTimeout(() => navigate(`/product/${data.data.product._id}`), 1200);
      } else {
        setError(data.message || 'Failed to list product.');
      }
    } catch (err) {
      console.error(err);
      setError('An error occurred. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="container section animate-fade" style={{ paddingTop: '40px', maxWidth: '720px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{ marginBottom: '32px', textAlign: 'center' }}>
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            background: 'rgba(0, 216, 255, 0.08)',
            border: '1px solid rgba(0, 216, 255, 0.2)',
            color: 'var(--neon-blue)',
            padding: '6px 16px',
            borderRadius: '99px',
            fontSize: '13px',
            marginBottom: '16px',
          }}
        >
          <Sparkles size={14} /> List on {user?.college}
        </div>
        <h1 style={{ fontSize: '28px', fontWeight: 800, marginBottom: '8px' }}>
          Sell a Product
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '15px' }}>
          Create a listing visible to students across your campus hostels.
        </p>
      </div>

      {/* Alerts */}
      {error && (
        <div style={{
          display: 'flex', alignItems: 'center', gap: '10px', padding: '12px 16px',
          borderRadius: '10px', background: 'rgba(244, 63, 94, 0.12)',
          border: '1px solid rgba(244, 63, 94, 0.2)', color: '#fda4af',
          fontSize: '13px', marginBottom: '20px'
        }}>
          <AlertCircle size={18} style={{ flexShrink: 0 }} /> {error}
        </div>
      )}
      {success && (
        <div style={{
          display: 'flex', alignItems: 'center', gap: '10px', padding: '12px 16px',
          borderRadius: '10px', background: 'rgba(16, 185, 129, 0.12)',
          border: '1px solid rgba(16, 185, 129, 0.2)', color: '#a7f3d0',
          fontSize: '13px', marginBottom: '20px'
        }}>
          <CheckCircle size={18} style={{ flexShrink: 0 }} /> {success}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div
          className="glass-panel"
          style={{ padding: '32px', borderRadius: '20px', marginBottom: '24px' }}
        >
          {/* Image Upload */}
          <div style={{ marginBottom: '28px' }}>
            <label className="form-label" style={{ marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Camera size={16} /> Product Images <span style={{ color: 'var(--neon-pink)', fontSize: '11px' }}>*</span>
            </label>

            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
              {previews.map((src, idx) => (
                <div
                  key={idx}
                  style={{
                    position: 'relative',
                    width: '100px',
                    height: '100px',
                    borderRadius: '12px',
                    overflow: 'hidden',
                    border: '1px solid var(--border-color)',
                  }}
                >
                  <img
                    src={src}
                    alt={`Preview ${idx + 1}`}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                  <button
                    type="button"
                    onClick={() => removeImage(idx)}
                    style={{
                      position: 'absolute', top: '4px', right: '4px',
                      background: 'rgba(0,0,0,0.7)', border: 'none',
                      borderRadius: '50%', width: '22px', height: '22px',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      cursor: 'pointer', color: '#fff',
                    }}
                  >
                    <X size={12} />
                  </button>
                </div>
              ))}

              {images.length < 5 && (
                <label
                  style={{
                    width: '100px',
                    height: '100px',
                    borderRadius: '12px',
                    border: '2px dashed rgba(255, 255, 255, 0.1)',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    color: 'var(--text-muted)',
                    gap: '4px',
                    fontSize: '11px',
                    transition: 'all 0.2s',
                  }}
                  className="upload-target"
                >
                  <ImagePlus size={20} />
                  <span>Add</span>
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleImageSelect}
                    style={{ display: 'none' }}
                  />
                </label>
              )}
            </div>
            <p style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '8px' }}>
              Upload up to 5 images. First image becomes the thumbnail.
            </p>
          </div>

          {/* Title */}
          <div className="form-group">
            <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Tag size={14} /> Title <span style={{ color: 'var(--neon-pink)', fontSize: '11px' }}>*</span>
            </label>
            <input
              type="text"
              placeholder="e.g. Casio FX-991EX Scientific Calculator"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="form-control"
              maxLength={100}
            />
          </div>

          {/* Description */}
          <div className="form-group">
            <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <FileText size={14} /> Description <span style={{ color: 'var(--neon-pink)', fontSize: '11px' }}>*</span>
            </label>
            <textarea
              placeholder="Describe the product condition, usage history, and any accessories included..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="form-control"
              rows={4}
              maxLength={1000}
              style={{ resize: 'vertical', minHeight: '100px' }}
            />
            <span style={{ fontSize: '11px', color: 'var(--text-muted)', textAlign: 'right' }}>
              {description.length}/1000
            </span>
          </div>

          {/* Price + Category Row */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
            <div className="form-group">
              <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <DollarSign size={14} /> Price (₹) <span style={{ color: 'var(--neon-pink)', fontSize: '11px' }}>*</span>
              </label>
              <input
                type="number"
                placeholder="500"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                className="form-control"
                min="0"
              />
            </div>

            <div className="form-group">
              <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Layers size={14} /> Category <span style={{ color: 'var(--neon-pink)', fontSize: '11px' }}>*</span>
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="form-control"
              >
                <option value="">Select category</option>
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Condition + Hostel Row */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
            <div className="form-group">
              <label className="form-label">Condition</label>
              <select
                value={condition}
                onChange={(e) => setCondition(e.target.value)}
                className="form-control"
              >
                {CONDITIONS.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <MapPin size={14} /> Hostel / Block
              </label>
              <input
                type="text"
                placeholder="Block C, Room 305"
                value={hostel}
                onChange={(e) => setHostel(e.target.value)}
                className="form-control"
              />
            </div>
          </div>
        </div>

        {/* Submit */}
        <button
          type="submit"
          className="btn btn-primary"
          disabled={submitting}
          style={{ width: '100%', padding: '14px', fontSize: '16px', borderRadius: '14px' }}
        >
          {submitting ? (
            <>
              <div className="loading-spinner" style={{ width: '18px', height: '18px', borderWidth: '2px' }} />
              Publishing...
            </>
          ) : (
            <>
              <PackagePlus size={18} /> Publish Listing
            </>
          )}
        </button>
      </form>

      <style>{`
        .upload-target:hover {
          border-color: var(--neon-blue) !important;
          color: var(--neon-blue) !important;
        }
      `}</style>
    </div>
  );
};

export default SellPage;
