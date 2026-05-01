import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Image, FileText, Upload, Trash2, Search, Copy, Check,
  FolderOpen, ExternalLink, RefreshCcw,
} from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';

const BUCKETS = [
  { id: 'news-images', label: 'News Images', icon: Image, accept: 'image/jpeg,image/png,image/webp,image/gif' },
  { id: 'event-images', label: 'Event Images', icon: Image, accept: 'image/jpeg,image/png,image/webp' },
  { id: 'leader-photos', label: 'Leader Photos', icon: Image, accept: 'image/jpeg,image/png,image/webp' },
  { id: 'media', label: 'General Media', icon: Image, accept: 'image/jpeg,image/png,image/webp,image/gif' },
  { id: 'documents', label: 'Documents', icon: FileText, accept: 'application/pdf' },
];

interface StorageFile {
  name: string;
  id: string;
  created_at: string;
  metadata: { size: number; mimetype: string };
}

const formatBytes = (bytes: number) => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

const MediaLibrary = () => {
  const qc = useQueryClient();
  const [activeBucket, setActiveBucket] = useState('news-images');
  const [search, setSearch] = useState('');
  const [copiedUrl, setCopiedUrl] = useState<string | null>(null);

  // List files in selected bucket
  const { data: files, isLoading } = useQuery({
    queryKey: ['media', activeBucket],
    queryFn: async () => {
      const { data, error } = await supabase.storage
        .from(activeBucket)
        .list('', { limit: 200, sortBy: { column: 'created_at', order: 'desc' } });
      if (error) throw error;
      return (data ?? []).filter(f => f.name !== '.emptyFolderPlaceholder') as StorageFile[];
    },
    staleTime: 30_000,
  });

  // Upload mutation
  const uploadMutation = useMutation({
    mutationFn: async (file: File) => {
      const ext = file.name.split('.').pop();
      const filename = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
      const { error } = await supabase.storage.from(activeBucket).upload(filename, file, {
        cacheControl: '3600',
        upsert: false,
      });
      if (error) throw error;
      return filename;
    },
    onSuccess: (filename) => {
      toast.success(`Uploaded: ${filename}`);
      qc.invalidateQueries({ queryKey: ['media', activeBucket] });
    },
    onError: (e) => toast.error(`Upload failed: ${e.message}`),
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: async (filename: string) => {
      const { error } = await supabase.storage.from(activeBucket).remove([filename]);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success('File deleted');
      qc.invalidateQueries({ queryKey: ['media', activeBucket] });
    },
    onError: (e) => toast.error(`Delete failed: ${e.message}`),
  });

  const getPublicUrl = (filename: string) => {
    const { data } = supabase.storage.from(activeBucket).getPublicUrl(filename);
    return data.publicUrl;
  };

  const handleCopy = (url: string) => {
    navigator.clipboard.writeText(url);
    setCopiedUrl(url);
    toast.success('URL copied!');
    setTimeout(() => setCopiedUrl(null), 2000);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) uploadMutation.mutate(file);
    e.target.value = '';
  };

  const handleDelete = (filename: string) => {
    if (!confirm(`Delete "${filename}"? This cannot be undone.`)) return;
    deleteMutation.mutate(filename);
  };

  const bucketConfig = BUCKETS.find(b => b.id === activeBucket)!;
  const isImageBucket = bucketConfig.accept.startsWith('image');

  const filtered = (files ?? []).filter((f) => {
    if (!search) return true;
    return f.name.toLowerCase().includes(search.toLowerCase());
  });

  return (
    <div className="space-y-6 max-w-[1100px]">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-black text-foreground flex items-center gap-2">
            <FolderOpen className="h-6 w-6 text-[#FF9933]" /> Media Library
          </h1>
          <p className="text-xs text-muted-foreground mt-1">
            Browse, upload, and manage files across all storage buckets
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => qc.invalidateQueries({ queryKey: ['media', activeBucket] })}
          >
            <RefreshCcw className="h-3.5 w-3.5 mr-1" /> Refresh
          </Button>
          <label className="cursor-pointer">
            <input
              type="file"
              className="hidden"
              accept={bucketConfig.accept}
              onChange={handleFileSelect}
              disabled={uploadMutation.isPending}
            />
            <Button
              size="sm"
              className="bg-[#FF6B00] hover:bg-[#E55A00] text-white pointer-events-none"
              disabled={uploadMutation.isPending}
              asChild
            >
              <span>
                <Upload className="h-3.5 w-3.5 mr-1" />
                {uploadMutation.isPending ? 'Uploading…' : 'Upload'}
              </span>
            </Button>
          </label>
        </div>
      </div>

      {/* Bucket tabs */}
      <div className="flex flex-wrap gap-1.5">
        {BUCKETS.map((b) => (
          <button
            key={b.id}
            onClick={() => { setActiveBucket(b.id); setSearch(''); }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              activeBucket === b.id
                ? 'bg-[#FF6B00] text-white shadow-md'
                : 'bg-muted text-muted-foreground hover:bg-muted/80'
            }`}
          >
            <b.icon className="h-3.5 w-3.5" />
            {b.label}
          </button>
        ))}
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input placeholder="Search files…" value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
      </div>

      {/* File grid */}
      {isLoading ? (
        <div className="flex items-center justify-center py-16">
          <div className="animate-spin w-6 h-6 border-2 border-[#FF6B00] border-t-transparent rounded-full" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16">
          <FolderOpen className="h-10 w-10 text-muted-foreground/30 mx-auto mb-3" />
          <p className="text-sm text-muted-foreground">
            {search ? 'No files match your search' : 'No files in this bucket'}
          </p>
        </div>
      ) : isImageBucket ? (
        /* Image grid view */
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
          {filtered.map((file) => {
            const url = getPublicUrl(file.name);
            return (
              <div
                key={file.id || file.name}
                className="group relative bg-card border border-border rounded-xl overflow-hidden hover:border-[#FF6B00]/30 transition-colors"
              >
                <div className="aspect-square bg-muted">
                  <img
                    src={url}
                    alt={file.name}
                    className="w-full h-full object-cover"
                    loading="lazy"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = 'none';
                    }}
                  />
                </div>
                <div className="p-2">
                  <p className="text-[10px] font-medium text-foreground truncate">{file.name}</p>
                  <p className="text-[9px] text-muted-foreground">
                    {file.metadata?.size ? formatBytes(file.metadata.size) : '—'}
                    {' · '}
                    {file.created_at ? format(new Date(file.created_at), 'MMM d') : ''}
                  </p>
                </div>
                {/* Hover actions */}
                <div className="absolute top-1.5 right-1.5 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => handleCopy(url)}
                    className="w-7 h-7 rounded-lg bg-white/90 shadow flex items-center justify-center hover:bg-white"
                    title="Copy URL"
                  >
                    {copiedUrl === url ? (
                      <Check className="h-3.5 w-3.5 text-emerald-600" />
                    ) : (
                      <Copy className="h-3.5 w-3.5 text-gray-600" />
                    )}
                  </button>
                  <a
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-7 h-7 rounded-lg bg-white/90 shadow flex items-center justify-center hover:bg-white"
                    title="Open in new tab"
                  >
                    <ExternalLink className="h-3.5 w-3.5 text-gray-600" />
                  </a>
                  <button
                    onClick={() => handleDelete(file.name)}
                    className="w-7 h-7 rounded-lg bg-white/90 shadow flex items-center justify-center hover:bg-red-50"
                    title="Delete"
                  >
                    <Trash2 className="h-3.5 w-3.5 text-red-500" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* Document list view */
        <div className="bg-card rounded-xl border border-border divide-y divide-border">
          {filtered.map((file) => {
            const url = getPublicUrl(file.name);
            return (
              <div key={file.id || file.name} className="px-4 py-3 flex items-center justify-between group hover:bg-muted/50 transition-colors">
                <div className="flex items-center gap-3 min-w-0">
                  <FileText className="h-5 w-5 text-blue-500 flex-shrink-0" />
                  <div className="min-w-0">
                    <p className="text-xs font-medium text-foreground truncate">{file.name}</p>
                    <p className="text-[10px] text-muted-foreground">
                      {file.metadata?.size ? formatBytes(file.metadata.size) : '—'}
                      {' · '}
                      {file.created_at ? format(new Date(file.created_at), 'MMM d, yyyy') : ''}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={() => handleCopy(url)} className="p-1.5 rounded hover:bg-muted" title="Copy URL">
                    {copiedUrl === url ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Copy className="h-3.5 w-3.5 text-muted-foreground" />}
                  </button>
                  <a href={url} target="_blank" rel="noopener noreferrer" className="p-1.5 rounded hover:bg-muted" title="Open">
                    <ExternalLink className="h-3.5 w-3.5 text-muted-foreground" />
                  </a>
                  <button onClick={() => handleDelete(file.name)} className="p-1.5 rounded hover:bg-red-50" title="Delete">
                    <Trash2 className="h-3.5 w-3.5 text-red-500" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <p className="text-[10px] text-muted-foreground text-center">
        {filtered.length} file{filtered.length !== 1 ? 's' : ''} in "{bucketConfig.label}"
      </p>
    </div>
  );
};

export default MediaLibrary;
