import { useQuery } from "@tanstack/react-query";
import { getInventory } from "../api/pharmacistApi";


// all inventories
export const inventories = (page: number, limit: number, search: string) => {
    
    return useQuery({
        queryKey: ['inventories' , page , limit , search],
        queryFn: () => getInventory(page , limit , search),
        staleTime: 1000 * 60 * 60 * 6,
        retry: 1,
        refetchOnWindowFocus: false,
        placeholderData: (prev : any) => prev,
    });
}