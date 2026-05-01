import { useContactSubmissions, useUpdateContactStatus } from '@/hooks/useSubmissions';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { Mail, Phone, MapPin } from 'lucide-react';
import { useState } from 'react';

type ContactStatus = 'new' | 'read' | 'replied' | 'archived';
const CONTACT_STATUSES: ContactStatus[] = ['new', 'read', 'replied', 'archived'];

const ContactsManager = () => {
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const { data: contacts, isLoading } = useContactSubmissions(statusFilter === 'all' ? undefined : statusFilter);
  const updateStatus = useUpdateContactStatus();
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const handleStatusChange = (id: string, status: ContactStatus) => {
    updateStatus.mutate({ id, status }, {
      onSuccess: () => toast.success('Status updated'),
      onError: (e) => toast.error(e.message),
    });
  };

  const statusColors: Record<string, string> = {
    new: 'bg-blue-100 text-blue-700',
    read: 'bg-yellow-100 text-yellow-700',
    replied: 'bg-green-100 text-green-700',
    archived: 'bg-gray-100 text-gray-500',
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-display text-2xl font-bold text-foreground">Contact Submissions</h1>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-32"><SelectValue placeholder="All" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            <SelectItem value="new">New</SelectItem>
            <SelectItem value="read">Read</SelectItem>
            <SelectItem value="replied">Replied</SelectItem>
            <SelectItem value="archived">Archived</SelectItem>
          </SelectContent>
        </Select>
      </div>
      {isLoading ? <p className="text-muted-foreground">Loading...</p> : (
        <div className="space-y-3">
          {contacts && contacts.length > 0 ? contacts.map((c) => (
            <div key={c.id} className="bg-card border border-border rounded-lg">
              <div className="p-4 flex items-center gap-4 cursor-pointer" onClick={() => setExpandedId(expandedId === c.id ? null : c.id)}>
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-sm text-foreground">{c.name}</div>
                  <div className="text-xs text-muted-foreground flex items-center gap-3 mt-0.5 flex-wrap">
                    {c.phone && <span className="flex items-center gap-1"><Phone className="w-3 h-3" />{c.phone}</span>}
                    {c.email && <span className="flex items-center gap-1"><Mail className="w-3 h-3" />{c.email}</span>}
                    {c.district && <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{c.district}</span>}
                  </div>
                </div>
                <div className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${statusColors[c.status] || 'bg-gray-100'}`}>{c.status}</div>
                <div className="text-xs text-muted-foreground">{format(new Date(c.created_at), 'MMM d, HH:mm')}</div>
              </div>
              {expandedId === c.id && (
                <div className="px-4 pb-4 border-t border-border pt-3">
                  <p className="text-sm text-foreground mb-3 whitespace-pre-wrap">{c.message}</p>
                  <div className="flex gap-2">
                    {CONTACT_STATUSES.map(s => (
                      <Button key={s} size="sm" variant={c.status === s ? 'default' : 'outline'} onClick={() => handleStatusChange(c.id, s)} className="capitalize text-xs">{s}</Button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )) : (
            <div className="text-center py-12 border-2 border-dashed rounded-xl text-muted-foreground">No contact submissions</div>
          )}
        </div>
      )}
    </div>
  );
};

export default ContactsManager;
