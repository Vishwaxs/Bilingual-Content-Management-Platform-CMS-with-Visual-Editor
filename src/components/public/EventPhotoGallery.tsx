import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';

interface EventPhoto {
  id: string;
  photo_url: string;
  caption: string | null;
  sort_order: number;
}

/**
 * EventPhotoGallery — masonry-style grid with lightbox overlay.
 * Fetches photos from event_photos table by event_id.
 */
export function EventPhotoGallery({ eventId }: { eventId: string }) {
  const [lightboxIdx, setLightboxIdx] = useState<number | null>(null);

  const { data: photos } = useQuery({
    queryKey: ['event-photos', eventId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('event_photos')
        .select('*')
        .eq('event_id', eventId)
        .order('sort_order');
      if (error) throw error;
      return (data ?? []) as unknown as EventPhoto[];
    },
    enabled: !!eventId,
  });

  if (!photos || photos.length === 0) return null;

  const openLightbox = (idx: number) => setLightboxIdx(idx);
  const closeLightbox = () => setLightboxIdx(null);
  const prev = () => setLightboxIdx((i) => (i !== null ? (i - 1 + photos.length) % photos.length : 0));
  const next = () => setLightboxIdx((i) => (i !== null ? (i + 1) % photos.length : 0));

  return (
    <>
      <div className="mt-10">
        <h2 className="font-display text-lg font-bold text-[#0B1F3A] mb-4 flex items-center gap-2">
          📸 Photo Gallery
          <span className="text-xs font-normal text-gray-400">{photos.length} photos</span>
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {photos.map((photo, idx) => (
            <button
              key={photo.id}
              onClick={() => openLightbox(idx)}
              className="relative aspect-square rounded-lg overflow-hidden group cursor-pointer border border-black/5"
            >
              <img
                src={photo.photo_url}
                alt={photo.caption || `Photo ${idx + 1}`}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors" />
              {photo.caption && (
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <span className="text-white text-[10px] line-clamp-2">{photo.caption}</span>
                </div>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Lightbox */}
      {lightboxIdx !== null && photos[lightboxIdx] && (
        <div
          className="fixed inset-0 z-[10000] bg-black/90 flex items-center justify-center"
          onClick={closeLightbox}
        >
          <button
            onClick={(e) => { e.stopPropagation(); closeLightbox(); }}
            className="absolute top-4 right-4 text-white/70 hover:text-white p-2"
          >
            <X className="w-6 h-6" />
          </button>

          <button
            onClick={(e) => { e.stopPropagation(); prev(); }}
            className="absolute left-4 top-1/2 -translate-y-1/2 text-white/50 hover:text-white p-2"
          >
            <ChevronLeft className="w-8 h-8" />
          </button>

          <button
            onClick={(e) => { e.stopPropagation(); next(); }}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-white/50 hover:text-white p-2"
          >
            <ChevronRight className="w-8 h-8" />
          </button>

          <div className="max-w-4xl max-h-[85vh] px-12" onClick={(e) => e.stopPropagation()}>
            <img
              src={photos[lightboxIdx].photo_url}
              alt={photos[lightboxIdx].caption || ''}
              className="max-w-full max-h-[80vh] object-contain rounded-lg"
            />
            {photos[lightboxIdx].caption && (
              <p className="text-white/70 text-sm text-center mt-3">{photos[lightboxIdx].caption}</p>
            )}
            <p className="text-white/30 text-xs text-center mt-1">
              {lightboxIdx + 1} / {photos.length}
            </p>
          </div>
        </div>
      )}
    </>
  );
}
