import { UserProfile } from "../../components/UserProfile";
import { useAuth } from "../../utils/authContext";
import { ArrowLeft } from "lucide-react";
import { Button } from "../../components/ui/button";
import { useNavigate } from "react-router-dom";
import DoctorProfile from "../doctor/DoctorProfile";

export default function ProfilePage() {
    const { user } = useAuth(); 
    const navigate = useNavigate();

    if (!user) {
        return <div className="p-8 text-center">Please log in to view profile.</div>;
    }

    // Role specific profiles
    const role = user.primaryRole?.toLowerCase() || (user.roles?.[0]?.toLowerCase());
    
    if (role === 'doctor') {
        return <DoctorProfile />;
    }

    // Default Generic Profile (Patient/Admin/Other)
    return (
        <div className="container mx-auto p-6 max-w-4xl">
            <div className="mb-6 flex items-center gap-4">
                 <Button variant="ghost" onClick={() => navigate(-1)}>
                     <ArrowLeft className="h-4 w-4 mr-2" /> Back
                 </Button>
                 <h1 className="text-2xl font-bold">My Profile</h1>
            </div>

            <UserProfile 
                isMe={true} 
                role={role as any} 
            />
        </div>
    );
}
