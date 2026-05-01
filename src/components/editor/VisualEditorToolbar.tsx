import { useEditMode } from '@/contexts/EditModeContext';
import { Save, X, Undo2, Eye } from 'lucide-react';

export function VisualEditorToolbar() {
  const {
    isEditMode,
    pendingCount,
    saveAll,
    discardAll,
    exitEditMode,
    isSaving,
  } = useEditMode();

  if (!isEditMode) return null;

  return (
    <div
      className="visual-editor-toolbar"
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        height: 52,
        zIndex: 9999,
        background: 'linear-gradient(135deg, #0B1F3A 0%, #122B52 100%)',
        borderBottom: '2px solid rgba(255,107,0,0.3)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 16px',
        gap: 12,
        boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
      }}
    >
      {/* Left: Mode indicator */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            background: 'rgba(255,107,0,0.15)',
            border: '1px solid rgba(255,107,0,0.3)',
            borderRadius: 8,
            padding: '4px 12px',
          }}
        >
          <Eye style={{ width: 14, height: 14, color: '#FF9933' }} />
          <span style={{ fontSize: 12, fontWeight: 700, color: '#FF9933', letterSpacing: '0.03em' }}>
            VISUAL EDITOR
          </span>
        </div>
        {pendingCount > 0 && (
          <span
            style={{
              fontSize: 11,
              color: 'rgba(255,255,255,0.6)',
              background: 'rgba(255,255,255,0.08)',
              borderRadius: 6,
              padding: '3px 8px',
              fontWeight: 600,
            }}
          >
            {pendingCount} unsaved change{pendingCount > 1 ? 's' : ''}
          </span>
        )}
      </div>

      {/* Center: Instruction */}
      <div style={{ flex: 1, textAlign: 'center' }}>
        <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)' }}>
          Click any highlighted element to edit it
        </span>
      </div>

      {/* Right: Actions */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        {/* Discard */}
        {pendingCount > 0 && (
          <button
            onClick={discardAll}
            disabled={isSaving}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 4,
              fontSize: 12,
              fontWeight: 600,
              color: 'rgba(255,255,255,0.5)',
              background: 'rgba(255,255,255,0.06)',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: 8,
              padding: '6px 12px',
              cursor: 'pointer',
              transition: 'all 0.15s',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = '#EF4444';
              e.currentTarget.style.borderColor = 'rgba(239,68,68,0.3)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = 'rgba(255,255,255,0.5)';
              e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)';
            }}
          >
            <Undo2 style={{ width: 13, height: 13 }} /> Discard
          </button>
        )}

        {/* Save */}
        <button
          onClick={saveAll}
          disabled={isSaving || pendingCount === 0}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 5,
            fontSize: 12,
            fontWeight: 700,
            color: '#fff',
            background: pendingCount > 0
              ? 'linear-gradient(135deg, #FF6B00, #FF9933)'
              : 'rgba(255,255,255,0.08)',
            border: 'none',
            borderRadius: 8,
            padding: '7px 16px',
            cursor: pendingCount > 0 ? 'pointer' : 'default',
            opacity: isSaving ? 0.6 : 1,
            boxShadow: pendingCount > 0 ? '0 2px 12px rgba(255,107,0,0.3)' : 'none',
            transition: 'all 0.15s',
          }}
        >
          <Save style={{ width: 13, height: 13 }} />
          {isSaving ? 'Saving…' : 'Save All'}
        </button>

        {/* Exit */}
        <button
          onClick={exitEditMode}
          disabled={isSaving}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 4,
            fontSize: 12,
            fontWeight: 600,
            color: 'rgba(255,255,255,0.5)',
            background: 'none',
            border: '1px solid rgba(255,255,255,0.15)',
            borderRadius: 8,
            padding: '6px 10px',
            cursor: 'pointer',
            transition: 'all 0.15s',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.color = 'white';
            e.currentTarget.style.borderColor = 'rgba(255,255,255,0.3)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.color = 'rgba(255,255,255,0.5)';
            e.currentTarget.style.borderColor = 'rgba(255,255,255,0.15)';
          }}
        >
          <X style={{ width: 14, height: 14 }} /> Exit
        </button>
      </div>
    </div>
  );
}
