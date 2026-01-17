import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { MockApi } from '../../services/mockApi';
import type { InventoryItem } from '../../types';
import { Badge } from '../../components/ui/badge';
import { Package } from 'lucide-react';

export function InventoryView() {
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
       const data = await MockApi.getInventory();
       setInventory(data);
       setLoading(false);
    }
    fetch();
  }, []);

  if (loading) return <div>Loading inventory...</div>;

  return (
    <Card className="col-span-1">
      <CardHeader>
        <CardTitle>Inventory Helper</CardTitle>
      </CardHeader>
      <CardContent>
         <div className="space-y-2">
            {inventory.map(item => (
              <div key={item.id} className="flex justify-between items-center p-3 border rounded hover:bg-gray-50">
                 <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-100 rounded-full text-blue-600">
                      <Package className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="font-medium">{item.name}</p>
                      <p className="text-xs text-gray-500">Exp: {item.expiryDate}</p>
                    </div>
                 </div>
                 <div className="text-right">
                    <p className="font-bold text-sm">{item.quantity} in stock</p>
                    <Badge variant="outline" className="text-xs">{item.category}</Badge>
                 </div>
              </div>
            ))}
         </div>
      </CardContent>
    </Card>
  );
}
