import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../../components/ui/dialog';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { addMedicine, updateMedicine, getCategory, getDosage, getSuppliers } from '../../api/pharmacistApi';
import toast from 'react-hot-toast';

interface Medicine {
    medicineId?: string;
    name: string;
    description?: string;
    categoryId: string;
    dosageId: string;
    price: number;
}

interface MedicineFormModalProps {
    isOpen: boolean;
    onClose: () => void;
    editingMedicine?: Medicine | null;
    onSuccess: () => void;
}

export function MedicineFormModal({ isOpen, onClose, editingMedicine, onSuccess }: MedicineFormModalProps) {
    const [isLoading, setIsLoading] = useState(false);
    const [categories, setCategories] = useState<any[]>([]);
    const [dosages, setDosages] = useState<any[]>([]);
    const [suppliers, setSuppliers] = useState<any[]>([]);
    
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        categoryId: '',
        dosageId: '',
        price: '',
        // Initial Stock Fields
        supplierId: '',
        batchNumber: '',
        quantity: '',
        costPrice: '',
        manufacturedDate: '',
        expiryDate: ''
    });

    useEffect(() => {
        if (isOpen) {
            fetchDropdownData();
            if (editingMedicine) {
                setFormData({
                    name: editingMedicine.name || '',
                    description: editingMedicine.description || '',
                    categoryId: editingMedicine.categoryId || '',
                    dosageId: editingMedicine.dosageId || '',
                    price: editingMedicine.price ? editingMedicine.price.toString() : '',
                    supplierId: '', batchNumber: '', quantity: '', costPrice: '', manufacturedDate: '', expiryDate: ''
                });
            } else {
                setFormData({
                    name: '', description: '', categoryId: '', dosageId: '', price: '',
                    supplierId: '', batchNumber: '', quantity: '', costPrice: '', manufacturedDate: '', expiryDate: ''
                });
            }
        }
    }, [isOpen, editingMedicine]);

    const fetchDropdownData = async () => {
        try {
            const [cats, dosgs, sups] = await Promise.all([
                getCategory(),
                getDosage(),
                getSuppliers()
            ]);
            setCategories(cats);
            setDosages(dosgs);
            setSuppliers(sups);
        } catch (error) {
            toast.error('Failed to load categories or dosages');
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!formData.name || !formData.categoryId || !formData.dosageId || !formData.price || isNaN(parseFloat(formData.price))) {
            toast.error("Please fill in all required fields accurately.");
            return;
        }

        if (!editingMedicine) {
            // Optional batch info. But if they fill ANY of it, we should validate the critical ones.
            const hasBatchInfo = formData.batchNumber || formData.quantity || formData.expiryDate;
            if (hasBatchInfo && (!formData.batchNumber || !formData.quantity || !formData.expiryDate)) {
                toast.error("Batch Number, Quantity, and Expiry Date are required to log initial stock.");
                return;
            }
        }

        setIsLoading(true);
        const payload: any = {
            name: formData.name,
            description: formData.description,
            categoryId: parseInt(formData.categoryId),
            dosageId: parseInt(formData.dosageId),
            price: parseFloat(formData.price)
        };

        if (!editingMedicine && formData.batchNumber && formData.quantity && formData.expiryDate) {
            payload.supplierId = formData.supplierId || undefined;
            payload.batchNumber = formData.batchNumber;
            payload.quantity = parseInt(formData.quantity);
            if (formData.costPrice) payload.costPrice = parseFloat(formData.costPrice);
            if (formData.manufacturedDate) payload.manufacturedDate = new Date(formData.manufacturedDate).toISOString();
            payload.expiryDate = new Date(formData.expiryDate).toISOString();
        }

        try {
            if (editingMedicine?.medicineId) {
                await updateMedicine(editingMedicine.medicineId, payload);
                toast.success('Medicine updated successfully');
            } else {
                await addMedicine(payload);
                toast.success('Medicine added successfully');
            }
            onSuccess();
            onClose();
        } catch (error: any) {
            toast.error(error.message || 'Failed to save medicine');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>{editingMedicine ? 'Edit Medicine Profile' : 'Register New Medicine'}</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4 py-4">
                    <div className="space-y-2">
                        <Label htmlFor="name">Medicine Name <span className="text-red-500">*</span></Label>
                        <Input 
                            id="name" 
                            placeholder="e.g. Paracetamol" 
                            value={formData.name}
                            onChange={(e) => setFormData({...formData, name: e.target.value})}
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>Category <span className="text-red-500">*</span></Label>
                            <Select 
                                value={formData.categoryId} 
                                onValueChange={(val) => setFormData({...formData, categoryId: val})}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select Category" />
                                </SelectTrigger>
                                <SelectContent>
                                    {categories.map((cat) => (
                                        <SelectItem key={cat.categoryId} value={cat.categoryId}>{cat.name}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label>Dosage Form <span className="text-red-500">*</span></Label>
                            <Select 
                                value={formData.dosageId} 
                                onValueChange={(val) => setFormData({...formData, dosageId: val})}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select Dosage" />
                                </SelectTrigger>
                                <SelectContent>
                                    {dosages.map((dos) => (
                                        <SelectItem key={dos.dosageId} value={dos.dosageId}>{dos.name}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="price">Base Unit Price ($) <span className="text-red-500">*</span></Label>
                            <Input 
                                id="price" 
                                type="number" 
                                step="0.01" 
                                min="0" 
                                placeholder="0.00"
                                value={formData.price}
                                onChange={(e) => setFormData({...formData, price: e.target.value})}
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="description">Internal Description / Notes</Label>
                        <Input 
                            id="description" 
                            placeholder="Optional notes about this drug..." 
                            value={formData.description}
                            onChange={(e) => setFormData({...formData, description: e.target.value})}
                        />
                    </div>

                    {!editingMedicine && (
                        <div className="pt-2 pb-2 mt-4 border-t">
                            <h3 className="text-sm font-semibold text-gray-700 mb-3">Initial Stock Entry (Optional)</h3>
                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <Label>Supplier</Label>
                                    <Select 
                                        value={formData.supplierId} 
                                        onValueChange={(val) => setFormData({...formData, supplierId: val})}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select Supplier" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {suppliers.map((sup) => (
                                                <SelectItem key={sup.supplierId || sup.id} value={sup.supplierId || sup.id}>{sup.name}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="batchNumber">Batch Number</Label>
                                        <Input 
                                            id="batchNumber" 
                                            placeholder="e.g. BT-001" 
                                            value={formData.batchNumber}
                                            onChange={(e) => setFormData({...formData, batchNumber: e.target.value})}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="quantity">Quantity Received</Label>
                                        <Input 
                                            id="quantity" 
                                            type="number"
                                            min="1" 
                                            placeholder="0" 
                                            value={formData.quantity}
                                            onChange={(e) => setFormData({...formData, quantity: e.target.value})}
                                        />
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label>Cost Price ($)</Label>
                                        <Input 
                                            type="number"
                                            step="0.01"
                                            min="0"
                                            placeholder="0.00"
                                            value={formData.costPrice}
                                            onChange={(e) => setFormData({...formData, costPrice: e.target.value})}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Expiry Date</Label>
                                        <Input 
                                            type="date"
                                            value={formData.expiryDate}
                                            onChange={(e) => setFormData({...formData, expiryDate: e.target.value})}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    <div className="pt-4 flex justify-end gap-2 border-t">
                        <Button type="button" variant="outline" onClick={onClose} disabled={isLoading}>Cancel</Button>
                        <Button type="submit" disabled={isLoading}>
                            {isLoading ? 'Saving...' : editingMedicine ? 'Update Medicine' : 'Register Medicine'}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}
