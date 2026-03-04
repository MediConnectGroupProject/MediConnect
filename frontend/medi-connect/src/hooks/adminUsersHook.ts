import toast from "react-hot-toast";
import {
    getUserCount,
    getAllUsers,
    getAllRoles,
    changeRoleStatus,
    addRole,
    changeUserStatus,
    getAdminDashboardStats,
    createUser,
    deleteUser,
    removeRole,
    // Supplier Imports
    getAllSuppliers,
    addSupplier,
    updateSupplier,
    updateSupplierStatus
} from "../api/adminUsersApi";
import {
    useMutation,
    useQuery,
    useQueryClient
} from "@tanstack/react-query";

// get dashboard stats
export const useAdminStats = () => {
    return useQuery({
        queryKey: ['adminStats'],
        queryFn: getAdminDashboardStats,
        staleTime: 1000 * 60 * 5, // 5 mins
        retry: 1,
        refetchOnWindowFocus: false,
    });
}

// get user count
export const useUserCount = () => {

    return useQuery({
        queryKey: ['userCount'],
        queryFn: getUserCount,
        staleTime: 1000 * 60 * 60 * 24,
        retry: 1,
        refetchOnWindowFocus: false,
    });
}

// get all users
export const useAllUsers = (page: number, limit: number, search: string, type?: 'internal' | 'external') => {

    return useQuery({
        queryKey: ['users', page, limit, search, type],
        queryFn: () => getAllUsers(page, limit, search, type),
        staleTime: 1000 * 60 * 5,
        retry: 1,
        refetchOnWindowFocus: false,
        placeholderData: (prev : any) => prev,
    });
}

// get all roles
export const useAllRoles = () => {

    return useQuery({
        queryKey: ['roles'],
        queryFn: () => getAllRoles(),
        staleTime: 1000 * 60 * 60,
        retry: 1,
        refetchOnWindowFocus: false,
    });
}

// update role status
export const useUpdateRoleMutation = () => {
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
export const useAddRoleMutation = () => {

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
export const useUpdateUserStateMutation = () => {

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

// create user
export const useCreateUser = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (userData: any) => createUser(userData),
        onSuccess: (data) => {
            toast.success(data?.message || "User created successfully");
            // Invalidate both internal and external user lists
            queryClient.invalidateQueries({ queryKey: ["users"] });
        },
        onError: (error: any) => {
            toast.error(error?.message || "Failed to create user");
        }
    });
}

// delete user
export const useDeleteUser = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (userId: string) => deleteUser(userId),
        onSuccess: (data) => {
            toast.success(data?.message || "User deleted successfully");
            queryClient.invalidateQueries({ queryKey: ["users"] });
            queryClient.invalidateQueries({ queryKey: ["adminStats"] });
            queryClient.invalidateQueries({ queryKey: ["userCount"] });
        },
        onError: (error: any) => {
            toast.error(error?.message || "Failed to delete user");
        }
    });
}

// remove role
export const useRemoveRole = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ roleId, userId }: { roleId: number, userId: string }) => removeRole(roleId, userId),
        onSuccess: (data) => {
            toast.success(data?.message || "Role removed successfully");
            queryClient.invalidateQueries({ queryKey: ["users"] });
        },
        onError: (error: any) => {
            toast.error(error?.message || "Failed to remove role");
        }
    });
}

// ==== SUPPLY CHAIN HOOKS ====

export const useAllSuppliers = () => {
    return useQuery({
        queryKey: ['suppliers'],
        queryFn: getAllSuppliers,
        staleTime: 1000 * 60 * 5, // 5 mins
        retry: 1,
        refetchOnWindowFocus: false,
    });
};

export const useAddSupplier = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (supplierData: any) => addSupplier(supplierData),
        onSuccess: (data) => {
            toast.success(data?.message || "Supplier added successfully");
            queryClient.invalidateQueries({ queryKey: ["suppliers"] });
        },
        onError: (error: any) => {
            toast.error(error?.message || "Failed to add supplier");
        }
    });
};

export const useUpdateSupplier = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, updateData }: { id: string, updateData: any }) => updateSupplier(id, updateData),
        onSuccess: (data) => {
            toast.success(data?.message || "Supplier updated successfully");
            queryClient.invalidateQueries({ queryKey: ["suppliers"] });
        },
        onError: (error: any) => {
            toast.error(error?.message || "Failed to update supplier");
        }
    });
};

export const useUpdateSupplierStatus = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, isActive }: { id: string, isActive: boolean }) => updateSupplierStatus(id, isActive),
        onSuccess: (data) => {
            toast.success(data?.message || "Supplier status changed");
            queryClient.invalidateQueries({ queryKey: ["suppliers"] });
        },
        onError: (error: any) => {
            toast.error(error?.message || "Failed to update supplier status");
        }
    });
};