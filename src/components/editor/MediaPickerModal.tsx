import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { X, Search, Check, Image } from 'lucide-react';
import { Input } from '@/components/ui/input';

interface MediaPickerModalProps {
  open: boolean;
  onClose: () => void;
  onSelect: (url: string) => void;
  bucket?: string;
}

const IMAGE_BUCKETS = ['news-images', 'event-images', 'leader-photos', 'media'];

export function MediaPickerModal({ open, onClose, onSelect, bucket }: MediaPickerModalProps) {
  const [activeBucket, setActiveBucket] = useState(bucket || 'media');
  const [search, setSearch] = useState('');

  const { data: files, isLoading } = useQuery({
    queryKey: ['media-picker', activeBucket],
    queryFn: async () => {
      const { data, error } = await supabase.storage
        .from(activeBucket)
        .list('', { limit: 100, sortBy: { column: 'created_at', order: 'desc' } });
      if (error) throw error;
      return (data ?? []).filter(f =>
        f.name !== '.emptyFolderPlaceholder' &&
        /\.(jpe?g|png|webp|gif|svg)$/i.test(f.name)
      );
    },
    enabled: open,
    staleTime: 30_000,
  });

  if (!open) return null;

  const filtered = (files ?? []).filter((f) =>
    !search || f.name.toLowerCase().includes(search.toLowerCase())
  );

  const handleSelect = (filename: string) => {
    const { data } = supabase.storage.from(activeBucket).getPublicUrl(filename);
    onSelect(data.publicUrl);
    onClose();
  };

  return (
    <div
      style={{
        position: 'fixed', inset: 0, zIndex: 10000,
        background: 'rgba(0,0,0,0.5)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: 20,
      }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div
        style={{
          background: '#fff', borderRadius: 16, width: '100%', maxWidth: 680,
          maxHeight: '80vh', display: 'flex', flexDirection: 'column',
          boxShadow: '0 24px 48px rgba(0,0,0,0.15)',
        }}
      >
        {/* Header */}
        <div style={{
          padding: '14px 16px', borderBottom: '1px solid #e5e7eb',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Image style={{ width: 16, height: 16, color: '#FF6B00' }} />
            <span style={{ fontSize: 14, fontWeight: 700, color: '#111' }}>Select Image</span>
          </div>
          <button onClick={onClose} style={{
            background: 'none', border: 'none', cursor: 'pointer', padding: 4,
            color: '#9ca3af', borderRadius: 4,
          }}>
            <X style={{ width: 16, height: 16 }} />
          </button>
        </div>

        {/* Bucket tabs */}
        <div style={{ padding: '8px 16px', display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {IMAGE_BUCKETS.map((b) => (
            <button
              key={b}
              onClick={() => setActiveBucket(b)}
              style={{
                fontSize: 11, fontWeight: 700, padding: '4px 10px', borderRadius: 6,
                border: 'none', cursor: 'pointer',
                background: activeBucket === b ? '#FF6B00' : '#f3f4f6',
                color: activeBucket === b ? '#fff' : '#6b7280',
                transition: 'all 0.15s',
              }}
            >
              {b}
            </button>
          ))}
        </div>

        {/* Search */}
        <div style={{ padding: '0 16px 8px', position: 'relative' }}>
          <Search style={{ position: 'absolute', left: 28, top: 10, width: 14, height: 14, color: '#9ca3af' }} />
          <Input
            placeholder="Search images…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ paddingLeft: 34, fontSize: 12 }}
          />
        </div>

        {/* Grid */}
        <div style={{ flex: 1, overflow: 'auto', padding: '0 16px 16px' }}>
          {isLoading ? (
            <div style={{ display: 'flex', justifyContent: 'center', padding: 40 }}>
              <div className="animate-spin w-6 h-6 border-2 border-[#FF6B00] border-t-transparent rounded-full" />
            </div>
          ) : filtered.length === 0 ? (
            <div style={{ textAlign: 'center', padding: 40, color: '#9ca3af', fontSize: 13 }}>
              {search ? 'No images match' : 'No images in this bucket'}
            </div>
          ) : (
            <div style={{
              display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(110px, 1fr))',
              gap: 8,
            }}>
              {filtered.map((file) => {
                const { data } = supabase.storage.from(activeBucket).getPublicUrl(file.name);
                return (
                  <button
                    key={file.name}
                    onClick={() => handleSelect(file.name)}
                    style={{
                      border: '2px solid transparent', borderRadius: 10, overflow: 'hidden',
                      cursor: 'pointer', background: '#f9fafb', padding: 0,
                      transition: 'border-color 0.15s',
                      aspectRatio: '1',
                    }}
                    onMouseEnter={(e) => { e.currentTarget.style.borderColor = '#FF6B00'; }}
                    onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'transparent'; }}
                  >
                    <img
                      src={data.publicUrl}
                      alt={file.name}
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      loading="lazy"
                    />
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
