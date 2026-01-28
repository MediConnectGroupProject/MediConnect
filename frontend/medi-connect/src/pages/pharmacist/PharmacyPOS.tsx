import { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Badge } from '../../components/ui/badge';
import { Search, ShoppingCart, Trash2, CreditCard, Plus, Minus, Printer } from 'lucide-react';
import { getInventory, processSale } from '../../api/pharmacistApi';
import toast from 'react-hot-toast';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../../components/ui/dialog';


interface CartItem {
    medicineId: string;
    name: string;
    price: number;
    quantity: number;
    maxStock: number;
    unit?: string;
}

export function PharmacyPOS() {
    const [inventory, setInventory] = useState<any[]>([]);
    const [cart, setCart] = useState<CartItem[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [loading, setLoading] = useState(false);
    const [processing, setProcessing] = useState(false);
    const [receiptData, setReceiptData] = useState<any>(null); // For Receipt Modal


    // Initial Load
    useEffect(() => {
        loadInventory();
    }, []);

    const loadInventory = async () => {
        setLoading(true);
        try {
            const data = await getInventory(1, 1000, '', true); // Load popular items by default
            // If user searches, we should probably toggle 'popular' off in a real app, 
            // but for now keeping it simple as per request to just have default view.
            
            // Backend returns { } or [] depending on implementation. 
            // Previous check showed `return res.json()` which is array from `getInventoryWithBatches`.
            // But `getInventory` in frontend handles page/limit? No, I overwrote it to use simple fetch?
            // Wait, I overwrote `getInventory` in `pharmacistApi.ts` to use simple fetch.
            setInventory(Array.isArray(data) ? data : data.data || []);
        } catch (error) {
            console.error(error);
            toast.error("Failed to load inventory");
        } finally {
            setLoading(false);
        }
    };

    const filteredInventory = useMemo(() => {
        if (!searchQuery) return inventory;
        // If searching, we realistically need to fetch from backend if we only loaded top 10.
        // But if we loaded all (which we aren't anymore), this works.
        // TODO: ideally search triggers backend. 
        // For this task, assuming the user is okay with clientside filter OR we should trigger search.
        // Given the code structure, I'll stick to client side for now but note that 
        // if `inventory` only has 10 items, search is limited. 
        // To fix this properly, `searchQuery` change should trigger `loadInventory`.
        
        return inventory.filter(item => 
            item.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
            item.category?.toLowerCase().includes(searchQuery.toLowerCase())
        );
    }, [inventory, searchQuery]);
    
    // Better Approach: Trigger fetch on search. Since I can't easily refactor the whole component state machine in one go without potential regression
    // I will add a side effect to reload when search changes if needed, but the prompt asked for "Top 10" by default.
    // Let's modify the useEffect to depend on search query?
    // Actually, line 37 loads "popular". If I type, I want "all matching". 
    // Let's update useEffect:
    
    useEffect(() => {
        const fetch = async () => {
             setLoading(true);
             try {
                // If search query is present, fetch ALL matching (popular=false)
                // If empty, fetch POPULAR (popular=true)
                const isRobustSearch = searchQuery.length > 0;
                const data = await getInventory(1, 1000, searchQuery, !isRobustSearch);
                setInventory(Array.isArray(data) ? data : data.data || []);
             } catch(e) {
                 toast.error("Failed to load inventory");
             } finally {
                 setLoading(false);
             }
        }
        // Debounce simple implementation
        const timeoutId = setTimeout(() => fetch(), 500);
        return () => clearTimeout(timeoutId);
    }, [searchQuery]);

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

    const handleCheckout = async () => {
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
                paymentMethod: "CASH",
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
            loadInventory(); // Refresh stock
        } catch (error: any) {
            toast.error(error.message || "Checkout failed");
        } finally {
            setProcessing(false);
        }
    };

    const handlePrint = () => {
        window.print();
        // In a real app, we'd trigger a specific print component or PDF download
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
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4">
                            {filteredInventory.map((item: any) => (
                                <div 
                                    key={item.medicineId} 
                                    className="border rounded-lg p-3 hover:shadow-md transition-shadow cursor-pointer bg-white"
                                    onClick={() => addToCart(item)}
                                >
                                    <div className="flex justify-between items-start mb-2">
                                        <h3 className="font-semibold text-sm line-clamp-1" title={item.name}>{item.name}</h3>
                                        <Badge variant={item.stock > 10 ? "outline" : "destructive"} className="text-xs">
                                            {item.stock} left
                                        </Badge>
                                    </div>
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
                            {filteredInventory.length === 0 && !loading && (
                                <div className="col-span-full text-center py-10 text-gray-500">
                                    No medicines found.
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Right Col: Cart */}
            <div className="col-span-4 flex flex-col gap-4 sticky top-4">
                <Card className="flex flex-col shadow-lg border-blue-100 max-h-[calc(100vh-2rem)] overflow-hidden">
                    <CardHeader className="bg-blue-50 py-4 border-b">
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
                                        <div className="font-medium text-sm truncate">{item.name}</div>
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
                            onClick={handleCheckout}
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


        {/* Receipt Modal */}
        <Dialog open={!!receiptData} onOpenChange={(open) => !open && setReceiptData(null)}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle className="text-center border-b pb-2">Pharmacy Receipt</DialogTitle>
                </DialogHeader>
                {receiptData && (
                   <div id="receipt-print" className="space-y-4 text-sm font-mono">
                       <div className="text-center">
                           <h3 className="font-bold text-lg">MediConnect Pharmacy</h3>
                           <p>123 Health Avenue, Med City</p>
                           <p>Tel: +1 (555) 123-4567</p>
                       </div>
                       
                       <div className="flex justify-between border-b pb-2">
                           <span>Inv: {receiptData.invoiceNumber}</span>
                           <span>{receiptData.date}</span>
                       </div>

                       <div className="space-y-2">
                           {receiptData.items.map((item: any, idx: number) => (
                               <div key={idx} className="flex justify-between">
                                   <span>{item.name} x{item.quantity}</span>
                                   <span>${(item.price * item.quantity).toFixed(2)}</span>
                               </div>
                           ))}
                       </div>

                       <div className="border-t pt-2 flex justify-between font-bold text-lg">
                           <span>TOTAL</span>
                           <span>${receiptData.totalAmount.toFixed(2)}</span>
                       </div>

                       <div className="text-center text-xs text-gray-500 pt-4">
                           Thank you for your business!
                       </div>
                   </div> 
                )}
                <DialogFooter className="flex-col sm:justify-center gap-2">
                    <Button className="w-full" onClick={handlePrint}>
                        <Printer className="w-4 h-4 mr-2" /> Print Receipt
                    </Button>
                    <Button variant="ghost" className="w-full" onClick={() => setReceiptData(null)}>
                        Close
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    </div>
    );
}
