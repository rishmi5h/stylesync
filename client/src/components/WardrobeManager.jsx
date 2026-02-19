import { useState, useRef } from 'react';
import { classifyItem } from '../services/api';
import { getWardrobe, addWardrobeItem, removeWardrobeItem, updateWardrobeItem } from '../utils/storage';
import ItemCard from './ItemCard';

const loadingMessages = [
  'Analyzing your style...',
  'Identifying fabrics and colors...',
  'Classifying your item...',
  'Our AI stylist is looking...',
];

export default function WardrobeManager() {
  const [wardrobe, setWardrobe] = useState(() => getWardrobe());
  const [uploading, setUploading] = useState(false);
  const [loadingMsg, setLoadingMsg] = useState('');
  const [editingItem, setEditingItem] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [error, setError] = useState('');
  const fileInputRef = useRef(null);

  const compressImage = (file) => {
    return new Promise((resolve) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();
      const reader = new FileReader();

      reader.onload = (e) => {
        img.onload = () => {
          const maxDim = 800;
          let { width, height } = img;
          if (width > maxDim || height > maxDim) {
            const ratio = Math.min(maxDim / width, maxDim / height);
            width *= ratio;
            height *= ratio;
          }
          canvas.width = width;
          canvas.height = height;
          ctx.drawImage(img, 0, 0, width, height);
          canvas.toBlob(resolve, 'image/jpeg', 0.8);
        };
        img.src = e.target.result;
      };
      reader.readAsDataURL(file);
    });
  };

  const handleUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    setError('');
    setUploading(true);

    for (const file of files) {
      try {
        const msgIndex = Math.floor(Math.random() * loadingMessages.length);
        setLoadingMsg(loadingMessages[msgIndex]);

        const compressed = await compressImage(file);
        const imageUrl = URL.createObjectURL(compressed);

        const result = await classifyItem(compressed);
        const classification = result.classification;

        const newItem = addWardrobeItem({
          ...classification,
          image: await blobToDataUrl(compressed),
        });

        URL.revokeObjectURL(imageUrl);
        setWardrobe(getWardrobe());
      } catch (err) {
        setError(err.message || 'Failed to classify item. Please try again.');
      }
    }

    setUploading(false);
    setLoadingMsg('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const blobToDataUrl = (blob) => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.readAsDataURL(blob);
    });
  };

  const handleDelete = (id) => {
    removeWardrobeItem(id);
    setWardrobe(getWardrobe());
  };

  const handleEdit = (item) => {
    setEditingItem(item.id);
    setEditForm({ ...item });
  };

  const handleSaveEdit = () => {
    updateWardrobeItem(editingItem, editForm);
    setWardrobe(getWardrobe());
    setEditingItem(null);
    setEditForm({});
  };

  const handleCancelEdit = () => {
    setEditingItem(null);
    setEditForm({});
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-2xl font-bold section-heading">My Wardrobe</h2>
          <p className="text-text-muted text-sm mt-1">
            {wardrobe.length} item{wardrobe.length !== 1 ? 's' : ''} in your collection
          </p>
        </div>
        <label className="cursor-pointer inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary hover:bg-primary-dark text-white font-medium text-sm transition-colors btn-press">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          Add Items
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            onChange={handleUpload}
            className="hidden"
          />
        </label>
      </div>

      {error && (
        <div className="mb-6 p-4 rounded-xl bg-danger/10 border border-danger/20 text-danger text-sm">
          {error}
          <button onClick={() => setError('')} className="ml-3 underline text-xs">Dismiss</button>
        </div>
      )}

      {uploading && (
        <div className="mb-6 p-6 rounded-2xl bg-surface-light border border-surface-lighter flex items-center gap-4">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          <div>
            <p className="text-sm font-medium">{loadingMsg}</p>
            <p className="text-xs text-text-muted mt-1">This may take a moment</p>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {editingItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-surface rounded-2xl border border-surface-lighter p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-bold mb-4">Edit Item</h3>
            <div className="space-y-3">
              {['category', 'subcategory', 'color', 'pattern', 'fabric_guess', 'formality', 'season', 'description'].map((field) => (
                <div key={field}>
                  <label className="block text-xs text-text-muted mb-1 capitalize">{field.replace('_', ' ')}</label>
                  {field === 'category' ? (
                    <select
                      value={editForm[field] || ''}
                      onChange={(e) => setEditForm({ ...editForm, [field]: e.target.value })}
                      className="w-full px-3 py-2 rounded-lg bg-surface-lighter border border-surface-lighter text-sm focus:outline-none focus:border-primary"
                    >
                      {['top', 'bottom', 'outerwear', 'footwear', 'accessory', 'innerwear'].map((c) => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                  ) : field === 'formality' ? (
                    <select
                      value={editForm[field] || ''}
                      onChange={(e) => setEditForm({ ...editForm, [field]: e.target.value })}
                      className="w-full px-3 py-2 rounded-lg bg-surface-lighter border border-surface-lighter text-sm focus:outline-none focus:border-primary"
                    >
                      {['casual', 'smart_casual', 'semi_formal', 'formal'].map((f) => (
                        <option key={f} value={f}>{f.replace('_', ' ')}</option>
                      ))}
                    </select>
                  ) : field === 'season' ? (
                    <select
                      value={editForm[field] || ''}
                      onChange={(e) => setEditForm({ ...editForm, [field]: e.target.value })}
                      className="w-full px-3 py-2 rounded-lg bg-surface-lighter border border-surface-lighter text-sm focus:outline-none focus:border-primary"
                    >
                      {['summer', 'winter', 'all_season', 'rainy'].map((s) => (
                        <option key={s} value={s}>{s.replace('_', ' ')}</option>
                      ))}
                    </select>
                  ) : (
                    <input
                      type="text"
                      value={editForm[field] || ''}
                      onChange={(e) => setEditForm({ ...editForm, [field]: e.target.value })}
                      className="w-full px-3 py-2 rounded-lg bg-surface-lighter border border-surface-lighter text-sm focus:outline-none focus:border-primary"
                    />
                  )}
                </div>
              ))}
            </div>
            <div className="flex gap-2 mt-6">
              <button
                onClick={handleSaveEdit}
                className="flex-1 py-2.5 rounded-xl bg-primary hover:bg-primary-dark text-white text-sm font-medium transition-colors"
              >
                Save Changes
              </button>
              <button
                onClick={handleCancelEdit}
                className="flex-1 py-2.5 rounded-xl bg-surface-lighter hover:bg-surface-lighter/80 text-sm font-medium transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Wardrobe Grid */}
      {wardrobe.length === 0 ? (
        <div className="text-center py-20">
          <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-surface-light flex items-center justify-center animate-float">
            <svg className="w-10 h-10 text-text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.41a2.25 2.25 0 013.182 0l2.909 2.91m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold mb-2">Your wardrobe is empty</h3>
          <p className="text-text-muted text-sm max-w-sm mx-auto">
            Upload photos of your clothing items and our AI will automatically classify them for you.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {wardrobe.map((item, index) => (
            <div key={item.id} className="card-stagger" style={{ animationDelay: `${index * 60}ms` }}>
              <ItemCard
                item={item}
                onDelete={handleDelete}
                onEdit={handleEdit}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
