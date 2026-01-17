import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { MockApi } from '../../services/mockApi';
import type { LabRequest } from '../../types';
import { Badge } from '../../components/ui/badge';
import { FlaskConical, CheckCircle } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '../../components/ui/dialog';
import { Label } from '../../components/ui/label';

export function LabRequests() {
  const [requests, setRequests] = useState<LabRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRequest, setSelectedRequest] = useState<LabRequest | null>(null);
  const [resultInput, setResultInput] = useState('');

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    const data = await MockApi.getLabRequests();
    setRequests(data);
    setLoading(false);
  };

  const handleUpdate = async () => {
    if (!selectedRequest) return;
    await MockApi.updateLabResult(selectedRequest.id, resultInput);
    // Optimistic update
    setRequests(requests.map(r => r.id === selectedRequest.id ? { ...r, status: 'COMPLETED', result: resultInput } : r));
    setSelectedRequest(null);
    setResultInput('');
  };

  if (loading) return <div>Loading requests...</div>;

  return (
    <Card className="col-span-1">
      <CardHeader>
        <CardTitle>Lab Requests</CardTitle>
        <CardDescription>Manage pending tests and enter results.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {requests.map((req) => (
            <div key={req.id} className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-3 border rounded bg-white hover:bg-slate-50 transition-colors">
              <div className="flex items-center gap-3">
                 <div className="p-2 bg-purple-100 text-purple-600 rounded-full">
                   <FlaskConical className="h-5 w-5" />
                 </div>
                 <div>
                   <h4 className="font-semibold text-gray-800">{req.testType}</h4>
                   <p className="text-sm text-gray-500">{req.patientName} • {req.date}</p>
                 </div>
              </div>
              
              <div className="flex items-center gap-2 mt-3 sm:mt-0 w-full sm:w-auto justify-between sm:justify-end">
                 <Badge variant={req.status === 'COMPLETED' ? 'secondary' : 'default'} className={req.status === 'COMPLETED' ? 'bg-green-100 text-green-800' : ''}>
                   {req.status}
                 </Badge>

                 {req.status === 'PENDING' ? (
                   <Dialog>
                     <DialogTrigger asChild>
                       <Button size="sm" onClick={() => setSelectedRequest(req)}>Enter Result</Button>
                     </DialogTrigger>
                     <DialogContent>
                       <DialogHeader>
                         <DialogTitle>Enter Results: {req.testType}</DialogTitle>
                       </DialogHeader>
                       <div className="space-y-2 py-4">
                         <Label>Test Findings</Label>
                         <Input 
                           placeholder="Enter result details..." 
                           value={resultInput} 
                           onChange={(e) => setResultInput(e.target.value)}
                         />
                       </div>
                       <DialogFooter>
                         <Button onClick={handleUpdate}>Save & Complete</Button>
                       </DialogFooter>
                     </DialogContent>
                   </Dialog>
                 ) : (
                    <Button variant="ghost" size="sm" className="text-green-600">
                      <CheckCircle className="h-4 w-4 mr-1" /> Done
                    </Button>
                 )}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
