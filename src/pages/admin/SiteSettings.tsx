import { useAllSettings, useUpdateSetting } from '@/hooks/useSiteSettings';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { useState } from 'react';
import { Plus, Save } from 'lucide-react';

const SiteSettings = () => {
  const { data: settings, isLoading } = useAllSettings();
  const updateSetting = useUpdateSetting();
  const [newKey, setNewKey] = useState('');
  const [newValue, setNewValue] = useState('');
  const [editValues, setEditValues] = useState<Record<string, string>>({});

  const handleUpdate = (key: string, value: string) => {
    let parsed: unknown;
    try { parsed = JSON.parse(value); } catch { parsed = value; }
    updateSetting.mutate({ key, value: parsed }, {
      onSuccess: () => toast.success(`Setting "${key}" updated`),
      onError: (e) => toast.error(e.message),
    });
  };

  const handleCreate = () => {
    if (!newKey.trim()) { toast.error('Key required'); return; }
    let parsed: unknown;
    try { parsed = JSON.parse(newValue); } catch { parsed = newValue; }
    updateSetting.mutate({ key: newKey.trim(), value: parsed }, {
      onSuccess: () => { toast.success('Setting created'); setNewKey(''); setNewValue(''); },
      onError: (e) => toast.error(e.message),
    });
  };

  return (
    <div>
      <h1 className="font-display text-2xl font-bold text-foreground mb-6">Site Settings</h1>
      {isLoading ? <p className="text-muted-foreground">Loading...</p> : (
        <div className="space-y-6 max-w-3xl">
          {/* Existing settings */}
          {settings?.map((s) => {
            const strVal = editValues[s.key] ?? (typeof s.value === 'string' ? s.value : JSON.stringify(s.value, null, 2));
            return (
              <Card key={s.key}>
                <CardHeader className="pb-2"><CardTitle className="text-sm font-mono">{s.key}</CardTitle></CardHeader>
                <CardContent className="space-y-2">
                  <Textarea value={strVal} onChange={e => setEditValues(p => ({ ...p, [s.key]: e.target.value }))} rows={typeof s.value === 'string' ? 2 : 4} className="font-mono text-xs" />
                  <Button size="sm" onClick={() => handleUpdate(s.key, strVal)}><Save className="w-3.5 h-3.5 mr-1" /> Save</Button>
                </CardContent>
              </Card>
            );
          })}

          {/* Add new setting */}
          <Card className="border-dashed">
            <CardHeader><CardTitle className="text-sm">Add New Setting</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1"><Label className="text-xs">Key</Label><Input value={newKey} onChange={e => setNewKey(e.target.value)} placeholder="setting_key" className="font-mono text-sm" /></div>
                <div className="space-y-1"><Label className="text-xs">Value (JSON or text)</Label><Input value={newValue} onChange={e => setNewValue(e.target.value)} placeholder='["item1","item2"]' className="font-mono text-sm" /></div>
              </div>
              <Button size="sm" onClick={handleCreate}><Plus className="w-3.5 h-3.5 mr-1" /> Add Setting</Button>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default SiteSettings;
