import { useState } from 'react';
import { useAdminCmsContent, useCmsSections, useUpdateCmsContent } from '@/hooks/useCmsAdmin';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Search, Save, X, Database, Check } from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';

const TYPE_COLORS: Record<string, string> = {
  text:      'bg-blue-100 text-blue-700',
  text_hi:   'bg-purple-100 text-purple-700',
  richtext:  'bg-indigo-100 text-indigo-700',
  image_url: 'bg-emerald-100 text-emerald-700',
  color:     'bg-pink-100 text-pink-700',
  number:    'bg-amber-100 text-amber-700',
  boolean:   'bg-gray-100 text-gray-600',
  url:       'bg-teal-100 text-teal-700',
};

const ContentManager = () => {
  const [activeSection, setActiveSection] = useState<string | undefined>(undefined);
  const [search, setSearch] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState('');

  const { data: sections } = useCmsSections();
  const { data: content, isLoading } = useAdminCmsContent(activeSection);
  const updateMutation = useUpdateCmsContent();

  const filtered = (content ?? []).filter((row) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return row.key.toLowerCase().includes(q)
      || row.label.toLowerCase().includes(q)
      || row.value.toLowerCase().includes(q);
  });

  const handleSave = async () => {
    if (!editingId) return;
    try {
      await updateMutation.mutateAsync({ id: editingId, value: editValue });
      toast.success('Content updated');
      setEditingId(null);
    } catch (e) {
      toast.error(`Save failed: ${(e as Error).message}`);
    }
  };

  return (
    <div className="space-y-6 max-w-[1100px]">
      {/* Header */}
      <div>
        <h1 className="font-display text-2xl font-black text-foreground flex items-center gap-2">
          <Database className="h-6 w-6 text-[#FF9933]" /> Content Manager
        </h1>
        <p className="text-xs text-muted-foreground mt-1">
          View and edit all CMS content values. Changes are tracked in edit history.
        </p>
      </div>

      {/* Section tabs */}
      <div className="flex flex-wrap gap-1.5">
        <button
          onClick={() => setActiveSection(undefined)}
          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
            !activeSection
              ? 'bg-[#FF6B00] text-white shadow-md'
              : 'bg-muted text-muted-foreground hover:bg-muted/80'
          }`}
        >
          All ({content?.length ?? 0})
        </button>
        {(sections ?? []).map((s) => (
          <button
            key={s}
            onClick={() => setActiveSection(s)}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold capitalize transition-all ${
              activeSection === s
                ? 'bg-[#FF6B00] text-white shadow-md'
                : 'bg-muted text-muted-foreground hover:bg-muted/80'
            }`}
          >
            {s}
          </button>
        ))}
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input placeholder="Search by key, label, or value…" value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
      </div>

      {/* Table */}
      {isLoading ? (
        <div className="flex items-center justify-center py-16">
          <div className="animate-spin w-6 h-6 border-2 border-[#FF6B00] border-t-transparent rounded-full" />
        </div>
      ) : (
        <div className="bg-card rounded-xl border border-border overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-[10px] font-bold uppercase tracking-wider w-[220px]">Key</TableHead>
                <TableHead className="text-[10px] font-bold uppercase tracking-wider w-[100px]">Type</TableHead>
                <TableHead className="text-[10px] font-bold uppercase tracking-wider">Value</TableHead>
                <TableHead className="text-[10px] font-bold uppercase tracking-wider w-[140px]">Label</TableHead>
                <TableHead className="text-[10px] font-bold uppercase tracking-wider w-[80px] text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((row) => (
                <TableRow key={row.id} className="group hover:bg-muted/50">
                  <TableCell>
                    <code className="text-[11px] font-mono text-foreground bg-muted px-1.5 py-0.5 rounded">
                      {row.key}
                    </code>
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary" className={`text-[9px] font-bold uppercase tracking-wider ${TYPE_COLORS[row.type] ?? ''}`}>
                      {row.type}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {editingId === row.id ? (
                      <div className="flex gap-1.5">
                        <Input
                          value={editValue}
                          onChange={(e) => setEditValue(e.target.value)}
                          className="text-xs h-8"
                          autoFocus
                          onKeyDown={(e) => e.key === 'Enter' && handleSave()}
                        />
                        <Button size="sm" variant="ghost" className="h-8 w-8 p-0 text-emerald-600" onClick={handleSave} disabled={updateMutation.isPending}>
                          <Check className="h-3.5 w-3.5" />
                        </Button>
                        <Button size="sm" variant="ghost" className="h-8 w-8 p-0 text-muted-foreground" onClick={() => setEditingId(null)}>
                          <X className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    ) : (
                      <div className="text-xs text-foreground truncate max-w-[300px]" title={row.value}>
                        {row.type === 'image_url' && row.value ? (
                          <a href={row.value} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline truncate block">
                            {row.value}
                          </a>
                        ) : (
                          row.value || <span className="text-muted-foreground italic">empty</span>
                        )}
                      </div>
                    )}
                  </TableCell>
                  <TableCell className="text-[11px] text-muted-foreground">{row.label}</TableCell>
                  <TableCell className="text-right">
                    {editingId !== row.id && !row.is_locked && (
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-7 px-2 text-[10px] opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={() => {
                          setEditingId(row.id);
                          setEditValue(row.value);
                        }}
                      >
                        Edit
                      </Button>
                    )}
                    {row.is_locked && (
                      <span className="text-[9px] text-muted-foreground">🔒</span>
                    )}
                  </TableCell>
                </TableRow>
              ))}
              {filtered.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-muted-foreground py-12">
                    {search ? 'No content matches your search' : 'No CMS content found'}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      )}

      <p className="text-[10px] text-muted-foreground text-center">
        {filtered.length} item{filtered.length !== 1 ? 's' : ''}
        {activeSection && ` in "${activeSection}"`}
      </p>
    </div>
  );
};

export default ContentManager;
