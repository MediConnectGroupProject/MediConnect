import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Input } from '../../components/ui/input';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Search, Eye } from 'lucide-react';
import { getInvoices } from '../../api/pharmacistApi';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../../components/ui/dialog';
import { Printer } from 'lucide-react';
import logo from '../../assets/logo-mediconnect.png';

export function InvoiceHistory() {
    const [invoices, setInvoices] = useState<any[]>([]);
    const [search, setSearch] = useState('');
    const [loading, setLoading] = useState(true);
    const [viewingReceipt, setViewingReceipt] = useState<any>(null);
    const receiptRef = React.useRef<HTMLDivElement>(null);

    useEffect(() => {
        const fetchInvoices = async () => {
            try {
                const data = await getInvoices();
                setInvoices(data);
            } catch (error) {
                console.error("Failed to fetch invoices", error);
            } finally {
                setLoading(false);
            }
        };
        fetchInvoices();
    }, []);

    const filteredInvoices = invoices.filter(inv =>
        inv.invoiceNumber.toLowerCase().includes(search.toLowerCase())
    );

    const handlePrint = () => {
        const printContent = receiptRef.current;
        if (!printContent) return;

        const originalContents = document.body.innerHTML;
        document.body.innerHTML = printContent.innerHTML;

        window.print();

        document.body.innerHTML = originalContents;
        window.location.reload(); 
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-semibold">Invoice History</h2>
            </div>
            <Card>
                <CardHeader>
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                        <div>
                            <CardTitle>Generated Invoices</CardTitle>
                            <CardDescription>View past transactions and reprint receipts</CardDescription>
                        </div>
                        <div className="relative w-full md:w-64">
                            <Search className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                            <Input 
                                placeholder="Search Invoice ID..." 
                                className="pl-9"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                            />
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    {loading ? (
                        <p className="text-center py-4 text-gray-500">Loading invoices...</p>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm text-left">
                                <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3">Invoice ID</th>
                                        <th className="px-6 py-3">Date & Time</th>
                                        <th className="px-6 py-3">Payment Info</th>
                                        <th className="px-6 py-3 text-right">Amount</th>
                                        <th className="px-6 py-3 text-right">Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredInvoices.map((inv) => (
                                        <tr key={inv.billId} className="bg-white border-b hover:bg-gray-50">
                                            <td className="px-6 py-4 font-medium text-gray-900">
                                                {inv.invoiceNumber}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                {new Date(inv.issuedDate).toLocaleString()}
                                            </td>
                                            <td className="px-6 py-4">
                                                <Badge variant="outline">{inv.description}</Badge>
                                            </td>
                                            <td className="px-6 py-4 text-right font-semibold">
                                                ${parseFloat(inv.amount).toFixed(2)}
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <Button size="sm" variant="outline" onClick={() => setViewingReceipt(inv)}>
                                                    <Eye className="w-4 h-4 mr-2" /> View
                                                </Button>
                                            </td>
                                        </tr>
                                    ))}
                                    {filteredInvoices.length === 0 && (
                                        <tr>
                                            <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                                                No invoices found matching "{search}"
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    )}
                </CardContent>
            </Card>

            <Dialog open={!!viewingReceipt} onOpenChange={(open) => !open && setViewingReceipt(null)}>
                <DialogContent className="sm:max-w-sm max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle className="text-center font-bold text-lg pb-1 border-b">Pharmacy Receipt</DialogTitle>
                    </DialogHeader>
                    {viewingReceipt && (
                    <div ref={receiptRef}>
                        <div id="receipt-print" className="space-y-3 text-xs font-mono border p-4 rounded-lg bg-white shadow-sm mt-1">
                            <div className="text-center flex flex-col items-center">
                                <img src={logo} alt="MediConnect Logo" className="h-8 w-auto mb-1 opacity-90" />
                                <h3 className="font-bold text-sm leading-tight text-black">MediConnect Pharmacy</h3>
                                <p className="text-black text-[10px]">123 Health Avenue, Med City</p>
                                <p className="text-black text-[10px]">Tel: +1 (555) 123-4567</p>
                            </div>
                            
                            <div className="flex justify-between border-b border-dashed border-gray-400 pb-1 mt-2 text-[10px] text-black">
                                <span>Invoice: {viewingReceipt.invoiceNumber}</span>
                                <span>{new Date(viewingReceipt.issuedDate).toLocaleString()}</span>
                            </div>

                            <div className="space-y-2 mt-4">
                                <div className="flex justify-between text-[10px] font-bold text-black border-b border-gray-400 pb-1">
                                    <span>ITEM</span>
                                    <span>PRICE</span>
                                </div>
                                {viewingReceipt.items.map((item: any, idx: number) => (
                                    <div key={idx} className="flex justify-between items-start text-[10px] border-b border-gray-200 last:border-0 pb-1 last:pb-0 text-black">
                                        <span className="w-3/4 pr-2 font-medium">{item.name} <span className="text-black">x{item.quantity}</span></span>
                                        <span className="w-1/4 text-right">${(parseFloat(item.unitPrice) * item.quantity).toFixed(2)}</span>
                                    </div>
                                ))}
                            </div>

                            <div className="border-t border-dashed border-gray-400 pt-2 mt-2 text-black">
                                <div className="flex justify-between items-center text-[10px] font-bold">
                                    <span>TOTAL:</span>
                                    <span className="text-xs">${parseFloat(viewingReceipt.amount).toFixed(2)}</span>
                                </div>
                            </div>
                            <div className="text-[10px] text-gray-500 uppercase mt-1 text-center">
                                {viewingReceipt.description}
                            </div>

                            <div className="text-center text-[10px] text-black pt-3 mt-2 border-t border-gray-200">
                                Thank you for your business!<br/>
                                Please retain this receipt.
                            </div>
                        </div>
                    </div> 
                    )}
                    <DialogFooter className="flex sm:justify-between gap-2 mt-1">
                        <Button variant="outline" size="sm" className="w-full sm:w-auto" onClick={() => setViewingReceipt(null)}>
                            Close
                        </Button>
                        <Button size="sm" className="w-full sm:w-auto" onClick={handlePrint}>
                            <Printer className="w-4 h-4 mr-2" /> Print
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
