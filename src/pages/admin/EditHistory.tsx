import { useState } from 'react';
import { useCmsContentHistory, useRevertCmsContent } from '@/hooks/useCmsAdmin';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Clock, RotateCcw, Search, Download } from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';

const EditHistory = () => {
  const [search, setSearch] = useState('');
  const { data: history, isLoading } = useCmsContentHistory(100);
  const revertMutation = useRevertCmsContent();

  const filtered = (history ?? []).filter((row) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return row.key.toLowerCase().includes(q)
      || (row.changed_by_email?.toLowerCase().includes(q) ?? false);
  });

  const handleRevert = async (contentId: string, oldValue: string, key: string) => {
    if (!confirm(`Revert "${key}" to its previous value?`)) return;
    try {
      await revertMutation.mutateAsync({ contentId, oldValue });
      toast.success(`Reverted "${key}" to previous value`);
    } catch (e) {
      toast.error(`Revert failed: ${(e as Error).message}`);
    }
  };

  const handleExportCsv = () => {
    if (!history?.length) return;
    const headers = ['Key', 'Old Value', 'New Value', 'Changed By', 'Changed At'];
    const rows = history.map((h) => [
      h.key,
      `"${h.old_value.replace(/"/g, '""')}"`,
      `"${h.new_value.replace(/"/g, '""')}"`,
      h.changed_by_email ?? 'unknown',
      h.changed_at,
    ]);
    const csv = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `cms-history-${format(new Date(), 'yyyy-MM-dd')}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('CSV exported');
  };

  return (
    <div className="space-y-6 max-w-[900px]">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-black text-foreground flex items-center gap-2">
            <Clock className="h-6 w-6 text-[#FF9933]" /> Edit History
          </h1>
          <p className="text-xs text-muted-foreground mt-1">
            Timeline of all CMS content changes. Revert any change with one click.
          </p>
        </div>
        <Button size="sm" variant="outline" onClick={handleExportCsv} disabled={!history?.length}>
          <Download className="h-3.5 w-3.5 mr-1" /> Export CSV
        </Button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input placeholder="Search by key or email…" value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
      </div>

      {/* Timeline */}
      {isLoading ? (
        <div className="flex items-center justify-center py-16">
          <div className="animate-spin w-6 h-6 border-2 border-[#FF6B00] border-t-transparent rounded-full" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16">
          <Clock className="h-10 w-10 text-muted-foreground/30 mx-auto mb-3" />
          <p className="text-sm text-muted-foreground">
            {search ? 'No history matches your search' : 'No edit history yet'}
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map((entry) => (
            <div
              key={entry.id}
              className="bg-card border border-border rounded-xl p-4 group hover:border-[#FF6B00]/30 transition-colors"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  {/* Key + time */}
                  <div className="flex items-center gap-2 flex-wrap">
                    <code className="text-[11px] font-mono font-bold text-foreground bg-muted px-1.5 py-0.5 rounded">
                      {entry.key}
                    </code>
                    <span className="text-[10px] text-muted-foreground">
                      {format(new Date(entry.changed_at), 'MMM d, yyyy · HH:mm')}
                    </span>
                  </div>

                  {/* Changed by */}
                  {entry.changed_by_email && (
                    <p className="text-[10px] text-muted-foreground mt-1">
                      by <span className="font-medium text-foreground">{entry.changed_by_email}</span>
                    </p>
                  )}

                  {/* Diff */}
                  <div className="mt-2 grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <div className="bg-red-50 rounded-lg p-2 border border-red-100">
                      <span className="text-[9px] font-bold text-red-400 uppercase tracking-wider">Before</span>
                      <p className="text-xs text-red-700 mt-0.5 break-words line-clamp-3">{entry.old_value || <em>empty</em>}</p>
                    </div>
                    <div className="bg-emerald-50 rounded-lg p-2 border border-emerald-100">
                      <span className="text-[9px] font-bold text-emerald-400 uppercase tracking-wider">After</span>
                      <p className="text-xs text-emerald-700 mt-0.5 break-words line-clamp-3">{entry.new_value || <em>empty</em>}</p>
                    </div>
                  </div>
                </div>

                {/* Revert button */}
                <Button
                  size="sm"
                  variant="ghost"
                  className="opacity-0 group-hover:opacity-100 transition-opacity text-amber-600 hover:text-amber-700 hover:bg-amber-50 flex-shrink-0"
                  onClick={() => handleRevert(entry.content_id, entry.old_value, entry.key)}
                  disabled={revertMutation.isPending}
                >
                  <RotateCcw className="h-3.5 w-3.5 mr-1" /> Revert
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      <p className="text-[10px] text-muted-foreground text-center">
        {filtered.length} change{filtered.length !== 1 ? 's' : ''} recorded
      </p>
    </div>
  );
};

export default EditHistory;
