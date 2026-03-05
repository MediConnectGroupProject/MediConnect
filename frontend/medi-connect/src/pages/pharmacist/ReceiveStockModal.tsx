import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../../components/ui/dialog';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { addBatch, getSuppliers } from '../../api/pharmacistApi';
import toast from 'react-hot-toast';

interface Medicine {
    medicineId: string;
    name: string;
    stock: number;
}

interface Supplier {
    supplierId: string;
    name: string;
}

interface ReceiveStockModalProps {
    isOpen: boolean;
    onClose: () => void;
    medicine: Medicine | null;
    onSuccess: () => void;
}

export function ReceiveStockModal({ isOpen, onClose, medicine, onSuccess }: ReceiveStockModalProps) {
    const [isLoading, setIsLoading] = useState(false);
    const [suppliers, setSuppliers] = useState<Supplier[]>([]);
    
    const [formData, setFormData] = useState({
        supplierId: '',
        batchNumber: '',
        quantity: '',
        costPrice: '',
        manufacturedDate: '',
        expiryDate: ''
    });

    useEffect(() => {
        if (isOpen) {
            setFormData({
                supplierId: '',
                batchNumber: '',
                quantity: '',
                costPrice: '',
                manufacturedDate: '',
                expiryDate: ''
            });
            fetchSuppliers();
        }
    }, [isOpen]);

    const fetchSuppliers = async () => {
        try {
            const data = await getSuppliers();
            setSuppliers(data);
        } catch (error) {
            toast.error('Failed to load suppliers');
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!medicine) return;

        if (!formData.supplierId || !formData.batchNumber || !formData.quantity || !formData.expiryDate) {
            toast.error("Please fill in all required fields");
            return;
        }

        setIsLoading(true);
        const payload = {
            medicineId: medicine.medicineId,
            supplierId: formData.supplierId,
            batchNumber: formData.batchNumber,
            quantity: parseInt(formData.quantity),
            costPrice: formData.costPrice ? parseFloat(formData.costPrice) : undefined,
            manufacturedDate: formData.manufacturedDate ? new Date(formData.manufacturedDate).toISOString() : undefined,
            expiryDate: new Date(formData.expiryDate).toISOString(),
        };

        try {
            await addBatch(payload);
            toast.success(`Successfully added ${payload.quantity} units to ${medicine.name}`);
            onSuccess();
            onClose();
        } catch (error: any) {
            toast.error(error.message || 'Failed to receive stock');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>Receive New Stock: <span className="text-blue-600">{medicine?.name}</span></DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4 py-4">

                    <div className="space-y-2">
                        <Label>Supplier <span className="text-red-500">*</span></Label>
                        <Select 
                            value={formData.supplierId} 
                            onValueChange={(val) => setFormData({...formData, supplierId: val})}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Select Supplier" />
                            </SelectTrigger>
                            <SelectContent>
                                {suppliers.map((sup) => (
                                    <SelectItem key={sup.supplierId} value={sup.supplierId}>{sup.name}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="batchNumber">Batch Number <span className="text-red-500">*</span></Label>
                            <Input 
                                id="batchNumber" 
                                placeholder="e.g. BT-202" 
                                value={formData.batchNumber}
                                onChange={(e) => setFormData({...formData, batchNumber: e.target.value})}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="quantity">Quantity Received <span className="text-red-500">*</span></Label>
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
                            <Label htmlFor="manufacturedDate">Manufactured Date</Label>
                            <Input 
                                id="manufacturedDate" 
                                type="date"
                                value={formData.manufacturedDate}
                                onChange={(e) => setFormData({...formData, manufacturedDate: e.target.value})}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="expiryDate">Expiry Date <span className="text-red-500">*</span></Label>
                            <Input 
                                id="expiryDate" 
                                type="date"
                                value={formData.expiryDate}
                                onChange={(e) => setFormData({...formData, expiryDate: e.target.value})}
                            />
                        </div>
                    </div>
                    
                    <div className="space-y-2 w-1/2 pr-2">
                        <Label htmlFor="costPrice">Unit Cost Price ($)</Label>
                        <Input 
                            id="costPrice" 
                            type="number"
                            step="0.01"
                            min="0" 
                            placeholder="0.00" 
                            value={formData.costPrice}
                            onChange={(e) => setFormData({...formData, costPrice: e.target.value})}
                        />
                        <p className="text-xs text-gray-500">Wholesale cost per unit, for accounting.</p>
                    </div>

                    <div className="pt-4 flex justify-end gap-2 border-t">
                        <Button type="button" variant="outline" onClick={onClose} disabled={isLoading}>Cancel</Button>
                        <Button type="submit" className="bg-blue-600 hover:bg-blue-700" disabled={isLoading}>
                            {isLoading ? 'Processing...' : 'Confirm Stock Receipt'}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}
