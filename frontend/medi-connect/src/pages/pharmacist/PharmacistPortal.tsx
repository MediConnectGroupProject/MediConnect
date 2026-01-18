import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Input } from '../../components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { QrCode, AlertTriangle, Scan, Home, LogOut, Search } from 'lucide-react';
import { Separator } from '../../components/ui/separator';
import { useNavigate } from 'react-router-dom';
import { RouteNames } from '../../utils/RouteNames';
import { useAuth } from '../../utils/authContext';
import { getPrescriptionQueue, getInventory } from '../../api/pharmacistApi';

export function PharmacistPortal() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const [activeTab, setActiveTab] = useState('prescriptions');
  const [prescriptionQueue, setPrescriptionQueue] = useState<any[]>([]);
  const [inventoryItems, setInventoryItems] = useState<any[]>([]);

  const onLogout = () => {
    logout();
    navigate(RouteNames.LOGIN);
  };

  useEffect(() => {
    const fetchPharmacistData = async () => {
        try {
            const queue = await getPrescriptionQueue();
            setPrescriptionQueue(queue);

            const inv = await getInventory();
            setInventoryItems(inv);
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

  // Derive alerts from real inventory
  const lowStockAlerts = inventoryItems
      .filter((i: any) => i.stock < 50) 
      .map((i: any) => ({
          id: i.medicineId,
          medication: i.name,
          currentStock: i.stock,
          minThreshold: 50,
          supplier: 'PharmaCorp', 
          lastOrdered: 'N/A', 
          severity: i.stock < 20 ? 'high' : 'medium'
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
    const dailySales: any[] = [];


  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-4">
            <Button variant="outline" onClick={() => navigate(`${RouteNames.DASHBOARD}/pharmacist`)}>
              <Home className="h-4 w-4 mr-2" />
              Dashboard
            </Button>
            <Separator orientation="vertical" className="h-6" />
            <h1 className="text-xl font-semibold">Pharmacist Portal</h1>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-600">{user?.name}</span>
            <Badge variant="secondary">Pharmacist</Badge>
            <Button variant="ghost" size="sm" onClick={onLogout}>
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

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
                  {prescriptionRequests.map((prescription) => (
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
              <Button>Configure Alert Settings</Button>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Low Stock Alerts</CardTitle>
                <CardDescription>Medications that need to be reordered</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {lowStockAlerts.map((alert) => (
                    <div key={alert.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-4">
                        <AlertTriangle className={`h-6 w-6 ${
                          alert.severity === 'high' ? 'text-red-500' :
                          alert.severity === 'medium' ? 'text-yellow-500' : 'text-orange-500'
                        }`} />
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-medium">{alert.medication}</h3>
                            <Badge variant={
                              alert.severity === 'high' ? 'destructive' :
                              alert.severity === 'medium' ? 'default' : 'secondary'
                            }>
                              {alert.severity} priority
                            </Badge>
                          </div>
                          <p className="text-sm text-gray-600">
                            Current: {alert.currentStock} units • Minimum: {alert.minThreshold} units
                          </p>
                          <p className="text-sm text-gray-500">
                            Supplier: {alert.supplier} • Last ordered: {alert.lastOrdered}
                          </p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm">Contact Supplier</Button>
                        <Button size="sm">Place Order</Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
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
                  {readyForPickup.map((pickup) => (
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
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-semibold">Point of Sale</h2>
              <div className="flex gap-2">
                <Button variant="outline">Generate Receipt</Button>
                <Button>New Sale</Button>
              </div>
            </div>

            <div className="grid gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Today's Sales</CardTitle>
                  <CardDescription>Process orders and billing</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {dailySales.map((sale) => (
                      <div key={sale.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-medium">{sale.customer}</h3>
                            <Badge variant="outline">{sale.paymentMethod}</Badge>
                          </div>
                          <p className="text-sm text-gray-600">{sale.items}</p>
                          <p className="text-sm text-gray-500">Time: {sale.time}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-medium text-green-600">{sale.amount}</p>
                          <Button variant="outline" size="sm" className="mt-2">Print Receipt</Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <div className="grid grid-cols-4 gap-4">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm">Today's Revenue</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-green-600">$0.00</div>
                    <p className="text-sm text-gray-500">No data</p>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm">Transactions</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">0</div>
                    <p className="text-sm text-gray-500">0 pending</p>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm">Average Sale</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">$0.00</div>
                    <p className="text-sm text-gray-500">No data</p>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm">Payment Methods</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-1">
                      <div className="text-sm">No transactions today</div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}