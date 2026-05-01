import { ReactNode, useCallback } from 'react';
import { useEditMode } from '@/contexts/EditModeContext';
import { useCmsValue } from '@/hooks/useEditableCms';
import { useLanguage } from '@/contexts/LanguageContext';

// ─── Base EditableElement wrapper ─────────────────────────────
// Wraps any element to make it clickable in edit mode
interface EditableElementProps {
  cmsKey: string;
  children: ReactNode;
  className?: string;
  as?: keyof JSX.IntrinsicElements;
}

export function EditableElement({
  cmsKey,
  children,
  className = '',
  as: Tag = 'div',
}: EditableElementProps) {
  const { isEditMode, selectedKey, selectElement } = useEditMode();

  const handleClick = useCallback(
    (e: React.MouseEvent) => {
      if (!isEditMode) return;
      e.preventDefault();
      e.stopPropagation();
      selectElement(cmsKey);
    },
    [isEditMode, cmsKey, selectElement],
  );

  if (!isEditMode) return <>{children}</>;

  const isSelected = selectedKey === cmsKey;

  return (
    <Tag
      className={`editable-element ${isSelected ? 'editable-selected' : ''} ${className}`}
      onClick={handleClick}
      data-cms-key={cmsKey}
      style={{ cursor: 'pointer', position: 'relative' }}
    >
      {children}
      {/* Edit indicator dot */}
      <span
        className="editable-indicator"
        style={{
          position: 'absolute',
          top: -4,
          right: -4,
          width: 10,
          height: 10,
          borderRadius: '50%',
          background: isSelected ? '#FF6B00' : 'rgba(255,107,0,0.5)',
          border: '2px solid white',
          boxShadow: '0 1px 4px rgba(0,0,0,0.2)',
          zIndex: 50,
          pointerEvents: 'none',
        }}
      />
    </Tag>
  );
}

// ─── EditableText ─────────────────────────────────────────────
// For text content: reads from CMS and wraps with editable overlay
interface EditableTextProps {
  cmsKeyEn: string;
  cmsKeyHi: string;
  fallbackEn: string;
  fallbackHi: string;
  className?: string;
  as?: keyof JSX.IntrinsicElements;
  style?: React.CSSProperties;
}

export function EditableText({
  cmsKeyEn,
  cmsKeyHi,
  fallbackEn,
  fallbackHi,
  className = '',
  as: Tag = 'span',
  style,
}: EditableTextProps) {
  const { isEditMode, pendingEdits, selectedKey, selectElement } = useEditMode();
  const { language: lang } = useLanguage();

  const key = lang === 'hi' ? cmsKeyHi : cmsKeyEn;
  const fallback = lang === 'hi' ? fallbackHi : fallbackEn;
  const value = useCmsValue(key, fallback, isEditMode ? pendingEdits : undefined);

  const handleClick = useCallback(
    (e: React.MouseEvent) => {
      if (!isEditMode) return;
      e.preventDefault();
      e.stopPropagation();
      // Always select the EN key so the panel shows both EN+HI fields
      selectElement(cmsKeyEn);
    },
    [isEditMode, cmsKeyEn, selectElement],
  );

  if (!isEditMode) {
    return <Tag className={className} style={style}>{value}</Tag>;
  }

  const isSelected = selectedKey === cmsKeyEn;
  const hasPending = pendingEdits.has(cmsKeyEn) || pendingEdits.has(cmsKeyHi);

  return (
    <Tag
      className={`editable-element ${isSelected ? 'editable-selected' : ''} ${className}`}
      onClick={handleClick}
      data-cms-key={key}
      style={{
        ...style,
        cursor: 'pointer',
        position: 'relative',
        outline: isSelected ? '2px solid #FF6B00' : hasPending ? '2px dashed #FF993380' : '2px dashed transparent',
        outlineOffset: '2px',
        borderRadius: '4px',
        transition: 'outline-color 0.2s',
      }}
    >
      {value}
    </Tag>
  );
}

// ─── EditableImage ────────────────────────────────────────────
interface EditableImageProps {
  cmsKey: string;
  fallback: string;
  alt?: string;
  className?: string;
  style?: React.CSSProperties;
}

export function EditableImage({
  cmsKey,
  fallback,
  alt = '',
  className = '',
  style,
}: EditableImageProps) {
  const { isEditMode, pendingEdits, selectedKey, selectElement } = useEditMode();
  const value = useCmsValue(cmsKey, fallback, isEditMode ? pendingEdits : undefined);

  const handleClick = useCallback(
    (e: React.MouseEvent) => {
      if (!isEditMode) return;
      e.preventDefault();
      e.stopPropagation();
      selectElement(cmsKey);
    },
    [isEditMode, cmsKey, selectElement],
  );

  if (!value) return null;

  if (!isEditMode) {
    return <img src={value} alt={alt} className={className} style={style} />;
  }

  const isSelected = selectedKey === cmsKey;

  return (
    <div
      className={`editable-element ${isSelected ? 'editable-selected' : ''}`}
      onClick={handleClick}
      data-cms-key={cmsKey}
      style={{
        cursor: 'pointer',
        position: 'relative',
        outline: isSelected ? '2px solid #FF6B00' : '2px dashed transparent',
        outlineOffset: '2px',
        borderRadius: '4px',
        transition: 'outline-color 0.2s',
        display: 'inline-block',
      }}
    >
      <img src={value} alt={alt} className={className} style={style} />
      {/* Image overlay */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: 'rgba(255,107,0,0.08)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          opacity: isSelected ? 1 : 0,
          transition: 'opacity 0.2s',
          borderRadius: '4px',
        }}
      >
        <span className="text-xs font-bold text-white bg-[#FF6B00] px-2 py-1 rounded shadow">
          Click to change
        </span>
      </div>
    </div>
  );
}
