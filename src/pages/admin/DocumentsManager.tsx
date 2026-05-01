import { useAdminDocumentsList, useDeleteDocument } from '@/hooks/useDocuments';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Link } from 'react-router-dom';
import { Plus, Trash2, ExternalLink, Pencil } from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';

const DocumentsManager = () => {
  const { data: docs, isLoading } = useAdminDocumentsList();
  const deleteDoc = useDeleteDocument();

  const handleDelete = (id: string) => {
    if (confirm('Delete this document?')) {
      deleteDoc.mutate(id, {
        onSuccess: () => toast.success('Deleted'),
        onError: (e) => toast.error(e.message),
      });
    }
  };

  const formatSize = (bytes: number | null) => {
    if (!bytes) return '-';
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-display text-2xl font-bold text-foreground">Documents</h1>
        <Button asChild><Link to="/admin/documents/new"><Plus className="h-4 w-4 mr-1" /> Upload Document</Link></Button>
      </div>
      {isLoading ? <p className="text-muted-foreground">Loading...</p> : (
        <div className="bg-card rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Size</TableHead>
                <TableHead>Public</TableHead>
                <TableHead>Date</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {docs?.map((doc) => (
                <TableRow key={doc.id}>
                  <TableCell className="font-medium">{doc.title_en || 'Untitled'}</TableCell>
                  <TableCell><Badge variant="outline" className="capitalize">{doc.category}</Badge></TableCell>
                  <TableCell className="text-sm text-muted-foreground">{formatSize(doc.file_size)}</TableCell>
                  <TableCell><Badge variant={doc.is_public ? 'default' : 'secondary'}>{doc.is_public ? 'Yes' : 'No'}</Badge></TableCell>
                  <TableCell className="text-sm text-muted-foreground">{format(new Date(doc.created_at), 'MMM d, yyyy')}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex gap-1 justify-end">
                      <Button asChild variant="ghost" size="icon">
                        <Link to={`/admin/documents/${doc.id}`} aria-label={`Edit ${doc.title_en || 'document'}`}>
                          <Pencil className="h-4 w-4" />
                        </Link>
                      </Button>
                      {doc.file_url && <Button asChild variant="ghost" size="icon"><a href={doc.file_url} target="_blank" rel="noopener noreferrer"><ExternalLink className="h-4 w-4" /></a></Button>}
                      <Button variant="ghost" size="icon" onClick={() => handleDelete(doc.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {(!docs || docs.length === 0) && (
                <TableRow><TableCell colSpan={6} className="text-center text-muted-foreground py-8">No documents yet.</TableCell></TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
};

export default DocumentsManager;
