import { useAdminFocusAreas, useCreateFocusArea, useUpdateFocusArea, useDeleteFocusArea } from '@/hooks/useFocusAreas';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent } from '@/components/ui/card';
import { toast } from 'sonner';
import { useState } from 'react';
import { Plus, Trash2, GripVertical, Save } from 'lucide-react';

const FocusAreasManager = () => {
  const { data: areas, isLoading } = useAdminFocusAreas();
  const createArea = useCreateFocusArea();
  const updateArea = useUpdateFocusArea();
  const deleteArea = useDeleteFocusArea();
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    title_en: '', title_hi: '',
    description_en: '', description_hi: '',
    icon: '🙏', display_order: 999, is_active: true,
  });

  const handleCreate = async () => {
    if (!form.title_en) { toast.error('Title required'); return; }
    try {
      await createArea.mutateAsync(form);
      toast.success('Focus area created');
      setForm({ title_en: '', title_hi: '', description_en: '', description_hi: '', icon: '🙏', display_order: 999, is_active: true });
      setShowForm(false);
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : 'Failed to create focus area';
      toast.error(message);
    }
  };

  const handleDelete = (id: string) => {
    if (confirm('Delete this focus area?')) {
      deleteArea.mutate(id, {
        onSuccess: () => toast.success('Deleted'),
        onError: (e) => toast.error(e instanceof Error ? e.message : 'Failed to delete focus area'),
      });
    }
  };

  const handleToggle = (id: string, isActive: boolean) => {
    updateArea.mutate(
      { id, is_active: isActive },
      { onSuccess: () => toast.success('Updated'), onError: (e) => toast.error(e instanceof Error ? e.message : 'Failed to update focus area') },
    );
  };

  const handleOrderChange = (id: string, order: number) => {
    updateArea.mutate({ id, display_order: order }, { onSuccess: () => toast.success('Order updated') });
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-display text-2xl font-bold text-foreground">Focus Areas</h1>
        <Button onClick={() => setShowForm(!showForm)}><Plus className="h-4 w-4 mr-1" /> Add Focus Area</Button>
      </div>

      {/* Create form */}
      {showForm && (
        <Card className="mb-6 border-dashed border-2 border-primary/30">
          <CardContent className="pt-6 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2"><Label>Icon (emoji)</Label><Input value={form.icon} onChange={e => setForm(p => ({ ...p, icon: e.target.value }))} maxLength={10} className="text-2xl" /></div>
              <div className="space-y-2"><Label>Display Order</Label><Input type="number" value={form.display_order} onChange={e => setForm(p => ({ ...p, display_order: parseInt(e.target.value) || 0 }))} /></div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2"><Label>Title (EN)</Label><Input value={form.title_en} onChange={e => setForm(p => ({ ...p, title_en: e.target.value }))} /></div>
              <div className="space-y-2"><Label>Title (HI)</Label><Input value={form.title_hi} onChange={e => setForm(p => ({ ...p, title_hi: e.target.value }))} /></div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2"><Label>Description (EN)</Label><Textarea value={form.description_en} onChange={e => setForm(p => ({ ...p, description_en: e.target.value }))} rows={3} /></div>
              <div className="space-y-2"><Label>Description (HI)</Label><Textarea value={form.description_hi} onChange={e => setForm(p => ({ ...p, description_hi: e.target.value }))} rows={3} /></div>
            </div>
            <Button onClick={handleCreate} disabled={createArea.isPending}><Save className="w-4 h-4 mr-1" /> Create</Button>
          </CardContent>
        </Card>
      )}

      {isLoading ? <p className="text-muted-foreground">Loading...</p> : (
        <div className="space-y-3">
          {areas?.map((area) => (
            <div key={area.id} className="bg-card border border-border rounded-lg p-4 flex items-center gap-4">
              <GripVertical className="w-4 h-4 text-muted-foreground cursor-grab flex-shrink-0" />
              <div className="text-2xl flex-shrink-0">{area.icon}</div>
              <div className="flex-1 min-w-0">
                <div className="font-semibold text-sm text-foreground">{area.title_en}</div>
                <div className="text-xs text-muted-foreground">{area.title_hi}</div>
                <div className="text-xs text-muted-foreground/60 mt-1 line-clamp-1">{area.description_en}</div>
              </div>
              <Input type="number" value={area.display_order} onChange={e => handleOrderChange(area.id, parseInt(e.target.value) || 0)}
                className="w-16 text-center text-xs" />
              <Switch checked={area.is_active} onCheckedChange={v => handleToggle(area.id, v)} />
              <Button variant="ghost" size="icon" onClick={() => handleDelete(area.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
            </div>
          ))}
          {(!areas || areas.length === 0) && (
            <div className="text-center py-12 border-2 border-dashed rounded-xl text-muted-foreground">No focus areas. Create your first one!</div>
          )}
        </div>
      )}
    </div>
  );
};

export default FocusAreasManager;
