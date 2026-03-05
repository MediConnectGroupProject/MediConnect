import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Input } from '../../components/ui/input';
import { Search, Plus, Star, Edit, Building2 } from 'lucide-react';
import { useAllSuppliers, useAddSupplier, useUpdateSupplier, useUpdateSupplierStatus } from '../../hooks/adminUsersHook';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '../../components/ui/dialog';
import { Switch } from '../../components/ui/switch';
import { Spinner } from '../../components/ui/spinner';
import { Label } from '../../components/ui/label';

export function SupplierTab() {
    const { data: suppliersRes, isLoading, error } = useAllSuppliers();
    const suppliers = suppliersRes?.data || suppliersRes || [];
    
    const [searchTerm, setSearchTerm] = useState('');
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [selectedSupplier, setSelectedSupplier] = useState<any>(null);

    // Form State
    const [formData, setFormData] = useState({
        name: '',
        contactPerson: '',
        email: '',
        phone: '',
        address: '',
        licenseNumber: '',
        rating: '',
        notes: ''
    });

    const addSupplierMutation = useAddSupplier();
    const updateSupplierMutation = useUpdateSupplier();
    const toggleStatusMutation = useUpdateSupplierStatus();

    const filteredSuppliers = suppliers.filter((s: any) => 
        s.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
        (s.contactPerson && s.contactPerson.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (s.phone && s.phone.includes(searchTerm))
    );

    const handleAddSubmit = () => {
        addSupplierMutation.mutate(formData, {
            onSuccess: () => {
                setIsAddModalOpen(false);
                setFormData({ name: '', contactPerson: '', email: '', phone: '', address: '', licenseNumber: '', rating: '', notes: '' });
            }
        });
    };

    const openEditModal = (supplier: any) => {
        setSelectedSupplier(supplier);
        setFormData({
            name: supplier.name,
            contactPerson: supplier.contactPerson || '',
            email: supplier.email || '',
            phone: supplier.phone || '',
            address: supplier.address || '',
            licenseNumber: supplier.licenseNumber || '',
            rating: supplier.rating ? supplier.rating.toString() : '',
            notes: supplier.notes || ''
        });
        setIsEditModalOpen(true);
    };

    const handleEditSubmit = () => {
        updateSupplierMutation.mutate({
            id: selectedSupplier.id,
            updateData: formData
        }, {
            onSuccess: () => setIsEditModalOpen(false)
        });
    };

    const renderStars = (rating: number | null) => {
        if (!rating) return <span className="text-gray-400 text-xs">Not rated</span>;
        return (
            <div className="flex">
                {[1, 2, 3, 4, 5].map((star) => (
                    <Star key={star} className={`h-3 w-3 ${star <= rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`} />
                ))}
            </div>
        );
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-semibold">Supply Chain Management</h2>
                <div className="flex gap-4">
                    <div className="relative">
                        <Search className="h-4 w-4 absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                        <Input 
                            placeholder="Search suppliers..." 
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pr-9"
                        />
                    </div>
                    <Button onClick={() => {
                        setFormData({ name: '', contactPerson: '', email: '', phone: '', address: '', licenseNumber: '', rating: '', notes: '' });
                        setIsAddModalOpen(true);
                    }}>
                        <Plus className="h-4 w-4 mr-2" /> Add Supplier
                    </Button>
                </div>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Authorized Vendors</CardTitle>
                    <CardDescription>Manage your network of pharmaceutical and medical equipment suppliers</CardDescription>
                </CardHeader>
                <CardContent>
                    {isLoading ? (
                        <div className="py-8 flex justify-center"><Spinner /></div>
                    ) : error ? (
                        <div className="text-red-500 text-center py-4">Failed to load suppliers {(error as Error).message}</div>
                    ) : (
                        <div className="space-y-4 max-h-[600px] overflow-y-auto">
                            {filteredSuppliers.map((supplier: any) => (
                                <div key={supplier.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                                    <div className="flex items-start gap-4 flex-1">
                                        <div className="mt-1 h-10 w-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-600">
                                            <Building2 className="h-5 w-5" />
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-2 mb-1">
                                                <h3 className="font-semibold">{supplier.name}</h3>
                                                <Badge variant={supplier.isActive ? 'secondary' : 'destructive'} className={supplier.isActive ? 'bg-green-100 text-green-800' : ''}>
                                                    {supplier.isActive ? 'Active' : 'Inactive'}
                                                </Badge>
                                            </div>
                                            <div className="grid grid-cols-2 md:grid-cols-4 gap-x-8 gap-y-1 mt-2 text-sm text-gray-600">
                                                <div><span className="text-gray-400">Contact:</span> {supplier.contactPerson || 'N/A'}</div>
                                                <div><span className="text-gray-400">Phone:</span> {supplier.phone || 'N/A'}</div>
                                                <div><span className="text-gray-400">License:</span> {supplier.licenseNumber || 'N/A'}</div>
                                                <div className="flex items-center gap-2 pr-4">{renderStars(supplier.rating)}</div>
                                            </div>
                                            {supplier.notes && (
                                                <p className="text-xs text-gray-500 mt-2 bg-gray-100 p-2 rounded line-clamp-2">
                                                    {supplier.notes}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                    
                                    <div className="flex flex-col items-end gap-3 border-l pl-4 ml-4">
                                        <div className="flex items-center gap-2">
                                            <Label htmlFor={`status-${supplier.id}`} className="text-xs text-gray-500">
                                                {supplier.isActive ? 'Active' : 'Disabled'}
                                            </Label>
                                            <Switch 
                                                id={`status-${supplier.id}`}
                                                checked={supplier.isActive}
                                                disabled={toggleStatusMutation.isPending}
                                                onCheckedChange={(c) => toggleStatusMutation.mutate({ id: supplier.id, isActive: c })}
                                            />
                                        </div>
                                        <Button variant="outline" size="sm" onClick={() => openEditModal(supplier)}>
                                            <Edit className="h-3 w-3 mr-2" /> Edit
                                        </Button>
                                    </div>
                                </div>
                            ))}
                            {filteredSuppliers.length === 0 && (
                                <p className="text-center text-gray-500 py-8">No suppliers found.</p>
                            )}
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Add/Edit Modal */}
            <Dialog open={isAddModalOpen || isEditModalOpen} onOpenChange={(open) => {
                if (!open) {
                    setIsAddModalOpen(false);
                    setIsEditModalOpen(false);
                }
            }}>
                <DialogContent className="sm:max-w-[600px]">
                    <DialogHeader>
                        <DialogTitle>{isEditModalOpen ? 'Edit Supplier Details' : 'Register New Supplier'}</DialogTitle>
                        <DialogDescription>
                            {isEditModalOpen ? 'Update supplier information and tracking metrics.' : 'Add a new authorized vendor to the hospital network.'}
                        </DialogDescription>
                    </DialogHeader>
                    
                    <div className="grid grid-cols-2 gap-4 py-4">
                        <div className="space-y-2 col-span-2">
                            <Label>Company / Supplier Name *</Label>
                            <Input 
                                value={formData.name} 
                                onChange={e => setFormData({...formData, name: e.target.value})} 
                                placeholder="e.g. PharmaCorp Global"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Diagnostic/Pharma License No.</Label>
                            <Input 
                                value={formData.licenseNumber} 
                                onChange={e => setFormData({...formData, licenseNumber: e.target.value})} 
                                placeholder="Reg Number"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Contact Person</Label>
                            <Input 
                                value={formData.contactPerson} 
                                onChange={e => setFormData({...formData, contactPerson: e.target.value})} 
                                placeholder="Account Manager name"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Phone Number</Label>
                            <Input 
                                value={formData.phone} 
                                onChange={e => setFormData({...formData, phone: e.target.value})} 
                                placeholder="+1 234 567 890"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Email</Label>
                            <Input 
                                type="email"
                                value={formData.email} 
                                onChange={e => setFormData({...formData, email: e.target.value})} 
                                placeholder="orders@vendor.com"
                            />
                        </div>
                        <div className="space-y-2 col-span-2">
                            <Label>Billing / Shipping Address</Label>
                            <Input 
                                value={formData.address} 
                                onChange={e => setFormData({...formData, address: e.target.value})} 
                                placeholder="123 Industrial Park..."
                            />
                        </div>
                        
                        {/* Supply Chain Specific Metrics */}
                        <div className="space-y-2 col-span-2 mt-4 border-t pt-4">
                            <h4 className="font-medium text-sm text-gray-700">Performance & Contracts</h4>
                        </div>
                        <div className="space-y-2">
                            <Label>Internal Rating (1-5)</Label>
                            <select 
                                className="flex h-10 w-full rounded-md border border-input bg-white px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                value={formData.rating}
                                onChange={e => setFormData({...formData, rating: e.target.value})}
                            >
                                <option value="">Not Rated</option>
                                <option value="1">1 Star (Poor)</option>
                                <option value="2">2 Stars</option>
                                <option value="3">3 Stars (Average)</option>
                                <option value="4">4 Stars</option>
                                <option value="5">5 Stars (Excellent)</option>
                            </select>
                        </div>
                        <div className="space-y-2 col-span-2">
                            <Label>Contract Notes / SLA Agreements</Label>
                            <Input 
                                value={formData.notes} 
                                onChange={e => setFormData({...formData, notes: e.target.value})} 
                                placeholder="e.g. Net-30 payment terms, 2-day delivery SLA"
                            />
                        </div>
                    </div>

                    <DialogFooter>
                        <Button variant="outline" onClick={() => {
                            setIsAddModalOpen(false);
                            setIsEditModalOpen(false);
                        }}>Cancel</Button>
                        <Button 
                            onClick={isEditModalOpen ? handleEditSubmit : handleAddSubmit}
                            disabled={!formData.name || addSupplierMutation.isPending || updateSupplierMutation.isPending}
                        >
                            {isEditModalOpen ? 'Save Changes' : 'Register Supplier'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
