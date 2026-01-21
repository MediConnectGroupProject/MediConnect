import { useMutation, useQueryClient } from "@tanstack/react-query";
import { logout } from "../api/commonFunctionsApi";
import toast from "react-hot-toast";
import { RouteNames } from "../utils/RouteNames";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../utils/authContext";

export const useLogoutMutation = () => {

    const { setUser } = useAuth();
    const queryClient = useQueryClient();
    const navigate = useNavigate();

    return useMutation({
        mutationFn: logout,
        onSuccess: () => {

            toast.success("Logged out successfully");
            setUser(null);
            localStorage.removeItem("user");
            queryClient.clear();
            navigate(RouteNames.LOGIN, { replace: true });

        },
        onError: (error) => {

            toast.error(error?.message || "Something went wrong")
        },

    });
}