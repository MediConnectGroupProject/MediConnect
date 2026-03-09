import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Input } from '../../components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { Search, Scan, QrCode, AlertTriangle } from 'lucide-react';
import { getPrescriptionQueue, getInventory, getAlerts, updatePrescriptionStatus } from '../../api/pharmacistApi';
import { PharmacyPOS } from './PharmacyPOS';
import { PrescriptionReceipt } from './PrescriptionReceipt';
import { PrescriptionDetailsModal } from './PrescriptionDetailsModal';
import { InventoryTable } from './InventoryTable';
import { MedicineFormModal } from './MedicineFormModal';
import { ReceiveStockModal } from './ReceiveStockModal';
import toast from 'react-hot-toast';

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

  const [prescriptionSearch, setPrescriptionSearch] = useState('');
  const [prescriptionFilter, setPrescriptionFilter] = useState('all');
  const [isUpdating, setIsUpdating] = useState(false);
  
  // Modal tracking state for the printable receipt
  const [printingPrescription, setPrintingPrescription] = useState<any | null>(null);
  const [isRefreshingAlerts, setIsRefreshingAlerts] = useState(false);
  
  const [viewingPrescription, setViewingPrescription] = useState<any | null>(null);

  // Inventory UI State
  const [inventorySearch, setInventorySearch] = useState('');
  const [isMedicineFormOpen, setIsMedicineFormOpen] = useState(false);
  const [editingMedicine, setEditingMedicine] = useState<any | null>(null);
  const [isReceiveStockOpen, setIsReceiveStockOpen] = useState(false);
  const [receivingMedicine, setReceivingMedicine] = useState<any | null>(null);

  const fetchAlertsData = async () => {
      setIsRefreshingAlerts(true);
      try {
          const alertsData = await getAlerts();
          setAlerts(alertsData);
      } catch (error) {
          console.error("Failed to fetch alerts", error);
      } finally {
          setIsRefreshingAlerts(false);
      }
  };

  const fetchInventoryData = async (searchStr = '') => {
      try {
          // getInventory(page, limit, search)
          const inv = await getInventory(1, 1000, searchStr);
          setInventoryItems(Array.isArray(inv) ? inv : []);
      } catch (error) {
          console.error("Failed to fetch inventory", error);
      }
  };

  const handleUpdateStatus = async (id: string, status: string) => {
      setIsUpdating(true);
      try {
          await updatePrescriptionStatus(id, status);
          const queue = await getPrescriptionQueue();
          setPrescriptionQueue(queue);
      } catch (error) {
          console.error("Failed to update status", error);
          alert("Failed to update prescription status.");
      } finally {
          setIsUpdating(false);
      }
  };

  const handleDispenseWithUndo = async (pickupId: string) => {
      // Optimistically push status update
      await handleUpdateStatus(pickupId, 'DISPENSED');
      
      toast((t) => (
          <div className="flex items-center gap-4">
              <span>Prescription marked as Picked Up.</span>
              <Button 
                 size="sm" 
                 variant="outline" 
                 onClick={async () => {
                     toast.dismiss(t.id);
                     await handleUpdateStatus(pickupId, 'READY');
                     toast.success("Action undone. Prescription returned to pickup queue.");
                 }}
              >
                 Undo
              </Button>
          </div>
      ), { duration: 7000 });
  };


  useEffect(() => {
    const fetchPharmacistData = async () => {
        try {
            const queue = await getPrescriptionQueue();
            setPrescriptionQueue(queue);

            await fetchInventoryData();
            await fetchAlertsData();
        } catch (error) {
            console.error("Failed to fetch pharmacist data", error);
        }
    }
    fetchPharmacistData();
  }, []);

  // Debounced Search Effect for Inventory
  useEffect(() => {
      const delaySearch = setTimeout(() => {
          fetchInventoryData(inventorySearch);
      }, 400);
      return () => clearTimeout(delaySearch);
  }, [inventorySearch]);

  const prescriptionRequests = prescriptionQueue.map((p: any) => ({
      id: p.prescriptionId,
      patient: p.user ? `${p.user.firstName} ${p.user.lastName}` : 'Walk-in Request',
      doctor: p.appointment?.doctor?.user ? `Dr. ${p.appointment.doctor.user.firstName} ${p.appointment.doctor.user.lastName}` : 'Walk-in Request',
      medication: p.prescriptionItems.map((i: any) => i.medicineName || i.medicine?.name).join(', '),
      rawItems: p.prescriptionItems.map((i: any) => ({
          ...i,
          quantity: i.quantity,
          durationText: i.durationText
      })),
      dosage: p.prescriptionItems.map((i: any) => i.dosage).filter(Boolean).join(', ') || 'N/A', 
      instructions: p.prescriptionItems.map((i: any) => i.instructions).filter(Boolean).join(' | ') || p.notes || 'No instructions provided',
      generalInstructions: p.notes || null, // Doctor's general notes for the printable receipt
      status: p.status.toLowerCase(),
      qrCode: p.prescriptionId.substring(0, 8).toUpperCase(),
      submittedAt: new Date(p.issuedAt).toLocaleString()
  }));

  const filteredPrescriptions = prescriptionRequests.filter((p: any) => {
      const matchesSearch = p.patient.toLowerCase().includes(prescriptionSearch.toLowerCase()) || 
                            p.qrCode.toLowerCase().includes(prescriptionSearch.toLowerCase());
      const matchesFilter = prescriptionFilter === 'all' || p.status === prescriptionFilter;
      return matchesSearch && matchesFilter;
  });

      
      // Derive ready for pickup from queue
      const readyForPickup = prescriptionQueue.filter((p:any) => p.status === 'READY' || p.status === 'ready').map((p:any) => ({
          id: p.prescriptionId,
          patient: p.user ? `${p.user.firstName} ${p.user.lastName}` : 'Walk-in Request',
          medication: p.prescriptionItems.map((i: any) => i.medicineName || i.medicine?.name).join(', '),
          preparedAt: p.updatedAt ? new Date(p.updatedAt).toLocaleString() : 'N/A', // Use last update time securely
          amount: 'Pending' // Price logic not yet implemented
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
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                  <div>
                    <CardTitle>Prescription Requests</CardTitle>
                    <CardDescription>Scan QR codes to verify and process prescriptions</CardDescription>
                  </div>
                  <div className="flex flex-col sm:flex-row gap-2 w-full md:w-auto">
                    <div className="relative w-full sm:w-64">
                      <Search className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                      <Input 
                        placeholder="Search patient or QR..." 
                        className="pl-9"
                        value={prescriptionSearch}
                        onChange={(e) => setPrescriptionSearch(e.target.value)}
                      />
                    </div>
                    <select 
                      className="border rounded-md px-3 py-2 text-sm bg-white"
                      value={prescriptionFilter}
                      onChange={(e) => setPrescriptionFilter(e.target.value)}
                    >
                      <option value="all">All Statuses</option>
                      <option value="pending">Pending</option>
                      <option value="verified">Verified</option>
                      <option value="ready">Ready</option>
                      <option value="dispensed">Dispensed</option>
                    </select>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {filteredPrescriptions.map((prescription: any) => (
                    <div key={prescription.id} className="flex flex-col md:flex-row items-start md:items-center justify-between p-4 border rounded-lg gap-4">
                      <div className="flex items-start gap-4">
                        <div className="flex flex-col items-center mt-1">
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
                              {prescription.status.toUpperCase()}
                            </Badge>
                          </div>
                          <p className="font-medium text-blue-600">{prescription.medication}</p>
                          <div className="text-sm text-gray-600 flex flex-wrap gap-x-4">
                             <span><b>Dosage:</b> {prescription.dosage}</span>
                             <span><b>Dr:</b> {prescription.doctor}</span>
                          </div>
                          <p className="text-sm text-gray-700 italic mt-1 bg-yellow-50 p-2 rounded border border-yellow-100">Instructions: {prescription.instructions}</p>
                          <p className="text-xs text-gray-500 mt-2">Submitted: {prescription.submittedAt}</p>
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-2 md:mt-0 mt-2">
                        {prescription.status === 'pending' && (
                          <>
                            <Button size="sm" onClick={() => setViewingPrescription(prescription)} disabled={isUpdating}>Accept</Button>
                          </>
                        )}
                        {prescription.status === 'verified' && (
                          <Button size="sm" onClick={() => handleUpdateStatus(prescription.id, 'READY')} disabled={isUpdating}>Mark Ready</Button>
                        )}
                        {prescription.status === 'ready' && (
                          <Button size="sm" onClick={() => handleUpdateStatus(prescription.id, 'DISPENSED')} disabled={isUpdating}>Dispense</Button>
                        )}
                        {prescription.status === 'dispensed' && (
                          <Button variant="outline" size="sm" onClick={() => setPrintingPrescription(prescription)}>Generate Receipt</Button>
                        )}
                        {prescription.status === 'rejected' && (
                          <Badge variant="destructive">Rejected</Badge>
                        )}
                      </div>
                    </div>
                  ))}
                  {filteredPrescriptions.length === 0 && (
                      <p className="text-center text-gray-500 py-4">No prescriptions found matching your criteria.</p>
                  )}
                </div>
              </CardContent>
            </Card>

            <PrescriptionReceipt 
                prescription={printingPrescription}
                isOpen={!!printingPrescription}
                onClose={() => setPrintingPrescription(null)}
            />

            <PrescriptionDetailsModal
                prescription={viewingPrescription}
                isOpen={!!viewingPrescription}
                onClose={() => setViewingPrescription(null)}
                onAccept={handleUpdateStatus}
                isUpdating={isUpdating}
            />
          </TabsContent>

          {/* Inventory Tab */}
          <TabsContent value="inventory" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-semibold">Inventory Management</h2>
              <div className="flex gap-2">
                <div className="relative">
                  <Search className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <Input 
                      placeholder="Search medications..." 
                      className="pl-9" 
                      value={inventorySearch}
                      onChange={(e) => setInventorySearch(e.target.value)}
                  />
                </div>
                <Button onClick={() => { setEditingMedicine(null); setIsMedicineFormOpen(true); }}>
                    Add/Edit Medicine
                </Button>
              </div>
            </div>

            <InventoryTable 
                items={inventoryItems} 
                onEditMedicine={(med) => { setEditingMedicine(med); setIsMedicineFormOpen(true); }}
                onReceiveStock={(med) => { setReceivingMedicine(med); setIsReceiveStockOpen(true); }}
            />

            <MedicineFormModal 
                isOpen={isMedicineFormOpen}
                onClose={() => setIsMedicineFormOpen(false)}
                editingMedicine={editingMedicine}
                onSuccess={() => {
                    const reload = async() => {
                        try {
                           const res = await getInventory(1, 1000, inventorySearch);
                           setInventoryItems(Array.isArray(res) ? res : []);
                        } catch(e){}
                    };
                    reload();
                }}
            />

            <ReceiveStockModal 
                isOpen={isReceiveStockOpen}
                onClose={() => setIsReceiveStockOpen(false)}
                medicine={receivingMedicine}
                onSuccess={() => {
                     const reload = async() => {
                        try {
                           const res = await getInventory(1, 1000, inventorySearch);
                           setInventoryItems(res.data);
                        } catch(e){}
                    };
                    reload();
                }}
            />
          </TabsContent>

          {/* Alerts Tab */}
          <TabsContent value="alerts" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-semibold">Stock Alerts</h2>
              <Button 
                onClick={fetchAlertsData} 
                disabled={isRefreshingAlerts}
              >
                  {isRefreshingAlerts ? 'Refreshing...' : 'Refresh Alerts'}
              </Button>
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
                            <p className="text-xs text-gray-500">Supplier: {batch.supplier}</p>
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
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Customer Pickup Queue</CardTitle>
                <CardDescription>Prescriptions that have been verified, filled, and are ready for handover</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {readyForPickup.length === 0 ? <p className="text-gray-500 text-sm">No prescriptions currently waiting for pickup.</p> : 
                  readyForPickup.map((pickup: any) => (
                    <div key={pickup.id} className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 border rounded-lg gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-medium text-lg">{pickup.patient}</h3>
                          <Badge variant="secondary">Ready</Badge>
                        </div>
                        <p className="font-medium text-blue-600">{pickup.medication}</p>
                        <p className="text-sm text-gray-500">Prepared: {pickup.preparedAt}</p>
                      </div>
                      <div className="flex gap-2">
                        <Button size="sm" onClick={() => handleDispenseWithUndo(pickup.id)} disabled={isUpdating}>
                            Mark as Picked Up
                        </Button>
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