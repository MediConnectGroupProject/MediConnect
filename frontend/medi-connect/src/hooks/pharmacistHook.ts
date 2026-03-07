import { useQuery } from "@tanstack/react-query";
import { getInventory } from "../api/pharmacistApi";


// all inventories
export const useInventories = (page: number, limit: number, search: string) => {
    
    return useQuery({
        queryKey: ['inventories' , page , limit , search],
        queryFn: () => getInventory(page , limit , search),
        staleTime: 1000 * 60 * 60 * 6,
        retry: 1,
        refetchOnWindowFocus: false,
        placeholderData: (prev : any) => prev,
    });
}

// pos inventory search optimized
export const usePosInventory = (search: string) => {
    return useQuery({
        queryKey: ['posInventory', search],
        queryFn: async () => {
            const isPopular = search.trim().length === 0;
            const data = await getInventory(1, 100, search, isPopular);
            return Array.isArray(data) ? data : data.data || [];
        },
        staleTime: 1000 * 60, // 1 min (don't want to stale out too fast while typing)
        refetchOnWindowFocus: false,
    });
}