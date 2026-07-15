import { useAllNews, useDeleteNews, useUpdateNews } from '@/hooks/useNews';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Link } from 'react-router-dom';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { useState } from 'react';
import { getErrorMessage } from '@/lib/utils';

const NewsManager = () => {
  const { data: news, isLoading } = useAllNews();
  const deleteNews = useDeleteNews();
  const updateNews = useUpdateNews();
  const [selected, setSelected] = useState<Set<string>>(new Set());

  const toggleSelect = (id: string) => {
    setSelected(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };
  const toggleAll = () => {
    if (!news) return;
    if (selected.size === news.length) setSelected(new Set());
    else setSelected(new Set(news.map(a => a.id)));
  };

  const bulkAction = async (action: 'publish' | 'archive' | 'delete') => {
    const ids = Array.from(selected);
    if (ids.length === 0) return;
    const label = action === 'delete' ? 'Delete' : action === 'publish' ? 'Publish' : 'Archive';
    if (!confirm(`${label} ${ids.length} article(s)?`)) return;
    try {
      if (action === 'delete') {
        await Promise.all(ids.map(id => deleteNews.mutateAsync(id)));
      } else {
        await Promise.all(ids.map(id => updateNews.mutateAsync({
          id,
          status: action === 'publish' ? 'published' : 'archived',
          published_at: action === 'publish' ? new Date().toISOString() : null,
        })));
      }
      toast.success(`${ids.length} article(s) ${action === 'delete' ? 'deleted' : action + 'ed'}`);
      setSelected(new Set());
    } catch (err: unknown) {
      toast.error(getErrorMessage(err, 'Bulk action failed'));
    }
  };

  const handleDelete = (id: string) => {
    if (confirm('Delete this article?')) {
      deleteNews.mutate(id, {
        onSuccess: () => toast.success('Deleted'),
        onError: (e) => toast.error(e.message),
      });
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-display text-2xl font-bold text-foreground">News Articles</h1>
        <Button asChild>
          <Link to="/admin/news/new"><Plus className="h-4 w-4 mr-1" /> New Article</Link>
        </Button>
      </div>

      {isLoading ? (
        <p className="text-muted-foreground">Loading...</p>
      ) : (
        <div className="bg-card rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-10">
                  <input type="checkbox" checked={news ? selected.size === news.length && news.length > 0 : false}
                    onChange={toggleAll} className="rounded" />
                </TableHead>
                <TableHead>Title (EN)</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Date</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {news?.map((article) => (
                <TableRow key={article.id} className={selected.has(article.id) ? 'bg-[#FF6B00]/5' : ''}>
                  <TableCell>
                    <input type="checkbox" checked={selected.has(article.id)}
                      onChange={() => toggleSelect(article.id)} className="rounded" />
                  </TableCell>
                  <TableCell className="font-medium">{article.title_en || 'Untitled'}</TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        article.status === 'published' && article.published_at && new Date(article.published_at).getTime() > Date.now()
                          ? 'secondary'
                          : article.status === 'published'
                            ? 'default'
                            : 'secondary'
                      }
                    >
                      {article.status === 'published' && article.published_at && new Date(article.published_at).getTime() > Date.now()
                        ? 'scheduled'
                        : article.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {article.published_at
                      ? format(new Date(article.published_at), 'MMM d, yyyy')
                      : format(new Date(article.created_at), 'MMM d, yyyy')}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex gap-1 justify-end">
                      <Button asChild variant="ghost" size="icon">
                        <Link to={`/admin/news/${article.id}`}><Pencil className="h-4 w-4" /></Link>
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => handleDelete(article.id)}>
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {(!news || news.length === 0) && (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                    No articles yet. Create your first one!
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Bulk action bar */}
      {selected.size > 0 && (
        <div className="fixed bottom-0 left-64 right-0 bg-[#0B1F3A] border-t border-[#FF6B00]/30 p-4 flex items-center gap-4 z-50">
          <span className="text-white text-sm font-semibold">{selected.size} selected</span>
          <Button size="sm" variant="secondary" onClick={() => bulkAction('publish')}>Publish All</Button>
          <Button size="sm" variant="secondary" onClick={() => bulkAction('archive')}>Archive All</Button>
          <Button size="sm" variant="destructive" onClick={() => bulkAction('delete')}>Delete All</Button>
          <Button size="sm" variant="ghost" className="text-white/60" onClick={() => setSelected(new Set())}>Clear</Button>
        </div>
      )}
    </div>
  );
};

export default NewsManager;
