import { UserProfile } from "../../components/UserProfile";
import { useAuth } from "../../utils/authContext";
import { ArrowLeft } from "lucide-react";
import { Button } from "../../components/ui/button";
import { useNavigate } from "react-router-dom";

export default function ProfilePage() {
    // Auth context usually provides user wrapper.
    // We can rely on UserProfile isMe={true} to fetch refined data.
    const { user } = useAuth(); 
    const navigate = useNavigate();

    if (!user) {
        return <div className="p-8 text-center">Please log in to view profile.</div>;
    }

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
                role={(user.roles && user.roles.length > 0 ? user.roles[0].toLowerCase() : 'patient') as any} 
            />
        </div>
    );
}
