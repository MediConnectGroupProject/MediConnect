import toast from "react-hot-toast";
import {
    getUserCount,
    getAllUsers,
    getAllRoles,
    changeRoleStatus,
    addRole,
    changeUserStatus
} from "../api/adminUsersApi";
import {
    useMutation,
    useQuery,
    useQueryClient
} from "@tanstack/react-query";

// get user count
export const userCount = () => {

    return useQuery({
        queryKey: ['userCount'],
        queryFn: getUserCount,
        staleTime: 1000 * 60 * 60 * 24,
        retry: 1,
        refetchOnWindowFocus: false,
    });
}

// get all users
export const allUsers = (page: number, limit: number, search: string) => {

    return useQuery({
        queryKey: ['users', page, limit, search],
        queryFn: () => getAllUsers(page, limit, search),
        staleTime: 1000 * 60 * 5,
        retry: 1,
        refetchOnWindowFocus: false,
        placeholderData: (prev : any) => prev,
    });
}

// get all roles
export const allRoles = () => {

    return useQuery({
        queryKey: ['roles'],
        queryFn: () => getAllRoles(),
        staleTime: 1000 * 60 * 60,
        retry: 1,
        refetchOnWindowFocus: false,
    });
}

// update role status
export const updateRoleMutation = () => {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: ({
            userId,
            roleId,
            action,
        }: {
            userId: string
            roleId: number
            action: "ACTIVE" | "INACTIVE" | "SUSPENDED"
        }) => changeRoleStatus(roleId, userId, action),

        // optimistic update
        onMutate: async ({ userId, roleId, action }) => {
            await queryClient.cancelQueries({ queryKey: ["users"] })

            const previousUsers = queryClient.getQueryData(["users"])

            queryClient.setQueryData(["users"], (old: any) => {
                if (!old) return old

                return {
                    ...old,
                    data: old.data.map((user: any) => {
                        if (user.id !== userId) return user

                        return {
                            ...user,
                            roles: user.roles.map((r: any) =>
                                r.role.id === roleId
                                    ? { ...r, status: action }
                                    : r
                            ),
                        }
                    }),
                }
            })

            return { previousUsers }
        },

        // rollback
        onError: (_err, _vars, context) => {
            if (context?.previousUsers) {
                queryClient.setQueryData(["users"], context.previousUsers)
            }
            toast.error("Failed to update role")
        },
        onSuccess: () => {
            toast.success("Role updated successfully")
        },

        // re-sync
        onSettled: () => {
            queryClient.invalidateQueries({ queryKey: ["users"] })
        },
    })
}

// add role
export const addRoleMutation = () => {

    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({
            roleName,
            userId,
        } : {
            roleName: string,
            userId: string
        }) => addRole(roleName ,userId),
        onSuccess: (data) => {
            toast.success(data?.message || "Role added successfully")
        },
        onError: (error :any) => {
            toast.error(error?.message || "Something went wrong")
        },
        onSettled: () => {
            queryClient.invalidateQueries({ queryKey: ["users"] });
        },
    });
}

// update user state
export const updateUserStateMutation = () => {

    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({
            userId,
            status
        }: {
            userId: string
            status: string
        }) => changeUserStatus(userId ,status),
        onSuccess: (data) => {
            toast.success(data?.message || "Role status updated successfully")
        },
        onError: (error :any) => {
            toast.error(error?.message || "Something went wrong")
        },
        onSettled: () => {
            queryClient.invalidateQueries({ queryKey: ["users"] });
        },
    })
}