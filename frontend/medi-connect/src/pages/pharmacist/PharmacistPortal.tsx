import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Label } from '../../components/ui/label';
import { Badge } from '../../components/ui/badge';
import { Input } from '../../components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { QrCode, Package, AlertTriangle, DollarSign, Scan, Home, LogOut, Search } from 'lucide-react';
import { Separator } from '../../components/ui/separator';

import { useNavigate } from 'react-router-dom';
import { RouteNames } from '../../utils/RouteNames';
import { useAuth } from '../../utils/authContext';

export function PharmacistPortal() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const [activeTab, setActiveTab] = useState('prescriptions');
  
  const onLogout = () => {
    logout();
    navigate(RouteNames.LOGIN);
  };



  const prescriptionRequests = [
    { id: 1, patient: 'John Smith', doctor: 'Dr. Sarah Johnson', medication: 'Lisinopril 10mg', quantity: '30 tablets', status: 'pending', qrCode: 'QR123456', submittedAt: '2024-01-15 09:30' },
    { id: 2, patient: 'Mary Johnson', doctor: 'Dr. Mike Chen', medication: 'Amoxicillin 500mg', quantity: '21 capsules', status: 'verified', qrCode: 'QR123457', submittedAt: '2024-01-15 08:45' },
    { id: 3, patient: 'Robert Davis', doctor: 'Dr. Emily Davis', medication: 'Metformin 500mg', quantity: '60 tablets', status: 'ready', qrCode: 'QR123458', submittedAt: '2024-01-14 16:20' },
    { id: 4, patient: 'Sarah Wilson', doctor: 'Dr. Sarah Johnson', medication: 'Ibuprofen 400mg', quantity: '20 tablets', status: 'dispensed', qrCode: 'QR123459', submittedAt: '2024-01-14 14:15' }
  ];

  const lowStockAlerts = [
    { id: 1, medication: 'Lisinopril 10mg', currentStock: 15, minThreshold: 20, supplier: 'PharmaCorp', lastOrdered: '2024-01-10', severity: 'medium' },
    { id: 2, medication: 'Insulin Glargine', currentStock: 3, minThreshold: 10, supplier: 'MediSupply', lastOrdered: '2024-01-08', severity: 'high' },
    { id: 3, medication: 'Amoxicillin 500mg', currentStock: 8, minThreshold: 25, supplier: 'PharmaCorp', lastOrdered: '2024-01-12', severity: 'high' },
    { id: 4, medication: 'Aspirin 81mg', currentStock: 45, minThreshold: 50, supplier: 'Generic Plus', lastOrdered: '2024-01-05', severity: 'low' }
  ];

  const readyForPickup = [
    { id: 1, patient: 'Robert Davis', medication: 'Metformin 500mg', preparedAt: '2024-01-15 10:30', notified: true, amount: '$25.50' },
    { id: 2, patient: 'Lisa Brown', medication: 'Lipitor 20mg', preparedAt: '2024-01-15 09:15', notified: true, amount: '$45.20' },
    { id: 3, patient: 'Michael Wilson', medication: 'Omeprazole 40mg', preparedAt: '2024-01-14 17:45', notified: false, amount: '$18.75' }
  ];

  const inventory = [
    { id: 1, medication: 'Lisinopril 10mg', category: 'ACE Inhibitor', stock: 150, price: '$12.50', expiryDate: '2025-06-15' },
    { id: 2, medication: 'Metformin 500mg', category: 'Antidiabetic', stock: 200, price: '$8.25', expiryDate: '2025-03-20' },
    { id: 3, medication: 'Amoxicillin 500mg', category: 'Antibiotic', stock: 75, price: '$15.75', expiryDate: '2024-12-10' },
    { id: 4, medication: 'Ibuprofen 400mg', category: 'NSAID', stock: 300, price: '$6.50', expiryDate: '2025-09-30' }
  ];

  const dailySales = [
    { id: 1, time: '09:15', customer: 'Robert Davis', items: 'Metformin 500mg', amount: '$25.50', paymentMethod: 'Credit Card' },
    { id: 2, time: '10:30', customer: 'Lisa Brown', items: 'Lipitor 20mg, Vitamins', amount: '$52.75', paymentMethod: 'Cash' },
    { id: 3, time: '11:45', customer: 'John Smith', items: 'Aspirin 81mg', amount: '$8.25', paymentMethod: 'Insurance' },
    { id: 4, time: '14:20', customer: 'Sarah Wilson', items: 'Ibuprofen 400mg, Bandages', amount: '$18.90', paymentMethod: 'Debit Card' }
  ];

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
                  {inventory.map((item) => (
                    <div key={item.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-medium">{item.medication}</h3>
                          <Badge variant="outline">{item.category}</Badge>
                          {item.stock < 50 && (
                            <Badge variant="destructive">Low Stock</Badge>
                          )}
                        </div>
                        <p className="text-sm text-gray-600">Stock: {item.stock} units • Price: {item.price}</p>
                        <p className="text-sm text-gray-500">Expires: {item.expiryDate}</p>
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
                    <div className="text-2xl font-bold text-green-600">$2,340</div>
                    <p className="text-sm text-gray-500">↑ 12% from yesterday</p>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm">Transactions</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">47</div>
                    <p className="text-sm text-gray-500">5 pending</p>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm">Average Sale</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">$49.78</div>
                    <p className="text-sm text-gray-500">↑ 8% this week</p>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm">Payment Methods</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-1">
                      <div className="text-sm">Card: 65%</div>
                      <div className="text-sm">Cash: 25%</div>
                      <div className="text-sm">Insurance: 10%</div>
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