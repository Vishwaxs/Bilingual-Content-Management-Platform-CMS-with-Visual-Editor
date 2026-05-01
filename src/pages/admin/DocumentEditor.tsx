import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAdminDocument, useCreateDocument, useUpdateDocument } from '@/hooks/useDocuments';
import { useEditorAutosave } from '@/hooks/useEditorAutosave';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent } from '@/components/ui/card';
import { toast } from 'sonner';
import { ArrowLeft } from 'lucide-react';
import { documentAdminSchema } from '@/lib/security/validate';
import { formatDistanceToNow } from 'date-fns';

const DocumentEditor = () => {
  const { id } = useParams();
  const isEditing = Boolean(id && id !== 'new');
  const navigate = useNavigate();
  const createDoc = useCreateDocument();
  const updateDoc = useUpdateDocument();
  const { data: existingDoc, isLoading: isLoadingExisting } = useAdminDocument(isEditing ? id! : '');

  const [form, setForm] = useState({
    title_en: '', title_hi: '',
    category: 'circular',
    file_url: '', file_size: 0 as number | null,
    is_public: true,
  });

  const autosaveKey = `cms:autosave:document:${id ?? 'new'}`;
  const {
    pendingDraft,
    lastSavedAt,
    restorePendingDraft,
    discardPendingDraft,
    clearAutosave,
  } = useEditorAutosave({
    storageKey: autosaveKey,
    value: form,
    enabled: !isEditing || Boolean(existingDoc),
  });

  useEffect(() => {
    if (!existingDoc) return;

    setForm({
      title_en: existingDoc.title_en || '',
      title_hi: existingDoc.title_hi || '',
      category: existingDoc.category || 'circular',
      file_url: existingDoc.file_url || '',
      file_size: existingDoc.file_size ?? 0,
      is_public: existingDoc.is_public,
    });
  }, [existingDoc]);

  useEffect(() => {
    if (isEditing && !isLoadingExisting && !existingDoc) {
      toast.error('Document not found');
      navigate('/admin/documents');
    }
  }, [isEditing, isLoadingExisting, existingDoc, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const parsed = documentAdminSchema.safeParse(form);
    if (!parsed.success) {
      toast.error(parsed.error.issues[0]?.message || 'Invalid document data');
      return;
    }

    try {
      if (isEditing) {
        await updateDoc.mutateAsync({ id: id!, ...parsed.data });
        toast.success('Document updated');
      } else {
        await createDoc.mutateAsync(parsed.data);
        toast.success('Document added');
      }
      clearAutosave();
      navigate('/admin/documents');
    } catch (err: unknown) {
      const message = err instanceof Error
        ? err.message
        : (isEditing ? 'Failed to update document' : 'Failed to add document');
      toast.error(message);
    }
  };

  if (isEditing && isLoadingExisting) {
    return (
      <div>
        <Button variant="ghost" onClick={() => navigate('/admin/documents')} className="mb-4"><ArrowLeft className="h-4 w-4 mr-1" /> Back</Button>
        <p className="text-muted-foreground">Loading document...</p>
      </div>
    );
  }

  return (
    <div>
      <Button variant="ghost" onClick={() => navigate('/admin/documents')} className="mb-4"><ArrowLeft className="h-4 w-4 mr-1" /> Back</Button>
      <h1 className="font-display text-2xl font-bold text-foreground mb-6">{isEditing ? 'Edit Document' : 'Add Document'}</h1>

      {pendingDraft && (
        <Card className="mb-6 border-[#FF6B00]/30 bg-[#FFF8F2]">
          <CardContent className="pt-6 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="font-semibold text-sm text-[#0B1F3A]">Unsaved draft detected</p>
              <p className="text-xs text-muted-foreground">
                Saved {formatDistanceToNow(new Date(pendingDraft.savedAt), { addSuffix: true })}. Restore or discard before editing.
              </p>
            </div>
            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  const restored = restorePendingDraft();
                  if (restored) {
                    setForm(restored);
                    toast.success('Draft restored');
                  }
                }}
              >
                Restore draft
              </Button>
              <Button type="button" variant="ghost" onClick={discardPendingDraft}>Discard</Button>
            </div>
          </CardContent>
        </Card>
      )}

      {lastSavedAt && !pendingDraft && (
        <p className="text-xs text-muted-foreground mb-4">
          Autosaved {formatDistanceToNow(new Date(lastSavedAt), { addSuffix: true })}
        </p>
      )}

      <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl">
        <Card>
          <CardContent className="pt-6 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2"><Label>Title (EN)</Label><Input value={form.title_en} onChange={e => setForm(p => ({ ...p, title_en: e.target.value }))} required maxLength={200} /></div>
              <div className="space-y-2"><Label>Title (HI)</Label><Input value={form.title_hi} onChange={e => setForm(p => ({ ...p, title_hi: e.target.value }))} /></div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Category</Label>
                <Select value={form.category} onValueChange={v => setForm(p => ({ ...p, category: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="circular">Circular</SelectItem>
                    <SelectItem value="report">Report</SelectItem>
                    <SelectItem value="policy">Policy</SelectItem>
                    <SelectItem value="press">Press</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center gap-3 pt-6">
                <Switch checked={form.is_public} onCheckedChange={v => setForm(p => ({ ...p, is_public: v }))} id="is_public" />
                <Label htmlFor="is_public">Publicly accessible</Label>
              </div>
            </div>
            <div className="space-y-2"><Label>File URL</Label><Input type="url" value={form.file_url} onChange={e => setForm(p => ({ ...p, file_url: e.target.value }))} placeholder="https://..." required /></div>
            <p className="text-xs text-muted-foreground">Upload files via the file upload Edge Function or paste a direct URL.</p>
            <Button type="submit" disabled={isLoadingExisting || createDoc.isPending || updateDoc.isPending}>{isEditing ? 'Update Document' : 'Add Document'}</Button>
          </CardContent>
        </Card>
      </form>
    </div>
  );
};

export default DocumentEditor;
