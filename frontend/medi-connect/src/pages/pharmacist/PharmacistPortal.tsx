import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Input } from '../../components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { Search, Scan, QrCode, AlertTriangle } from 'lucide-react';
import { getPrescriptionQueue, getInventory, getAlerts } from '../../api/pharmacistApi';
import { PharmacyPOS } from './PharmacyPOS';



export function PharmacistPortal() {
  const [searchParams] = useSearchParams();
  const defaultTab = searchParams.get('tab') || 'prescriptions';
  const [activeTab, setActiveTab] = useState(defaultTab);
  
  // Update state when URL changes (if deeper navigation uses params)
  useEffect(() => {
      const tab = searchParams.get('tab');
      if (tab) setActiveTab(tab);
  }, [searchParams]);

  const [prescriptionQueue, setPrescriptionQueue] = useState<any[]>([]);
  const [inventoryItems, setInventoryItems] = useState<any[]>([]);
  const [alerts, setAlerts] = useState<{ lowStock: any[], expiring: any[] }>({ lowStock: [], expiring: [] });


  useEffect(() => {
    const fetchPharmacistData = async () => {
        try {
            const queue = await getPrescriptionQueue();
            setPrescriptionQueue(queue);

            const inv = await getInventory(1, 100, '');
            setInventoryItems(inv.data || []); 

            const alertsData = await getAlerts();
            setAlerts(alertsData);
        } catch (error) {
            console.error("Failed to fetch pharmacist data", error);
        }
    }
    fetchPharmacistData();
  }, []);

  const prescriptionRequests = prescriptionQueue.map((p: any) => ({
      id: p.prescriptionId,
      patient: p.user ? `${p.user.firstName} ${p.user.lastName}` : 'Unknown',
      doctor: p.appointment?.doctor?.user ? `Dr. ${p.appointment.doctor.user.firstName}` : 'Unknown',
      medication: p.prescriptionItems.map((i: any) => i.medicineName || i.medicine?.name).join(', '),
      quantity: p.prescriptionItems.length > 0 ? p.prescriptionItems[0].dosage : 'N/A', 
      status: p.status.toLowerCase(),
      qrCode: p.prescriptionId.substring(0, 8).toUpperCase(),
      submittedAt: new Date(p.issuedAt).toLocaleString()
  }));



      
      // Derive ready for pickup from queue
      const readyForPickup = prescriptionQueue.filter((p:any) => p.status === 'READY' || p.status === 'ready').map((p:any) => ({
          id: p.prescriptionId,
          patient: p.user ? `${p.user.firstName} ${p.user.lastName}` : 'Unknown',
          medication: p.prescriptionItems.map((i: any) => i.medicineName || i.medicine?.name).join(', '),
          preparedAt: new Date(p.updatedAt).toLocaleString(), // Use last update time
          notified: false, // Notification status not yet in DB
          amount: '$0.00' // Price logic not yet implemented
      }));

    // Sales data requires a new endpoint (Sales/Invoices). Setting to empty for now.



  return (
    <div className="min-h-screen bg-gray-50">

      <div className="max-w-7xl mx-auto p-6">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="prescriptions">Prescriptions</TabsTrigger>
            <TabsTrigger value="inventory">Inventory</TabsTrigger>
            <TabsTrigger value="alerts">Alerts</TabsTrigger>
            <TabsTrigger value="pickup">Ready for Pickup</TabsTrigger>
            <TabsTrigger value="pos">Point of Sale</TabsTrigger>
          </TabsList>

          {/* Prescriptions Tab */}
          <TabsContent value="prescriptions" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-semibold">Prescription Management</h2>
              <div className="flex gap-2">
                <Button variant="outline">
                  <Scan className="h-4 w-4 mr-2" />
                  Scan QR Code
                </Button>
                <Button>Process New Request</Button>
              </div>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Prescription Requests</CardTitle>
                <CardDescription>Scan QR codes to verify and process prescriptions</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {prescriptionRequests.map((prescription: any) => (
                    <div key={prescription.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-4">
                        <div className="flex flex-col items-center">
                          <QrCode className="h-8 w-8 text-blue-500 mb-1" />
                          <span className="text-xs text-gray-500">{prescription.qrCode}</span>
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-medium">{prescription.patient}</h3>
                            <Badge variant={
                              prescription.status === 'pending' ? 'destructive' :
                              prescription.status === 'verified' ? 'default' :
                              prescription.status === 'ready' ? 'secondary' : 'outline'
                            }>
                              {prescription.status}
                            </Badge>
                          </div>
                          <p className="font-medium text-blue-600">{prescription.medication}</p>
                          <p className="text-sm text-gray-600">Qty: {prescription.quantity} • Dr: {prescription.doctor}</p>
                          <p className="text-sm text-gray-500">Submitted: {prescription.submittedAt}</p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        {prescription.status === 'pending' && (
                          <>
                            <Button variant="outline" size="sm">Verify QR</Button>
                            <Button size="sm">Accept</Button>
                          </>
                        )}
                        {prescription.status === 'verified' && (
                          <Button size="sm">Mark Ready</Button>
                        )}
                        {prescription.status === 'ready' && (
                          <Button size="sm">Dispense</Button>
                        )}
                        {prescription.status === 'dispensed' && (
                          <Button variant="outline" size="sm">Generate Receipt</Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Inventory Tab */}
          <TabsContent value="inventory" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-semibold">Inventory Management</h2>
              <div className="flex gap-2">
                <div className="relative">
                  <Search className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <Input placeholder="Search medications..." className="pl-9" />
                </div>
                <Button>Add/Edit Medicine</Button>
              </div>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Stock Tracking & Expiry Alerts</CardTitle>
                <CardDescription>Monitor medication inventory and expiration dates</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {inventoryItems.map((item: any) => (
                    <div key={item.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-medium">{item.name}</h3>
                          <Badge variant="outline">{item.category}</Badge>
                          {item.stock < 50 && (
                            <Badge variant="destructive">Low Stock</Badge>
                          )}
                        </div>
                        <p className="text-sm text-gray-600">Stock: {item.stock} units • Price: ${item.price}</p>
                        <p className="text-sm text-gray-500">Expires: {new Date(item.expiryDate).toLocaleDateString()}</p>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm">Update Stock</Button>
                        <Button variant="outline" size="sm">Reorder</Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Alerts Tab */}
          <TabsContent value="alerts" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-semibold">Stock Alerts</h2>
              <Button onClick={() => window.location.reload()}>Refresh Alerts</Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Low Stock */}
                <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <AlertTriangle className="text-red-500 h-5 w-5" />
                        Low Stock Items
                    </CardTitle>
                    <CardDescription>Items below threshold (50)</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4 max-h-[400px] overflow-y-auto">
                    {alerts.lowStock.length === 0 ? <p className="text-gray-500 text-sm">No low stock items.</p> : 
                        alerts.lowStock.map((alert: any) => (
                        <div key={alert.id} className="flex items-center justify-between p-3 border rounded-lg bg-red-50/50">
                        <div className="flex-1">
                            <h3 className="font-medium text-red-900">{alert.name}</h3>
                            <p className="text-xs text-red-700">
                                Stock: <b>{alert.stock}</b> / {alert.threshold}
                            </p>
                            <p className="text-xs text-gray-500">Supplier: {alert.supplier}</p>
                        </div>
                        <Button size="sm" variant="outline" className="border-red-200 hover:bg-red-100 text-red-700">Reorder</Button>
                        </div>
                    ))}
                    </div>
                </CardContent>
                </Card>

                {/* Expiring Soon */}
                <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <AlertTriangle className="text-orange-500 h-5 w-5" />
                        Expiring Batches
                    </CardTitle>
                    <CardDescription>Batches expiring within 90 days</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4 max-h-[400px] overflow-y-auto">
                    {alerts.expiring.length === 0 ? <p className="text-gray-500 text-sm">No expiring batches.</p> : 
                        alerts.expiring.map((batch: any) => (
                        <div key={batch.id} className="flex items-center justify-between p-3 border rounded-lg bg-orange-50/50">
                        <div className="flex-1">
                            <h3 className="font-medium text-orange-900">{batch.medicineName}</h3>
                            <p className="text-xs text-orange-700">
                                Batch: {batch.batchNumber} • Qty: {batch.quantity}
                            </p>
                            <p className="text-xs text-red-600 font-semibold">
                                Expires: {new Date(batch.expiryDate).toLocaleDateString()}
                            </p>
                        </div>
                        <Badge variant="outline" className="border-orange-200 text-orange-700">Check</Badge>
                        </div>
                    ))}
                    </div>
                </CardContent>
                </Card>
            </div>
          </TabsContent>

          {/* Ready for Pickup Tab */}
          <TabsContent value="pickup" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-semibold">Ready for Pickup</h2>
              <Button>Send Notifications</Button>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Customer Notifications</CardTitle>
                <CardDescription>Prescriptions ready for customer pickup</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {readyForPickup.map((pickup: any) => (
                    <div key={pickup.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-medium">{pickup.patient}</h3>
                          <Badge variant={pickup.notified ? 'secondary' : 'destructive'}>
                            {pickup.notified ? 'Notified' : 'Pending'}
                          </Badge>
                        </div>
                        <p className="font-medium text-blue-600">{pickup.medication}</p>
                        <p className="text-sm text-gray-600">Amount: {pickup.amount}</p>
                        <p className="text-sm text-gray-500">Prepared: {pickup.preparedAt}</p>
                      </div>
                      <div className="flex gap-2">
                        {!pickup.notified && (
                          <Button variant="outline" size="sm">Send SMS</Button>
                        )}
                        <Button size="sm">Mark as Picked Up</Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

            {/* Point of Sale Tab */}
          <TabsContent value="pos" className="space-y-6">
              <PharmacyPOS />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}