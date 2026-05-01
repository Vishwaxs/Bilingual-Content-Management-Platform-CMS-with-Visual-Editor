import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useCreateEvent, useUpdateEvent, useAdminEvent } from '@/hooks/useEvents';
import { useEditorAutosave } from '@/hooks/useEditorAutosave';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { ArrowLeft } from 'lucide-react';
import { eventAdminSchema } from '@/lib/security/validate';
import { formatDistanceToNow } from 'date-fns';

type EventStatus = 'draft' | 'published' | 'archived';

const isEventStatus = (value: string): value is EventStatus => {
  return value === 'draft' || value === 'published' || value === 'archived';
};

const EventEditor = () => {
  const { id } = useParams();
  const isEditing = id && id !== 'new';
  const navigate = useNavigate();
  const createEvent = useCreateEvent();
  const updateEvent = useUpdateEvent();
  const { data: existing } = useAdminEvent(isEditing ? id : '');

  const [form, setForm] = useState({
    title_en: '', title_hi: '',
    description_en: '', description_hi: '',
    slug: '', event_date: '', event_time: '',
    location_en: '', location_hi: '',
    cover_image: '',
    status: 'draft' as 'draft' | 'published' | 'archived',
  });

  const autosaveKey = `cms:autosave:event:${id ?? 'new'}`;
  const {
    pendingDraft,
    lastSavedAt,
    restorePendingDraft,
    discardPendingDraft,
    clearAutosave,
  } = useEditorAutosave({
    storageKey: autosaveKey,
    value: form,
    enabled: !isEditing || Boolean(existing),
  });

  useEffect(() => {
    if (existing) {
      setForm({
        title_en: existing.title_en || '',
        title_hi: existing.title_hi || '',
        description_en: existing.description_en || '',
        description_hi: existing.description_hi || '',
        slug: existing.slug || '',
        event_date: existing.event_date ? existing.event_date.split('T')[0] : '',
        event_time: existing.event_time || '',
        location_en: existing.location_en || '',
        location_hi: existing.location_hi || '',
        cover_image: existing.cover_image || '',
        status: isEventStatus(existing.status ?? '') ? existing.status : 'draft',
      });
    }
  }, [existing]);

  const generateSlug = (title: string) => title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title_en.trim()) { toast.error('Title (EN) required'); return; }
    if (form.status === 'published' && !form.event_date) {
      toast.error('Event date is required before publishing');
      return;
    }

    const slug = form.slug || generateSlug(form.title_en);
    const payload = { ...form, slug, event_date: form.event_date ? new Date(form.event_date).toISOString() : null };

    const parsed = eventAdminSchema.safeParse(payload);
    if (!parsed.success) {
      toast.error(parsed.error.issues[0]?.message || 'Invalid event data');
      return;
    }

    try {
      if (isEditing) {
        await updateEvent.mutateAsync({ id: id!, ...parsed.data });
        toast.success('Event updated');
      } else {
        await createEvent.mutateAsync(parsed.data);
        toast.success('Event created');
      }
      clearAutosave();
      navigate('/admin/events');
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to save event';
      toast.error(message);
    }
  };

  return (
    <div>
      <Button variant="ghost" onClick={() => navigate('/admin/events')} className="mb-4"><ArrowLeft className="h-4 w-4 mr-1" /> Back</Button>
      <h1 className="font-display text-2xl font-bold text-foreground mb-6">{isEditing ? 'Edit Event' : 'New Event'}</h1>

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

      <form onSubmit={handleSubmit} className="space-y-6 max-w-4xl">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader><CardTitle className="text-base">English Content</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2"><Label>Title (EN)</Label><Input value={form.title_en} onChange={e => setForm(p => ({ ...p, title_en: e.target.value, slug: p.slug || generateSlug(e.target.value) }))} /></div>
              <div className="space-y-2"><Label>Description (EN)</Label><Textarea value={form.description_en} onChange={e => setForm(p => ({ ...p, description_en: e.target.value }))} rows={6} /></div>
              <div className="space-y-2"><Label>Location (EN)</Label><Input value={form.location_en} onChange={e => setForm(p => ({ ...p, location_en: e.target.value }))} /></div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader><CardTitle className="text-base">Hindi Content (हिन्दी)</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2"><Label>Title (HI)</Label><Input value={form.title_hi} onChange={e => setForm(p => ({ ...p, title_hi: e.target.value }))} /></div>
              <div className="space-y-2"><Label>Description (HI)</Label><Textarea value={form.description_hi} onChange={e => setForm(p => ({ ...p, description_hi: e.target.value }))} rows={6} /></div>
              <div className="space-y-2"><Label>Location (HI)</Label><Input value={form.location_hi} onChange={e => setForm(p => ({ ...p, location_hi: e.target.value }))} /></div>
            </CardContent>
          </Card>
        </div>
        <Card>
          <CardContent className="pt-6 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="space-y-2"><Label>Slug</Label><Input value={form.slug} onChange={e => setForm(p => ({ ...p, slug: e.target.value }))} required pattern="[a-z0-9-]{3,120}" /></div>
              <div className="space-y-2"><Label>Event Date</Label><Input type="date" value={form.event_date} onChange={e => setForm(p => ({ ...p, event_date: e.target.value }))} required={form.status === 'published'} /></div>
              <div className="space-y-2"><Label>Event Time</Label><Input value={form.event_time} onChange={e => setForm(p => ({ ...p, event_time: e.target.value }))} placeholder="10:00 AM" /></div>
              <div className="space-y-2">
                <Label>Status</Label>
                <Select value={form.status} onValueChange={(v) => setForm(p => ({ ...p, status: isEventStatus(v) ? v : 'draft' }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="published">Published</SelectItem>
                    <SelectItem value="archived">Archived</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            {form.status === 'published' && !form.event_date && (
              <p className="text-xs text-destructive">Event date is mandatory before publish.</p>
            )}
            <div className="space-y-2"><Label>Cover Image URL</Label><Input type="url" value={form.cover_image} onChange={e => setForm(p => ({ ...p, cover_image: e.target.value }))} placeholder="https://..." /></div>
            <Button type="submit" disabled={createEvent.isPending || updateEvent.isPending}>{isEditing ? 'Update Event' : 'Create Event'}</Button>
          </CardContent>
        </Card>
      </form>
    </div>
  );
};

export default EventEditor;
