import toast from "react-hot-toast";
import { getLabReportQueue } from '../api/mltApi'
import {
    useMutation,
    useQuery,
    useQueryClient
} from "@tanstack/react-query";


// get all reports
export const getLabReport = () => {

    return useQuery({
        queryKey: ['reports'],
        queryFn: () => getLabReportQueue(),
        staleTime: 1000 * 60 * 60,
        retry: 1,
        refetchOnWindowFocus: false,
    });
}

// update reports
// export const useUpdateRoleMutation = () => {
//     const queryClient = useQueryClient()

//     return useMutation({
//         mutationFn: ({
//             userId,
//             roleId,
//             action,
//         }: {
//             userId: string
//             roleId: number
//             action: "ACTIVE" | "INACTIVE" | "SUSPENDED"
//         }) => changeRoleStatus(roleId, userId, action),

//         // optimistic update
//         onMutate: async ({ userId, roleId, action }) => {
//             await queryClient.cancelQueries({ queryKey: ["users"] })

//             const previousUsers = queryClient.getQueryData(["users"])

//             queryClient.setQueryData(["users"], (old: any) => {
//                 if (!old) return old

//                 return {
//                     ...old,
//                     data: old.data.map((user: any) => {
//                         if (user.id !== userId) return user

//                         return {
//                             ...user,
//                             roles: user.roles.map((r: any) =>
//                                 r.role.id === roleId
//                                     ? { ...r, status: action }
//                                     : r
//                             ),
//                         }
//                     }),
//                 }
//             })

//             return { previousUsers }
//         },

//         // rollback
//         onError: (_err, _vars, context) => {
//             if (context?.previousUsers) {
//                 queryClient.setQueryData(["users"], context.previousUsers)
//             }
//             toast.error("Failed to update role")
//         },
//         onSuccess: () => {
//             toast.success("Role updated successfully")
//         },

//         // re-sync
//         onSettled: () => {
//             queryClient.invalidateQueries({ queryKey: ["users"] })
//         },
//     })
// }