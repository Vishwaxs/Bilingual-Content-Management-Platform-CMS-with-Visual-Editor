import { useMembershipApplications, useUpdateMembershipStatus } from '@/hooks/useSubmissions';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { useState } from 'react';
import { Download } from 'lucide-react';

type MembershipStatus = 'new' | 'approved' | 'rejected' | 'pending';

const MembershipsManager = () => {
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const { data: members, isLoading } = useMembershipApplications(statusFilter === 'all' ? undefined : statusFilter);
  const updateStatus = useUpdateMembershipStatus();

  const handleStatusChange = (id: string, status: MembershipStatus) => {
    updateStatus.mutate({ id, status }, {
      onSuccess: () => toast.success('Status updated'),
      onError: (e) => toast.error(e.message),
    });
  };

  const exportCSV = () => {
    if (!members || members.length === 0) return;
    const headers = ['Name', 'Phone', 'Email', 'District', 'Status', 'Date'];
    const rows = members.map(m => [m.full_name, m.phone, m.email || '', m.district, m.status, format(new Date(m.created_at), 'yyyy-MM-dd')]);
    const csv = [headers.join(','), ...rows.map(r => r.map(cell => `"${cell}"`).join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = 'memberships.csv'; a.click();
    URL.revokeObjectURL(url);
  };

  const statusColors: Record<string, 'default' | 'secondary' | 'outline' | 'destructive'> = {
    new: 'default', approved: 'default', rejected: 'destructive', pending: 'secondary',
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-display text-2xl font-bold text-foreground">Membership Applications</h1>
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" onClick={exportCSV}><Download className="h-4 w-4 mr-1" /> Export CSV</Button>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-32"><SelectValue placeholder="All" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="new">New</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="approved">Approved</SelectItem>
              <SelectItem value="rejected">Rejected</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      {isLoading ? <p className="text-muted-foreground">Loading...</p> : (
        <div className="bg-card rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead>District</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Date</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {members?.map((m) => (
                <TableRow key={m.id}>
                  <TableCell className="font-medium">{m.full_name}</TableCell>
                  <TableCell className="text-sm">{m.phone}</TableCell>
                  <TableCell className="text-sm">{m.district}</TableCell>
                  <TableCell><Badge variant={statusColors[m.status] || 'secondary'}>{m.status}</Badge></TableCell>
                  <TableCell className="text-sm text-muted-foreground">{format(new Date(m.created_at), 'MMM d, yyyy')}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex gap-1 justify-end">
                      {m.status !== 'pending' && <Button size="sm" variant="outline" onClick={() => handleStatusChange(m.id, 'pending')} className="text-xs">Pending</Button>}
                      {m.status !== 'approved' && <Button size="sm" variant="outline" onClick={() => handleStatusChange(m.id, 'approved')} className="text-xs">Approve</Button>}
                      {m.status !== 'rejected' && <Button size="sm" variant="outline" onClick={() => handleStatusChange(m.id, 'rejected')} className="text-xs text-destructive">Reject</Button>}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {(!members || members.length === 0) && (
                <TableRow><TableCell colSpan={6} className="text-center text-muted-foreground py-8">No applications</TableCell></TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
};

export default MembershipsManager;
