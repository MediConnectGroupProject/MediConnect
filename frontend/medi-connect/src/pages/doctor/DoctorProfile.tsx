
import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/card';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Textarea } from '../../components/ui/textarea';
import { Badge } from '../../components/ui/badge';
import { Loader2, Plus, X, User, Briefcase, Mail, Phone, Building } from 'lucide-react';

export default function DoctorProfile() {
    // const { user } = useAuth();
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);

    // Profile State
    const [profile, setProfile] = useState({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        slmcRegNo: '',
        specialization: '',
        bio: '',
        proficiency: [] as string[],
        hospitals: [] as string[],
        experience: '0'
    });

    const [newSkill, setNewSkill] = useState('');
    const [newHospital, setNewHospital] = useState('');

    useEffect(() => {
        loadProfile();
    }, []);

    const loadProfile = async () => {
        try {
            const api = await import('../../api/doctorApi');
            const data = await api.getDoctorProfile(); // Need to implement this in doctorApi
            
            setProfile({
                firstName: data.firstName || '',
                lastName: data.lastName || '',
                email: data.email || '',
                phone: data.phone || '',
                slmcRegNo: data.slmcRegNo || '',
                specialization: data.specialization || '',
                bio: data.bio || '',
                proficiency: data.proficiency || [],
                hospitals: data.hospitals || [],
                experience: data.experience || '0'
            });
        } catch (error) {
            console.error("Failed to load profile", error);
            toast.error("Failed to load profile data");
        } finally {
            setIsLoading(false);
        }
    };

    const handleSave = async () => {
        setIsSaving(true);
        try {
            const api = await import('../../api/doctorApi');
            await api.updateDoctorProfile({
                phone: profile.phone,
                bio: profile.bio,
                proficiency: profile.proficiency,
                hospitals: profile.hospitals,
                experience: profile.experience
            }); // Support phone update? Usually separate endpoint but let's assume one for now or user update
            
            toast.success("Profile updated successfully");
        } catch (error) {
            console.error(error);
            toast.error("Failed to update profile");
        } finally {
            setIsSaving(false);
        }
    };

    const addSkill = () => {
        const skill = newSkill.trim();
        if (!skill) return;

        if (profile.proficiency.includes(skill)) {
            toast.error("This skill is already in your list");
            return;
        }
        
        setProfile(p => ({ ...p, proficiency: [...p.proficiency, skill] }));
        setNewSkill('');
    };

    const removeSkill = (skill: string) => {
        setProfile(p => ({ ...p, proficiency: p.proficiency.filter(s => s !== skill) }));
    };

    const addHospital = () => {
        const hospital = newHospital.trim();
        if (!hospital) return;

        if (profile.hospitals.includes(hospital)) {
            toast.error("This hospital is already in your list");
            return;
        }

        setProfile(p => ({ ...p, hospitals: [...p.hospitals, hospital] }));
        setNewHospital('');
    };
    
    const removeHospital = (h: string) => {
        setProfile(p => ({ ...p, hospitals: p.hospitals.filter(x => x !== h) }));
    };

    if (isLoading) return <div className="flex justify-center p-8"><Loader2 className="h-8 w-8 animate-spin text-gray-400" /></div>;

    return (
        <div className="max-w-4xl mx-auto p-6 space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">My Profile</h1>
                    <p className="text-gray-500">Manage your professional details and account settings</p>
                </div>
                <Button onClick={handleSave} disabled={isSaving}>
                    {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Save Changes
                </Button>
            </div>

            <div className="grid gap-6 md:grid-cols-3">
                {/* Main Info Card */}
                <Card className="md:col-span-1">
                    <CardHeader className="text-center">
                        <div className="w-24 h-24 bg-blue-100 rounded-full mx-auto flex items-center justify-center mb-4 text-2xl font-bold text-blue-600 uppercase select-none">
                             {profile.firstName?.charAt(0)}{profile.lastName?.charAt(0)}
                        </div>
                        <CardTitle>{profile.firstName} {profile.lastName}</CardTitle>
                        <CardDescription className="uppercase">{profile.specialization || 'Doctor'}</CardDescription>
                        
                        <div className="flex justify-center mt-2">
                             <Badge variant="outline" title={profile.slmcRegNo} className="cursor-help">
                                ID: {profile.slmcRegNo ? profile.slmcRegNo.slice(0, 8) + '...' : 'N/A'}
                             </Badge>
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex items-center text-sm text-gray-600">
                            <Mail className="h-4 w-4 mr-2" />
                            <span className="truncate">{profile.email}</span>
                        </div>
                        <div className="flex items-center text-sm text-gray-600">
                            <Phone className="h-4 w-4 mr-2" />
                             <span>{profile.phone || 'No phone added'}</span>
                        </div>
                        <div className="flex items-center text-sm text-gray-600">
                            <Briefcase className="h-4 w-4 mr-2" />
                             <span>{profile.experience} Years Exp.</span>
                        </div>
                    </CardContent>
                </Card>

                {/* Edit Form */}
                <Card className="md:col-span-2">
                    <CardHeader>
                        <CardTitle>Professional Details</CardTitle>
                        <CardDescription>Update your medical profile visible to patients</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        
                        <div className="grid grid-cols-2 gap-4">
                             <div className="space-y-2">
                                <Label>Phone Number</Label>
                                <Input value={profile.phone} onChange={e => setProfile({...profile, phone: e.target.value})} placeholder="+94..." />
                            </div>
                            <div className="space-y-2">
                                <Label>Years of Experience</Label>
                                <Input type="number" value={profile.experience} onChange={e => setProfile({...profile, experience: e.target.value})} />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label>Professional Bio</Label>
                            <Textarea 
                                value={profile.bio} 
                                onChange={e => setProfile({...profile, bio: e.target.value})} 
                                placeholder="Write a short summary about your background and approach..."
                                className="min-h-[120px]"
                            />
                        </div>

                        {/* Proficiency / Skills */}
                        <div className="space-y-2">
                            <Label>Areas of Proficiency / Skills</Label>
                            <div className="flex flex-wrap gap-2 mb-2">
                                {profile.proficiency.map(skill => (
                                    <Badge key={skill} variant="secondary" className="px-2 py-1.5 flex items-start gap-2 whitespace-normal h-auto text-left break-words max-w-full">
                                        <span className="flex-1">{skill}</span>
                                        <button 
                                            type="button" 
                                            onClick={(e) => { e.preventDefault(); removeSkill(skill); }}
                                            className="text-gray-500 hover:text-red-500 hover:bg-red-50 rounded-full p-0.5 transition-colors shrink-0"
                                        >
                                            <X className="h-3 w-3" />
                                        </button>
                                    </Badge>
                                ))}
                            </div>
                            <div className="flex gap-2">
                                <Input 
                                    value={newSkill} 
                                    onChange={e => setNewSkill(e.target.value)} 
                                    placeholder="Add a skill (e.g. Pediatrics, Surgery)"
                                    maxLength={50}
                                    onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addSkill())}
                                />
                                <Button size="icon" variant="outline" onClick={addSkill}><Plus className="h-4 w-4" /></Button>
                            </div>
                        </div>

                         {/* Hospitals */}
                         <div className="space-y-2">
                            <Label>Working Hospitals</Label>
                            <div className="flex flex-wrap gap-2 mb-2">
                                {profile.hospitals.map(h => (
                                    <Badge key={h} variant="outline" className="px-2 py-1.5 flex items-start gap-2 border-blue-200 bg-blue-50 text-blue-700 whitespace-normal h-auto text-left break-words max-w-full">
                                        <Building className="h-3 w-3 mt-1 shrink-0" />
                                        <span className="flex-1">{h}</span>
                                        <button 
                                            type="button" 
                                            onClick={(e) => { e.preventDefault(); removeHospital(h); }}
                                            className="text-blue-400 hover:text-red-500 hover:bg-blue-100 rounded-full p-0.5 transition-colors shrink-0"
                                        >
                                            <X className="h-3 w-3" />
                                        </button>
                                    </Badge>
                                ))}
                            </div>
                            <div className="flex gap-2">
                                <Input 
                                    value={newHospital} 
                                    onChange={e => setNewHospital(e.target.value)} 
                                    placeholder="Add hospital name"
                                    maxLength={50}
                                    onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addHospital())}
                                />
                                <Button size="icon" variant="outline" onClick={addHospital}><Plus className="h-4 w-4" /></Button>
                            </div>
                        </div>

                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
