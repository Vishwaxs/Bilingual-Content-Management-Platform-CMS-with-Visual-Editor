import { useEffect, useState } from 'react';
import { useEditMode } from '@/contexts/EditModeContext';
import { useAllCmsContent } from '@/hooks/useEditableCms';
import { X, Type, Image, Palette, Hash, Link2, FileText, FolderOpen } from 'lucide-react';
import { MediaPickerModal } from './MediaPickerModal';

const TYPE_ICONS: Record<string, typeof Type> = {
  text: Type,
  text_hi: Type,
  richtext: FileText,
  image_url: Image,
  color: Palette,
  number: Hash,
  url: Link2,
  boolean: Hash,
};

export function EditPanel() {
  const { isEditMode, selectedKey, selectElement, setPendingValue, pendingEdits } = useEditMode();
  const { data: cmsData } = useAllCmsContent();

  // Find the selected row + its sibling (EN/HI pair)
  const selectedRow = selectedKey ? cmsData?.map.get(selectedKey) : null;

  // Figure out the EN/HI pair from the key pattern: section:element:property
  // e.g. hero:title_line1:text_en → hero:title_line1:text_hi
  const siblingKey = selectedKey
    ? selectedKey.endsWith('_en')
      ? selectedKey.replace(/_en$/, '_hi')
      : selectedKey.endsWith('_hi')
        ? selectedKey.replace(/_hi$/, '_en')
        : null
    : null;
  const siblingRow = siblingKey ? cmsData?.map.get(siblingKey) : null;

  // Local state for the input fields
  const [localValue, setLocalValue] = useState('');
  const [siblingValue, setSiblingValue] = useState('');
  const [showMediaPicker, setShowMediaPicker] = useState(false);

  useEffect(() => {
    if (selectedRow) {
      setLocalValue(pendingEdits.get(selectedKey!) ?? selectedRow.value);
    }
    if (siblingRow && siblingKey) {
      setSiblingValue(pendingEdits.get(siblingKey) ?? siblingRow.value);
    }
  }, [selectedKey, selectedRow, siblingRow, siblingKey, pendingEdits]);

  if (!isEditMode || !selectedKey || !selectedRow) return null;

  const Icon = TYPE_ICONS[selectedRow.type] ?? Type;
  const isTextType = ['text', 'text_hi', 'richtext'].includes(selectedRow.type);
  const isImageType = selectedRow.type === 'image_url';
  const isColorType = selectedRow.type === 'color';

  const handleApply = () => {
    setPendingValue(selectedKey, localValue);
    if (siblingKey && siblingRow) {
      setPendingValue(siblingKey, siblingValue);
    }
  };

  const handleClose = () => selectElement(null);

  return (
    <div
      style={{
        position: 'fixed',
        top: 52, // below toolbar
        right: 0,
        bottom: 0,
        width: 340,
        zIndex: 9998,
        background: '#fff',
        borderLeft: '1px solid #e5e7eb',
        boxShadow: '-4px 0 24px rgba(0,0,0,0.1)',
        display: 'flex',
        flexDirection: 'column',
        fontFamily: 'Inter, system-ui, sans-serif',
      }}
    >
      {/* Header */}
      <div
        style={{
          padding: '12px 16px',
          borderBottom: '1px solid #e5e7eb',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: '#fafafa',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Icon style={{ width: 16, height: 16, color: '#FF6B00' }} />
          <span style={{ fontSize: 13, fontWeight: 700, color: '#111' }}>Edit Content</span>
        </div>
        <button
          onClick={handleClose}
          style={{
            background: 'none', border: 'none', cursor: 'pointer', padding: 4,
            color: '#9ca3af', borderRadius: 4,
          }}
        >
          <X style={{ width: 16, height: 16 }} />
        </button>
      </div>

      {/* Body */}
      <div style={{ flex: 1, overflow: 'auto', padding: 16 }}>
        {/* Key badge */}
        <div style={{ marginBottom: 16 }}>
          <span style={{
            fontSize: 10, fontWeight: 700, color: '#6b7280',
            textTransform: 'uppercase', letterSpacing: '0.05em',
          }}>
            CMS Key
          </span>
          <code style={{
            display: 'block', marginTop: 4, fontSize: 11, fontFamily: 'monospace',
            background: '#f3f4f6', padding: '6px 10px', borderRadius: 6, color: '#111',
            wordBreak: 'break-all',
          }}>
            {selectedKey}
          </code>
        </div>

        {/* Label */}
        <div style={{ marginBottom: 16 }}>
          <span style={{
            fontSize: 10, fontWeight: 700, color: '#6b7280',
            textTransform: 'uppercase', letterSpacing: '0.05em',
          }}>
            Label
          </span>
          <p style={{ fontSize: 13, color: '#111', marginTop: 2 }}>
            {selectedRow.label || selectedRow.key}
          </p>
          {selectedRow.description && (
            <p style={{ fontSize: 11, color: '#9ca3af', marginTop: 2 }}>
              {selectedRow.description}
            </p>
          )}
        </div>

        {/* Type badge */}
        <div style={{ marginBottom: 16 }}>
          <span style={{
            fontSize: 9, fontWeight: 700, textTransform: 'uppercase',
            letterSpacing: '0.08em', padding: '3px 8px', borderRadius: 4,
            background: '#FFF7ED', color: '#FF6B00', border: '1px solid #FFEDD5',
          }}>
            {selectedRow.type}
          </span>
          <span style={{
            fontSize: 9, fontWeight: 700, textTransform: 'uppercase',
            letterSpacing: '0.08em', padding: '3px 8px', borderRadius: 4,
            background: '#F0FDF4', color: '#16A34A', border: '1px solid #DCFCE7',
            marginLeft: 6,
          }}>
            {selectedRow.section}
          </span>
        </div>

        <hr style={{ border: 'none', borderTop: '1px solid #f3f4f6', margin: '16px 0' }} />

        {/* Primary field */}
        <div style={{ marginBottom: 16 }}>
          <label style={{
            fontSize: 11, fontWeight: 700, color: '#374151', display: 'block', marginBottom: 6,
          }}>
            {selectedRow.label || 'Value'}
            {selectedKey.endsWith('_en') && <span style={{ color: '#9ca3af', fontWeight: 400 }}> (English)</span>}
            {selectedKey.endsWith('_hi') && <span style={{ color: '#9ca3af', fontWeight: 400 }}> (Hindi)</span>}
          </label>
          {isColorType ? (
            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              <input
                type="color"
                value={localValue || '#000000'}
                onChange={(e) => setLocalValue(e.target.value)}
                style={{ width: 40, height: 36, border: 'none', cursor: 'pointer', borderRadius: 6 }}
              />
              <input
                type="text"
                value={localValue}
                onChange={(e) => setLocalValue(e.target.value)}
                style={{
                  flex: 1, fontSize: 12, padding: '8px 10px', border: '1px solid #e5e7eb',
                  borderRadius: 6, outline: 'none', fontFamily: 'monospace',
                }}
              />
            </div>
          ) : isImageType ? (
            <div>
              <div style={{ display: 'flex', gap: 6, marginBottom: 8 }}>
                <input
                  type="url"
                  value={localValue}
                  onChange={(e) => setLocalValue(e.target.value)}
                  placeholder="https://..."
                  style={{
                    flex: 1, fontSize: 12, padding: '8px 10px', border: '1px solid #e5e7eb',
                    borderRadius: 6, outline: 'none',
                  }}
                />
                <button
                  onClick={() => setShowMediaPicker(true)}
                  style={{
                    fontSize: 11, fontWeight: 600, padding: '6px 10px', borderRadius: 6,
                    border: '1px solid #e5e7eb', background: '#f9fafb', cursor: 'pointer',
                    display: 'flex', alignItems: 'center', gap: 4, color: '#374151',
                    whiteSpace: 'nowrap',
                  }}
                >
                  <FolderOpen style={{ width: 12, height: 12 }} /> Browse
                </button>
              </div>
              {localValue && (
                <img
                  src={localValue}
                  alt="Preview"
                  style={{
                    width: '100%', maxHeight: 140, objectFit: 'cover', borderRadius: 8,
                    border: '1px solid #e5e7eb',
                  }}
                  onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                />
              )}
              <MediaPickerModal
                open={showMediaPicker}
                onClose={() => setShowMediaPicker(false)}
                onSelect={(url) => setLocalValue(url)}
              />
            </div>
          ) : isTextType && localValue.length > 80 ? (
            <textarea
              value={localValue}
              onChange={(e) => setLocalValue(e.target.value)}
              rows={4}
              style={{
                width: '100%', fontSize: 12, padding: '8px 10px', border: '1px solid #e5e7eb',
                borderRadius: 6, outline: 'none', resize: 'vertical', lineHeight: 1.6,
              }}
            />
          ) : (
            <input
              type="text"
              value={localValue}
              onChange={(e) => setLocalValue(e.target.value)}
              style={{
                width: '100%', fontSize: 12, padding: '8px 10px', border: '1px solid #e5e7eb',
                borderRadius: 6, outline: 'none',
              }}
            />
          )}
        </div>

        {/* Sibling field (EN/HI pair) */}
        {siblingRow && siblingKey && (
          <div style={{ marginBottom: 16 }}>
            <label style={{
              fontSize: 11, fontWeight: 700, color: '#374151', display: 'block', marginBottom: 6,
            }}>
              {siblingRow.label || 'Value'}
              {siblingKey.endsWith('_en') && <span style={{ color: '#9ca3af', fontWeight: 400 }}> (English)</span>}
              {siblingKey.endsWith('_hi') && <span style={{ color: '#9ca3af', fontWeight: 400 }}> (Hindi)</span>}
            </label>
            {isTextType && siblingValue.length > 80 ? (
              <textarea
                value={siblingValue}
                onChange={(e) => setSiblingValue(e.target.value)}
                rows={4}
                style={{
                  width: '100%', fontSize: 12, padding: '8px 10px', border: '1px solid #e5e7eb',
                  borderRadius: 6, outline: 'none', resize: 'vertical', lineHeight: 1.6,
                }}
              />
            ) : (
              <input
                type="text"
                value={siblingValue}
                onChange={(e) => setSiblingValue(e.target.value)}
                style={{
                  width: '100%', fontSize: 12, padding: '8px 10px', border: '1px solid #e5e7eb',
                  borderRadius: 6, outline: 'none',
                }}
              />
            )}
          </div>
        )}
      </div>

      {/* Footer: Apply button */}
      <div style={{
        padding: '12px 16px', borderTop: '1px solid #e5e7eb', background: '#fafafa',
      }}>
        <button
          onClick={handleApply}
          style={{
            width: '100%', padding: '10px 0', fontSize: 13, fontWeight: 700,
            color: '#fff', background: 'linear-gradient(135deg, #FF6B00, #FF9933)',
            border: 'none', borderRadius: 8, cursor: 'pointer',
            boxShadow: '0 2px 8px rgba(255,107,0,0.25)',
            transition: 'transform 0.1s, box-shadow 0.1s',
          }}
          onMouseDown={(e) => { e.currentTarget.style.transform = 'scale(0.98)'; }}
          onMouseUp={(e) => { e.currentTarget.style.transform = 'scale(1)'; }}
        >
          Apply Changes
        </button>
        <p style={{ fontSize: 10, color: '#9ca3af', textAlign: 'center', marginTop: 8 }}>
          Changes are staged locally until you click "Save All" in the toolbar
        </p>
      </div>
    </div>
  );
}
