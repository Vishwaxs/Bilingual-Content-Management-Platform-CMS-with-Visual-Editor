import { useState, useEffect } from 'react';
import { useLeadershipProfiles, useCreateLeader, useUpdateLeader, useDeleteLeader } from '@/hooks/useLeadership';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

const emptyForm = {
  name_en: '', name_hi: '',
  designation_en: '', designation_hi: '',
  bio_en: '', bio_hi: '',
  photo_url: '', display_order: 0,
};

type LeaderRow = {
  id: string;
  name_en?: string | null;
  name_hi?: string | null;
  designation_en?: string | null;
  designation_hi?: string | null;
  bio_en?: string | null;
  bio_hi?: string | null;
  photo_url?: string | null;
  display_order?: number | null;
};

const LeadershipManager = () => {
  const { data: leaders, isLoading } = useLeadershipProfiles(false);
  const createLeader = useCreateLeader();
  const updateLeader = useUpdateLeader();
  const deleteLeader = useDeleteLeader();
  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);

  const handleEdit = (leader: LeaderRow) => {
    setEditingId(leader.id);
    setForm({
      name_en: leader.name_en || '',
      name_hi: leader.name_hi || '',
      designation_en: leader.designation_en || '',
      designation_hi: leader.designation_hi || '',
      bio_en: leader.bio_en || '',
      bio_hi: leader.bio_hi || '',
      photo_url: leader.photo_url || '',
      display_order: leader.display_order || 0,
    });
    setOpen(true);
  };

  const handleNew = () => {
    setEditingId(null);
    setForm(emptyForm);
    setOpen(true);
  };

  const handleDelete = (id: string) => {
    if (confirm('Delete this leader?')) {
      deleteLeader.mutate(id, {
        onSuccess: () => toast.success('Deleted'),
        onError: (e) => toast.error(e.message),
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingId) {
        await updateLeader.mutateAsync({ id: editingId, ...form });
        toast.success('Updated');
      } else {
        await createLeader.mutateAsync(form);
        toast.success('Created');
      }
      setOpen(false);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to save leader';
      toast.error(message);
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-display text-2xl font-bold text-foreground">Leadership Profiles</h1>
        <Button onClick={handleNew}><Plus className="h-4 w-4 mr-1" /> Add Leader</Button>
      </div>

      <div className="bg-card rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Order</TableHead>
              <TableHead>Name (EN)</TableHead>
              <TableHead>Designation (EN)</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {leaders?.map((leader) => (
              <TableRow key={leader.id}>
                <TableCell>{leader.display_order}</TableCell>
                <TableCell className="font-medium">{leader.name_en}</TableCell>
                <TableCell className="text-muted-foreground">{leader.designation_en}</TableCell>
                <TableCell className="text-right">
                  <div className="flex gap-1 justify-end">
                    <Button variant="ghost" size="icon" onClick={() => handleEdit(leader)}>
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => handleDelete(leader.id)}>
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
            {(!leaders || leaders.length === 0) && (
              <TableRow>
                <TableCell colSpan={4} className="text-center text-muted-foreground py-8">
                  No leaders yet.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-display">{editingId ? 'Edit Leader' : 'Add Leader'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-4">
                <div className="space-y-2"><Label>Name (EN)</Label><Input value={form.name_en} onChange={(e) => setForm(p => ({ ...p, name_en: e.target.value }))} /></div>
                <div className="space-y-2"><Label>Designation (EN)</Label><Input value={form.designation_en} onChange={(e) => setForm(p => ({ ...p, designation_en: e.target.value }))} /></div>
                <div className="space-y-2"><Label>Bio (EN)</Label><Textarea value={form.bio_en} onChange={(e) => setForm(p => ({ ...p, bio_en: e.target.value }))} rows={4} /></div>
              </div>
              <div className="space-y-4">
                <div className="space-y-2"><Label>Name (HI)</Label><Input value={form.name_hi} onChange={(e) => setForm(p => ({ ...p, name_hi: e.target.value }))} /></div>
                <div className="space-y-2"><Label>Designation (HI)</Label><Input value={form.designation_hi} onChange={(e) => setForm(p => ({ ...p, designation_hi: e.target.value }))} /></div>
                <div className="space-y-2"><Label>Bio (HI)</Label><Textarea value={form.bio_hi} onChange={(e) => setForm(p => ({ ...p, bio_hi: e.target.value }))} rows={4} /></div>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2"><Label>Photo URL</Label><Input value={form.photo_url} onChange={(e) => setForm(p => ({ ...p, photo_url: e.target.value }))} placeholder="https://..." /></div>
              <div className="space-y-2"><Label>Display Order</Label><Input type="number" value={form.display_order} onChange={(e) => setForm(p => ({ ...p, display_order: parseInt(e.target.value) || 0 }))} /></div>
            </div>
            <Button type="submit" disabled={createLeader.isPending || updateLeader.isPending}>
              {editingId ? 'Update' : 'Create'}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default LeadershipManager;
