import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Badge } from '../../components/ui/badge';
import { Search, ShoppingCart, Trash2, CreditCard, Plus, Minus, Printer } from 'lucide-react';
import { processSale } from '../../api/pharmacistApi';
import { usePosInventory } from '../../hooks/pharmacistHook';
import toast from 'react-hot-toast';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../../components/ui/dialog';
import logo from '../../assets/logo-mediconnect.png';
import React, { useRef } from 'react';

// Custom debounce hook to delay rapid API calls
function useDebounce<T>(value: T, delay: number): T {
    const [debouncedValue, setDebouncedValue] = useState<T>(value);
    useEffect(() => {
        const handler = setTimeout(() => setDebouncedValue(value), delay);
        return () => clearTimeout(handler);
    }, [value, delay]);
    return debouncedValue;
}


interface CartItem {
    medicineId: string;
    name: string;
    price: number;
    quantity: number;
    maxStock: number;
    brand?: string;
    strength?: string;
    unit?: string;
}

export function PharmacyPOS() {
    const [cart, setCart] = useState<CartItem[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const debouncedSearch = useDebounce(searchQuery, 400); // 400ms delay

    const [processing, setProcessing] = useState(false);
    const [receiptData, setReceiptData] = useState<any>(null);
    const [isPaymentDialogOpen, setIsPaymentDialogOpen] = useState(false);
    const receiptRef = useRef<HTMLDivElement>(null);

    // Optimized API fetch that handles empty term as 'popular items'
    const { data: inventoryData, isLoading: loading, refetch: reloadInventory } = usePosInventory(debouncedSearch);
    const inventory = inventoryData || [];

    // Cart Actions
    const addToCart = (item: any) => {
        if (item.stock <= 0) {
            toast.error("Out of stock!");
            return;
        }

        setCart(prev => {
            const existing = prev.find(i => i.medicineId === item.medicineId);
            if (existing) {
                if (existing.quantity >= item.stock) {
                    toast.error("Max stock reached");
                    return prev;
                }
                return prev.map(i => i.medicineId === item.medicineId 
                    ? { ...i, quantity: i.quantity + 1 } 
                    : i
                );
            }
            return [...prev, {
                medicineId: item.medicineId,
                name: item.name,
                price: parseFloat(item.price),
                quantity: 1,
                maxStock: item.stock,
                brand: item.brand,
                strength: item.strength,
                unit: item.dosage || 'unit'
            }];
        });
    };

    const removeFromCart = (id: string) => {
        setCart(prev => prev.filter(i => i.medicineId !== id));
    };

    const updateQuantity = (id: string, delta: number) => {
        setCart(prev => prev.map(item => {
            if (item.medicineId === id) {
                const newQty = item.quantity + delta;
                if (newQty < 1) return item;
                if (newQty > item.maxStock) {
                    toast.error(`Only ${item.maxStock} available`);
                    return item;
                }
                return { ...item, quantity: newQty };
            }
            return item;
        }));
    };

    // Checkout
    const calculateTotal = () => {
        return cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    };

    const handleCheckout = async (method: 'CASH' | 'CARD') => {
        if (cart.length === 0) return;
        setProcessing(true);

        try {
            const saleData = {
                items: cart.map(i => ({
                    medicineId: i.medicineId,
                    name: i.name,
                    quantity: i.quantity,
                    price: i.price
                })),
                patientId: "GUEST", // Or select patient
                paymentMethod: method,
                totalAmount: calculateTotal()
            };

            const result = await processSale(saleData);
            toast.success("Sale processed successfully!");
            
            // Show Receipt
            setReceiptData({
                ...saleData,
                invoiceNumber: result.invoice?.invoiceNumber || "INV-PENDING",
                date: new Date().toLocaleString()
            });

            setCart([]);
            setIsPaymentDialogOpen(false);
            reloadInventory(); // Refresh stock data from backend using react-query
        } catch (error: any) {
            toast.error(error.message || "Checkout failed");
        } finally {
            setProcessing(false);
        }
    };

    const handlePrint = () => {
        const printContent = receiptRef.current;
        if (!printContent) return;

        const originalContents = document.body.innerHTML;
        document.body.innerHTML = printContent.innerHTML;

        window.print();

        // Restore the original page contents
        document.body.innerHTML = originalContents;
        window.location.reload(); // Refresh to restore React bindings properly
    };

    return (
        <div className="grid grid-cols-12 gap-6 items-start">
            {/* Left Col: Product Search */}
            <div className="col-span-8 flex flex-col gap-4">
                <Card className="flex flex-col">
                    <CardHeader className="py-4">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4" />
                            <Input 
                                placeholder="Search medicines by name or category..." 
                                className="pl-9"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                    </CardHeader>
                    <CardContent className="p-0">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4 min-h-[500px] content-start">
                            {inventory.map((item: any) => (
                                <div 
                                    key={item.medicineId} 
                                    className="border rounded-lg p-3 hover:shadow-md transition-shadow cursor-pointer bg-white"
                                    onClick={() => addToCart(item)}
                                >
                                    <div className="flex justify-between items-start mb-2">
                                        <h3 className="font-semibold text-sm line-clamp-1" title={item.name}>
                                            {item.name} {item.strength && <span className="text-gray-500 font-normal ml-1">{item.strength}mg</span>}
                                        </h3>
                                        <Badge variant={item.stock > 10 ? "outline" : "destructive"} className="text-xs">
                                            {item.stock} left
                                        </Badge>
                                    </div>
                                    {item.brand && <div className="text-xs font-semibold text-blue-600 mb-1 whitespace-nowrap overflow-hidden text-ellipsis max-w-[150px]" title={item.brand}>Brand: {item.brand}</div>}
                                    <div className="text-xs text-gray-500 mb-2">{item.category}</div>
                                    <div className="flex justify-between items-end">
                                        <div className="font-bold text-lg text-green-600">
                                            ${item.price} <span className="text-xs text-gray-400 font-normal">/ {item.dosage || 'unit'}</span>
                                        </div>
                                        <Button size="sm" variant="ghost" className="h-6 w-6 p-0">
                                            <Plus className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </div>
                            ))}
                            {inventory.length === 0 && !loading && (
                                <div className="col-span-full text-center py-10 text-gray-500">
                                    No medicines found in active inventory.
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Right Col: Cart */}
            <div className="col-span-4 sticky top-4 self-start">
                <Card className="flex flex-col shadow-lg border-blue-100 h-[calc(100vh-2rem)]">
                    <CardHeader className="bg-blue-50 py-4 border-b flex-shrink-0">
                        <CardTitle className="flex items-center gap-2 text-lg">
                            <ShoppingCart className="h-5 w-5 text-blue-600" />
                            Current Sale
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="flex-1 overflow-auto p-4 space-y-3">
                        {cart.length === 0 ? (
                            <div className="text-center text-gray-400 py-10 flex flex-col items-center">
                                <ShoppingCart className="h-10 w-10 mb-2 opacity-20" />
                                <p>Cart is empty</p>
                                <p className="text-xs">Select items from the left</p>
                            </div>
                        ) : (
                            cart.map(item => (
                                <div key={item.medicineId} className="flex justify-between items-center bg-gray-50 p-2 rounded-md">
                                    <div className="flex-1 min-w-0">
                                        <div className="font-medium text-sm truncate">
                                            {item.name} {item.strength && <span className="text-gray-500 font-normal">{item.strength}mg</span>}
                                        </div>
                                        {item.brand && <div className="text-xs font-semibold text-blue-600 mb-0.5 mt-0.5 whitespace-nowrap overflow-hidden text-ellipsis max-w-[150px]" title={item.brand}>Brand: {item.brand}</div>}
                                        <div className="text-xs text-gray-500">
                                            ${item.price} x {item.quantity} {item.unit}s
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <div className="flex items-center bg-white border rounded text-xs">
                                            <button 
                                                className="px-2 py-1 hover:bg-gray-100"
                                                onClick={() => updateQuantity(item.medicineId, -1)}
                                            >
                                                <Minus className="h-3 w-3" />
                                            </button>
                                            <span className="w-6 text-center">{item.quantity}</span>
                                            <button 
                                                className="px-2 py-1 hover:bg-gray-100"
                                                onClick={() => updateQuantity(item.medicineId, 1)}
                                            >
                                                <Plus className="h-3 w-3" />
                                            </button>
                                        </div>
                                        <div className="font-bold text-sm min-w-[3rem] text-right">
                                            ${(item.price * item.quantity).toFixed(2)}
                                        </div>
                                        <button 
                                            onClick={() => removeFromCart(item.medicineId)}
                                            className="text-red-400 hover:text-red-600 ml-1"
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </button>
                                    </div>
                                </div>
                            ))
                        )}
                    </CardContent>
                    
                    {/* Cart Footer */}
                    <div className="p-4 bg-gray-50 border-t space-y-4">
                        <div className="flex justify-between items-center text-lg font-bold">
                            <span>Total</span>
                            <span className="text-green-600">${calculateTotal().toFixed(2)}</span>
                        </div>
                        <Button 
                            className="w-full h-12 text-lg" 
                            size="lg" 
                            disabled={cart.length === 0 || processing}
                            onClick={() => setIsPaymentDialogOpen(true)}
                        >
                            {processing ? "Processing..." : (
                                <>
                                    <CreditCard className="mr-2 h-5 w-5" />
                                    Checkout
                                </>
                            )}
                        </Button>
                    </div>
                </Card>
            </div>


        {/* Payment Method Dialog */}
        <Dialog open={isPaymentDialogOpen} onOpenChange={setIsPaymentDialogOpen}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle className="text-center text-xl pb-2">Select Payment Method</DialogTitle>
                </DialogHeader>
                <div className="flex flex-col sm:flex-row gap-4 py-4">
                    <Button 
                        variant="outline" 
                        className="flex-1 h-32 flex flex-col items-center justify-center gap-2 border-2 hover:border-blue-500 hover:bg-blue-50 transition-colors"
                        onClick={() => handleCheckout('CASH')}
                        disabled={processing}
                    >
                        <div className="text-3xl">💵</div>
                        <span className="font-semibold text-lg">Cash</span>
                    </Button>
                    
                    <Button 
                        variant="outline" 
                        className="flex-1 h-32 flex flex-col items-center justify-center gap-2 border-2 relative opacity-60 cursor-not-allowed"
                        disabled={true}
                    >
                        <div className="text-3xl">💳</div>
                        <span className="font-semibold text-lg">Card</span>
                        <span className="absolute top-2 right-2 bg-orange-500 text-white text-[10px] px-2 py-0.5 rounded shadow-sm font-bold">Coming Soon</span>
                    </Button>
                </div>
            </DialogContent>
        </Dialog>

        {/* Receipt Modal */}
        <Dialog open={!!receiptData} onOpenChange={(open) => !open && setReceiptData(null)}>
            <DialogContent className="sm:max-w-sm max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="text-center font-bold text-lg pb-1 border-b">Receipt</DialogTitle>
                </DialogHeader>
                {receiptData && (
                   <div ref={receiptRef}>
                       <div id="receipt-print" className="space-y-3 text-xs font-mono border p-4 rounded-lg bg-white shadow-sm mt-1">
                           <div className="text-center flex flex-col items-center">
                               <img src={logo} alt="MediConnect Logo" className="h-8 w-auto mb-1 opacity-90" />
                               <h3 className="font-bold text-sm leading-tight text-black">MediConnect Pharmacy</h3>
                               <p className="text-black text-[10px]">123 Health Avenue, Med City</p>
                               <p className="text-black text-[10px]">Tel: +1 (555) 123-4567</p>
                           </div>
                           
                           <div className="flex justify-between border-b border-dashed border-gray-400 pb-1 mt-2 text-[10px] text-black">
                               <span>Invoice: {receiptData.invoiceNumber}</span>
                               <span>{receiptData.date}</span>
                           </div>

                           <div className="space-y-2 mt-4">
                               <div className="flex justify-between text-[10px] font-bold text-black border-b border-gray-400 pb-1">
                                   <span>ITEM</span>
                                   <span>PRICE</span>
                               </div>
                               {receiptData.items.map((item: any, idx: number) => (
                                   <div key={idx} className="flex justify-between items-start text-[10px] border-b border-gray-200 last:border-0 pb-1 last:pb-0 text-black">
                                       <span className="w-3/4 pr-2 font-medium">{item.name} <span className="text-black">x{item.quantity}</span></span>
                                       <span className="w-1/4 text-right">${(item.price * item.quantity).toFixed(2)}</span>
                                   </div>
                               ))}
                           </div>

                           <div className="border-t border-dashed border-gray-400 pt-2 mt-2 text-black">
                              <div className="flex justify-between items-center text-[10px] font-bold">
                                  <span>TOTAL ({receiptData.paymentMethod}):</span>
                                  <span className="text-xs">${receiptData.totalAmount.toFixed(2)}</span>
                              </div>
                           </div>

                           <div className="text-center text-[10px] text-black pt-3 mt-2 border-t border-gray-200">
                               Thank you for your business!<br/>
                               Please retain this receipt.
                           </div>
                       </div>
                   </div> 
                )}
                <DialogFooter className="flex sm:justify-between gap-2 mt-1">
                    <Button variant="outline" size="sm" className="w-full sm:w-auto" onClick={() => setReceiptData(null)}>
                        Cancel
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
