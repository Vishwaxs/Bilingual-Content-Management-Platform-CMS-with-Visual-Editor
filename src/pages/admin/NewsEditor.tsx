import { useState, useEffect, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useCreateNews, useUpdateNews } from '@/hooks/useNews';
import { useEditorAutosave } from '@/hooks/useEditorAutosave';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { ArrowLeft } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { buildNewsQualityReport } from '@/lib/cms/newsQuality';
import { SEOScorePanel } from '@/components/admin/SEOScorePanel';
import { CONTENT_TEMPLATES, getTemplate } from '@/lib/content-templates';

type NewsStatus = 'draft' | 'published' | 'archived';

const isNewsStatus = (value: string): value is NewsStatus => {
  return value === 'draft' || value === 'published' || value === 'archived';
};

const toLocalDateTimeValue = (value?: string | null) => {
  if (!value) return '';
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return '';
  return new Date(parsed.getTime() - parsed.getTimezoneOffset() * 60_000)
    .toISOString()
    .slice(0, 16);
};

const toIsoFromLocalDateTime = (value: string) => {
  if (!value) return null;
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return null;
  return parsed.toISOString();
};

const NewsEditor = () => {
  const { id } = useParams();
  const isEditing = id && id !== 'new';
  const navigate = useNavigate();
  const createNews = useCreateNews();
  const updateNews = useUpdateNews();

  const [form, setForm] = useState({
    title_en: '', title_hi: '',
    body_en: '', body_hi: '',
    slug: '',
    meta_title_en: '', meta_title_hi: '',
    meta_description_en: '', meta_description_hi: '',
    featured_image: '',
    published_at: '',
    status: 'draft' as 'draft' | 'published' | 'archived',
  });
  const [loadingArticle, setLoadingArticle] = useState<boolean>(Boolean(isEditing));

  const autosaveKey = `cms:autosave:news:${id ?? 'new'}`;
  const {
    pendingDraft,
    lastSavedAt,
    restorePendingDraft,
    discardPendingDraft,
    clearAutosave,
  } = useEditorAutosave({
    storageKey: autosaveKey,
    value: form,
    enabled: !(isEditing && loadingArticle),
  });

  const qualityReport = useMemo(() => buildNewsQualityReport(form), [form]);

  useEffect(() => {
    let active = true;

    const loadArticle = async () => {
      if (!isEditing) {
        if (active) setLoadingArticle(false);
        return;
      }

      setLoadingArticle(true);

      const { data, error } = await supabase
        .from('news_articles')
        .select('*')
        .eq('id', id)
        .maybeSingle();

      if (!active) return;

      if (error) {
        toast.error('Failed to load article');
        navigate('/admin/news');
        return;
      }

      if (!data) {
        toast.error('Article not found');
        navigate('/admin/news');
        return;
      }

      setForm({
        title_en: data.title_en || '',
        title_hi: data.title_hi || '',
        body_en: data.body_en || '',
        body_hi: data.body_hi || '',
        slug: data.slug || '',
        meta_title_en: data.meta_title_en || '',
        meta_title_hi: data.meta_title_hi || '',
        meta_description_en: data.meta_description_en || '',
        meta_description_hi: data.meta_description_hi || '',
        featured_image: data.featured_image || '',
        published_at: toLocalDateTimeValue(data.published_at),
        status: (data.status as 'draft' | 'published' | 'archived') || 'draft',
      });
      setLoadingArticle(false);
    };

    void loadArticle();

    return () => {
      active = false;
    };
  }, [id, isEditing, navigate]);

  const generateSlug = (title: string) => {
    return title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
  };

  const handleTitleChange = (value: string) => {
    setForm(prev => ({
      ...prev,
      title_en: value,
      slug: prev.slug || generateSlug(value),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title_en.trim()) {
      toast.error('Title (EN) is required');
      return;
    }
    if (!form.body_en.trim()) {
      toast.error('Body (EN) is required');
      return;
    }
    if (!form.slug) {
      toast.error('Slug is required');
      return;
    }

    if (form.status === 'published') {
      if (qualityReport.blockers.length > 0) {
        toast.error(`Cannot publish yet. Fix: ${qualityReport.blockers.join(', ')}`);
        return;
      }

      if (qualityReport.score < 70) {
        toast.error('Quality score must be at least 70 before publishing');
        return;
      }
    }

    const scheduledPublishAt = toIsoFromLocalDateTime(form.published_at);
    const finalPublishedAt = form.status === 'published'
      ? (scheduledPublishAt ?? new Date().toISOString())
      : null;

    try {
      if (isEditing) {
        await updateNews.mutateAsync({
          id: id!,
          ...form,
          published_at: finalPublishedAt,
        });
        toast.success('Article updated');
      } else {
        await createNews.mutateAsync({
          ...form,
          published_at: finalPublishedAt,
        });
        toast.success('Article created');
      }
      clearAutosave();
      navigate('/admin/news');
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to save article';
      toast.error(message);
    }
  };

  if (isEditing && loadingArticle) {
    return (
      <div>
        <Button variant="ghost" onClick={() => navigate('/admin/news')} className="mb-4">
          <ArrowLeft className="h-4 w-4 mr-1" /> Back
        </Button>
        <p className="text-muted-foreground">Loading article...</p>
      </div>
    );
  }

  return (
    <div>
      <Button variant="ghost" onClick={() => navigate('/admin/news')} className="mb-4">
        <ArrowLeft className="h-4 w-4 mr-1" /> Back
      </Button>
      <h1 className="font-display text-2xl font-bold text-foreground mb-6">
        {isEditing ? 'Edit Article' : 'New Article'}
      </h1>

      {/* Template selector (only for new articles) */}
      {!isEditing && (
        <Card className="mb-6">
          <CardContent className="pt-6">
            <Label className="mb-2 block">Start from template (optional)</Label>
            <Select onValueChange={(templateId) => {
              const tmpl = getTemplate(templateId);
              if (!tmpl) return;
              setForm(prev => ({
                ...prev,
                title_en: tmpl.titleFormat.en,
                title_hi: tmpl.titleFormat.hi,
                body_en: tmpl.contentStructure,
                meta_description_en: tmpl.excerptFormat.en,
                meta_description_hi: tmpl.excerptFormat.hi,
                slug: prev.slug || templateId + '-' + Date.now().toString(36),
              }));
              toast.success(`Template "${tmpl.name}" applied`);
            }}>
              <SelectTrigger className="max-w-sm">
                <SelectValue placeholder="Choose a template..." />
              </SelectTrigger>
              <SelectContent>
                {CONTENT_TEMPLATES.map(t => (
                  <SelectItem key={t.id} value={t.id}>
                    {t.name} — {t.nameHi}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </CardContent>
        </Card>
      )}

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
              <div className="space-y-2">
                <Label>Title (EN)</Label>
                <Input value={form.title_en} onChange={(e) => handleTitleChange(e.target.value)} required maxLength={200} />
              </div>
              <div className="space-y-2">
                <Label>Body (EN)</Label>
                <Textarea value={form.body_en} onChange={(e) => setForm(prev => ({ ...prev, body_en: e.target.value }))} rows={8} required />
              </div>
              <div className="space-y-2">
                <Label>Meta Title (EN)</Label>
                <Input value={form.meta_title_en} onChange={(e) => setForm(prev => ({ ...prev, meta_title_en: e.target.value }))} />
              </div>
              <div className="space-y-2">
                <Label>Meta Description (EN)</Label>
                <Textarea value={form.meta_description_en} onChange={(e) => setForm(prev => ({ ...prev, meta_description_en: e.target.value }))} rows={2} />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle className="text-base">Hindi Content (हिन्दी)</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Title (HI)</Label>
                <Input value={form.title_hi} onChange={(e) => setForm(prev => ({ ...prev, title_hi: e.target.value }))} />
              </div>
              <div className="space-y-2">
                <Label>Body (HI)</Label>
                <Textarea value={form.body_hi} onChange={(e) => setForm(prev => ({ ...prev, body_hi: e.target.value }))} rows={8} />
              </div>
              <div className="space-y-2">
                <Label>Meta Title (HI)</Label>
                <Input value={form.meta_title_hi} onChange={(e) => setForm(prev => ({ ...prev, meta_title_hi: e.target.value }))} />
              </div>
              <div className="space-y-2">
                <Label>Meta Description (HI)</Label>
                <Textarea value={form.meta_description_hi} onChange={(e) => setForm(prev => ({ ...prev, meta_description_hi: e.target.value }))} rows={2} />
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardContent className="pt-6 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="space-y-2">
                <Label>Slug</Label>
                <Input value={form.slug} onChange={(e) => setForm(prev => ({ ...prev, slug: e.target.value }))} required pattern="[a-z0-9-]{3,120}" />
              </div>
              <div className="space-y-2">
                <Label>Featured Image URL</Label>
                <Input type="url" value={form.featured_image} onChange={(e) => setForm(prev => ({ ...prev, featured_image: e.target.value }))} placeholder="https://..." />
              </div>
              <div className="space-y-2">
                <Label>Publish At (optional)</Label>
                <Input
                  type="datetime-local"
                  value={form.published_at}
                  onChange={(e) => setForm(prev => ({ ...prev, published_at: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label>Status</Label>
                <Select value={form.status} onValueChange={(v) => setForm(prev => ({ ...prev, status: isNewsStatus(v) ? v : 'draft' }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="published">Published</SelectItem>
                    <SelectItem value="archived">Archived</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Publishing Quality Checklist ({qualityReport.score}/100)</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {qualityReport.checks.map((check) => (
                  <div key={check.id} className="flex items-center justify-between rounded-md border p-2 text-sm">
                    <div>
                      <p className="font-medium">{check.label}</p>
                      <p className="text-xs text-muted-foreground">{check.detail}</p>
                    </div>
                    <span className={check.passed ? 'text-green-600 font-semibold' : 'text-amber-600 font-semibold'}>
                      {check.passed ? 'Pass' : 'Needs work'}
                    </span>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* SEO Score Panel */}
            <SEOScorePanel data={{
              title: form.meta_title_en || form.title_en,
              metaDescription: form.meta_description_en,
              titleHi: form.title_hi,
              metaDescriptionHi: form.meta_description_hi,
              content: form.body_en,
              slug: form.slug,
              featuredImage: form.featured_image,
            }} />

            {form.status === 'published' && form.published_at && new Date(form.published_at).getTime() > Date.now() && (
              <p className="text-xs text-muted-foreground">Future publish date set. Article remains hidden publicly until that timestamp.</p>
            )}

            <Button type="submit" disabled={loadingArticle || createNews.isPending || updateNews.isPending}>
              {isEditing ? 'Update Article' : 'Create Article'}
            </Button>
          </CardContent>
        </Card>
      </form>
    </div>
  );
};

export default NewsEditor;
