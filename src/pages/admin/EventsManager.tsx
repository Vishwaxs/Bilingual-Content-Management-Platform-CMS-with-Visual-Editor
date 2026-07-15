import { useAdminEventsList, useDeleteEvent } from '@/hooks/useEvents';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Link } from 'react-router-dom';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { useState } from 'react';
import { getErrorMessage } from '@/lib/utils';

const EventsManager = () => {
  const { data: events, isLoading } = useAdminEventsList();
  const deleteEvent = useDeleteEvent();
  const [selected, setSelected] = useState<Set<string>>(new Set());

  const toggleSelect = (id: string) => {
    setSelected(prev => { const n = new Set(prev); if (n.has(id)) n.delete(id); else n.add(id); return n; });
  };
  const toggleAll = () => {
    if (!events) return;
    setSelected(selected.size === events.length ? new Set() : new Set(events.map(e => e.id)));
  };
  const bulkDelete = async () => {
    const ids = Array.from(selected);
    if (!confirm(`Delete ${ids.length} event(s)?`)) return;
    try {
      await Promise.all(ids.map(id => deleteEvent.mutateAsync(id)));
      toast.success(`${ids.length} event(s) deleted`);
      setSelected(new Set());
    } catch (err: unknown) { toast.error(getErrorMessage(err, 'Bulk delete failed')); }
  };

  const handleDelete = (id: string) => {
    if (confirm('Delete this event?')) {
      deleteEvent.mutate(id, {
        onSuccess: () => toast.success('Event deleted'),
        onError: (e) => toast.error(e.message),
      });
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-display text-2xl font-bold text-foreground">Events</h1>
        <Button asChild><Link to="/admin/events/new"><Plus className="h-4 w-4 mr-1" /> New Event</Link></Button>
      </div>
      {isLoading ? <p className="text-muted-foreground">Loading...</p> : (
        <div className="bg-card rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-10">
                  <input type="checkbox" checked={events ? selected.size === events.length && events.length > 0 : false}
                    onChange={toggleAll} className="rounded" />
                </TableHead>
                <TableHead>Title (EN)</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {events?.map((evt) => (
                <TableRow key={evt.id} className={selected.has(evt.id) ? 'bg-[#FF6B00]/5' : ''}>
                  <TableCell>
                    <input type="checkbox" checked={selected.has(evt.id)}
                      onChange={() => toggleSelect(evt.id)} className="rounded" />
                  </TableCell>
                  <TableCell className="font-medium">{evt.title_en || 'Untitled'}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">{evt.event_date ? format(new Date(evt.event_date), 'MMM d, yyyy') : 'TBA'}</TableCell>
                  <TableCell><Badge variant={evt.status === 'published' ? 'default' : 'secondary'}>{evt.status}</Badge></TableCell>
                  <TableCell className="text-right">
                    <div className="flex gap-1 justify-end">
                      <Button asChild variant="ghost" size="icon"><Link to={`/admin/events/${evt.id}`}><Pencil className="h-4 w-4" /></Link></Button>
                      <Button variant="ghost" size="icon" onClick={() => handleDelete(evt.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {(!events || events.length === 0) && (
                <TableRow><TableCell colSpan={5} className="text-center text-muted-foreground py-8">No events yet.</TableCell></TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      )}

      {selected.size > 0 && (
        <div className="fixed bottom-0 left-64 right-0 bg-[#0B1F3A] border-t border-[#FF6B00]/30 p-4 flex items-center gap-4 z-50">
          <span className="text-white text-sm font-semibold">{selected.size} selected</span>
          <Button size="sm" variant="destructive" onClick={bulkDelete}>Delete All</Button>
          <Button size="sm" variant="ghost" className="text-white/60" onClick={() => setSelected(new Set())}>Clear</Button>
        </div>
      )}
    </div>
  );
};

export default EventsManager;
