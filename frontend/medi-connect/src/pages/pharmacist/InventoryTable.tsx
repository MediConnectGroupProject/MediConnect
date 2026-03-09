import React from 'react';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import { Card } from '../../components/ui/card';
import { PackageOpen, AlertTriangle, AlertCircle, PlusCircle, Pencil } from 'lucide-react';

interface Medicine {
    medicineId: string;
    name: string;
    brand?: string;
    strength?: string;
    category?: string | { name: string };
    dosage?: string | { name: string };
    price: number;
    stock: number;
    supplierName?: string;
    batches?: any[];
}

interface InventoryTableProps {
    items: Medicine[];
    onEditMedicine: (medicine: Medicine) => void;
    onReceiveStock: (medicine: Medicine) => void;
}

export const InventoryTable: React.FC<InventoryTableProps> = ({ items, onEditMedicine, onReceiveStock }) => {

    const getStockStatus = (stock: number) => {
        if (stock <= 0) return <Badge variant="destructive" className="flex items-center gap-1"><AlertCircle className="w-3 h-3"/> Out of Stock</Badge>;
        if (stock < 50) return <Badge variant="outline" className="text-orange-600 border-orange-200 bg-orange-50 flex items-center gap-1"><AlertTriangle className="w-3 h-3"/> Low Stock</Badge>;
        return <Badge variant="secondary" className="bg-green-50 text-green-700 hover:bg-green-100">Healthy</Badge>;
    };

    return (
        <Card className="shadow-sm">
            <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                    <thead className="text-xs text-gray-500 uppercase bg-gray-50 border-b">
                        <tr>
                            <th className="px-6 py-4 font-medium">Medicine Name</th>
                            <th className="px-6 py-4 font-medium">Category / Dosage</th>
                            <th className="px-6 py-4 font-medium">Stock Status</th>
                            <th className="px-6 py-4 font-medium">Unit Price</th>
                            <th className="px-6 py-4 font-medium text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {items.length === 0 ? (
                            <tr>
                                <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                                    <PackageOpen className="mx-auto h-12 w-12 text-gray-300 mb-3" />
                                    No medicines found matching your criteria.
                                </td>
                            </tr>
                        ) : items.map((item) => (
                            <tr key={item.medicineId} className="bg-white hover:bg-gray-50/50 transition-colors">
                                <td className="px-6 py-4">
                                    <div className="font-semibold text-gray-900">
                                        {item.name} {item.strength && <span className="text-gray-500 font-normal ml-1">{item.strength}mg</span>}
                                    </div>
                                    <div className="flex flex-col mt-1 mb-1 gap-1">
                                        {item.brand && <div className="text-xs text-blue-600 font-medium whitespace-nowrap overflow-hidden text-ellipsis max-w-[200px]" title={item.brand}>Brand: {item.brand}</div>}
                                        {item.supplierName && <div className="text-xs text-purple-600 font-medium whitespace-nowrap overflow-hidden text-ellipsis max-w-[200px]" title={item.supplierName}>Supplier: {item.supplierName}</div>}
                                    </div>
                                    <div className="text-xs text-gray-500">ID: {item.medicineId.substring(0,8)}</div>
                                </td>
                                <td className="px-6 py-4">
                                    <div className="flex flex-col gap-1 items-start">
                                        <Badge variant="outline" className="font-normal text-xs">
                                            {typeof item.category === 'string' ? item.category : item.category?.name || 'Uncategorized'}
                                        </Badge>
                                        <span className="text-xs text-gray-500">
                                            {typeof item.dosage === 'string' ? item.dosage : item.dosage?.name || 'N/A'}
                                        </span>
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <div className="flex flex-col gap-1 items-start">
                                        {getStockStatus(item.stock)}
                                        <span className="text-xs font-medium text-gray-600 mt-1">{item.stock} Units Available</span>
                                    </div>
                                </td>
                                <td className="px-6 py-4 font-medium text-gray-900">
                                    ${Number(item.price).toFixed(2)}
                                </td>
                                <td className="px-6 py-4 text-right space-x-2">
                                    <Button 
                                        variant="outline" 
                                        size="sm" 
                                        className="text-blue-600 hover:text-blue-700 border-blue-200 hover:bg-blue-50"
                                        onClick={() => onReceiveStock(item)}
                                    >
                                        <PlusCircle className="w-4 h-4 mr-1" />
                                        Add Stock
                                    </Button>
                                    <Button 
                                        variant="ghost" 
                                        size="sm" 
                                        className="text-gray-600 hover:text-gray-900 bg-gray-100"
                                        onClick={() => onEditMedicine(item)}
                                        title="Edit Medicine Details"
                                    >
                                        <Pencil className="w-4 h-4" />
                                    </Button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </Card>
    );
}
