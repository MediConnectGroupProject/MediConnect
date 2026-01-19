import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { User, FileText, Edit, AlertCircle } from 'lucide-react';
import { useState, useEffect } from 'react';
import { Input } from './ui/input';
import { Label } from './ui/label';

// Defines the shape of user profile data
interface UserProfileData {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: 'patient' | 'doctor' | 'pharmacist' | 'mlt' | 'admin' | 'receptionist';
  // Common personal details
  age?: number;
  gender?: string;
  bloodType?: string;
  
  // Patient Specific
  allergies?: string[];
  medications?: string[]; 
  conditions?: string[];

  // Staff Specific (Doctor, Pharm, MLT)
  licenseNumber?: string;
  department?: string; // For Doctor
  specialization?: string; // For Doctor
  bio?: string; // NEW
  qualifications?: string; // NEW
  pharmacySection?: string; // For Pharmacist
  labSection?: string; // For MLT
  joinedDate?: string;
}

interface UserProfileProps {
  userId?: string; 
  initialData?: UserProfileData; 
  readOnly?: boolean;
  onEdit?: (data: UserProfileData) => void;
  role?: 'patient' | 'doctor' | 'pharmacist' | 'mlt' | 'admin' | 'receptionist'; // Override role for display context if needed
  isMe?: boolean; // NEW: If true, uses userApi for fetch/update "me"
}

export function UserProfile({ userId, initialData, readOnly = false, onEdit, role, isMe = false }: UserProfileProps) {
    // Mock data if no initialData provided
    const defaultData: UserProfileData = {
        id: userId || 'u_dummy',
        name: 'John Doe',
        email: 'john.doe@example.com',
        phone: '+1 (555) 123-4567',
        role: (role as any) || 'patient',
        age: 34,
        gender: 'Male',
        bloodType: 'O+',
        allergies: [],
        medications: [],
        conditions: [],
        specialization: 'General Practice',
        licenseNumber: 'DOC-12345',
        department: 'Cardiology'
    };

    const [data, setData] = useState<UserProfileData>(initialData || defaultData);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    // Fetch data logic
    useEffect(() => {
        const shouldFetch = isMe || (userId && !initialData && !userId.startsWith('u_dummy'));
        
        if (shouldFetch) {
             const fetchUser = async () => {
                 setLoading(true);
                 try {
                     let fetchedData = null;
                     
                     if (isMe) {
                         const api = await import('../api/userApi');
                         fetchedData = await api.getProfile();
                     } else if (userId) {
                         // Viewing another user (e.g. Doctor viewing Patient)
                         // Currently assumes Doctor viewing Patient via doctorApi
                         // TODO: Make this more robust for Admin viewing others
                         try {
                            const api = await import('../api/doctorApi');
                            fetchedData = await api.getPatient(userId);
                         } catch (e) { console.warn("DoctorAPI fetch failed", e); }
                     }
                     
                     if (fetchedData) {
                         // Default array fields
                         setData({
                             ...fetchedData,
                             allergies: fetchedData.allergies || [],
                             medications: fetchedData.medications || [],
                             conditions: fetchedData.conditions || []
                         });
                     }
                 } catch (e) {
                     console.error("Failed to fetch user profile", e);
                     setError("Failed to load profile.");
                 } finally {
                     setLoading(false);
                 }
             };
             fetchUser();
        }
    }, [userId, isMe, initialData]);

    const [isEditing, setIsEditing] = useState(false);
    const [editForm, setEditForm] = useState<UserProfileData>(data);
    
    // Update local state if prop changes
    useEffect(() => {
        if(initialData) {
            setData(initialData);
            setEditForm(initialData);
        }
    }, [initialData]);

    // Update edit form when data changes (e.g. after fetch)
    useEffect(() => {
        setEditForm(data);
    }, [data]);

    const handleSave = async () => {
        if (isMe) {
             try {
                 const api = await import('../api/userApi');
                 await api.updateProfile(editForm);
                 setData(editForm);
                 setIsEditing(false);
                 // Optional: Toast success
             } catch (e) {
                 console.error("Failed to update profile", e);
                 // Optional: Toast error
             }
        } else {
            // Local save (parent handles persistence via onEdit if provided)
            setData(editForm);
            setIsEditing(false);
            if (onEdit) onEdit(editForm);
        }
    };

    const handleCancel = () => {
        setEditForm(data);
        setIsEditing(false);
    };

    if (isEditing && (!readOnly || isMe)) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle>Edit Profile</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid grid-cols-12 gap-4">
                         {/* Common Fields */}
                        <div className="col-span-12 md:col-span-6 space-y-2">
                             <Label>Name</Label>
                             <Input value={editForm.name} onChange={e => setEditForm({...editForm, name: e.target.value})} />
                        </div>
                        <div className="col-span-12 md:col-span-6 space-y-2">
                             {/* Email often read-only for security, but making editable for now */}
                             <Label>Email</Label>
                             <Input value={editForm.email} disabled className="bg-gray-100 cursor-not-allowed" title="Contact admin to change email" />
                        </div>
                         <div className="col-span-12 md:col-span-4 space-y-2">
                             <Label>Phone</Label>
                             <Input value={editForm.phone} onChange={e => setEditForm({...editForm, phone: e.target.value})} />
                        </div>

                        {/* Patient Specific */}
                        {editForm.role === 'patient' && (
                            <>
                                <div className="col-span-6 md:col-span-2 space-y-2">
                                    <Label>Age</Label>
                                    <Input type="number" value={editForm.age} onChange={e => setEditForm({...editForm, age: parseInt(e.target.value)})} />
                                </div>
                                <div className="col-span-6 md:col-span-3 space-y-2">
                                    <Label>Gender</Label>
                                    <Input value={editForm.gender} onChange={e => setEditForm({...editForm, gender: e.target.value})} />
                                </div>
                                <div className="col-span-6 md:col-span-3 space-y-2">
                                    <Label>Blood Type</Label>
                                    <Input value={editForm.bloodType || ''} onChange={e => setEditForm({...editForm, bloodType: e.target.value})} placeholder="e.g. O+" />
                                </div>

                                <div className="col-span-12 space-y-2">
                                    <Label>Allergies (comma separated)</Label>
                                    <Input value={(editForm.allergies || []).join(', ')} onChange={e => setEditForm({...editForm, allergies: e.target.value.split(',').map(s => s.trim())})} />
                                </div>
                                <div className="col-span-12 space-y-2">
                                    <Label>Medical Conditions (comma separated)</Label>
                                    <Input value={(editForm.conditions || []).join(', ')} onChange={e => setEditForm({...editForm, conditions: e.target.value.split(',').map(s => s.trim())})} />
                                </div>
                            </>
                        )}
                        
                        {/* Staff Specific */}
                        {['doctor', 'pharmacist', 'mlt'].includes(editForm.role?.toLowerCase()) && (
                            <div className="col-span-12 md:col-span-6 space-y-2">
                                <Label>License Number</Label>
                                <Input value={editForm.licenseNumber || ''} onChange={e => setEditForm({...editForm, licenseNumber: e.target.value})} />
                            </div>
                        )}

                        {editForm.role?.toLowerCase() === 'doctor' && (
                           <>
                             <div className="col-span-12 md:col-span-6 space-y-2">
                                <Label>Specialization</Label>
                                <Input value={editForm.specialization || ''} onChange={e => setEditForm({...editForm, specialization: e.target.value})} />
                             </div>
                             <div className="col-span-12 space-y-2">
                                <Label>Qualifications</Label>
                                <Input value={editForm.qualifications || ''} onChange={e => setEditForm({...editForm, qualifications: e.target.value})} placeholder="MBBS, MD, etc." />
                             </div>
                             <div className="col-span-12 space-y-2">
                                <Label>Bio</Label>
                                <Input value={editForm.bio || ''} onChange={e => setEditForm({...editForm, bio: e.target.value})} placeholder="Short professional biography..." />
                             </div>
                           </>
                        )}
                        
                        {/* Ensure other roles preserve their view */}
                        {editForm.role?.toLowerCase() === 'pharmacist' && (
                             <div className="col-span-12 md:col-span-6 space-y-2">
                                <Label>Pharmacy Section</Label>
                                <Input value={editForm.pharmacySection || ''} onChange={e => setEditForm({...editForm, pharmacySection: e.target.value})} />
                             </div>
                        )}
                         
                         {editForm.role?.toLowerCase() === 'mlt' && (
                             <div className="col-span-12 md:col-span-6 space-y-2">
                                <Label>Lab Section</Label>
                                <Input value={editForm.labSection || ''} onChange={e => setEditForm({...editForm, labSection: e.target.value})} />
                             </div>
                        )}
                    </div>
                    <div className="flex justify-end gap-2">
                        <Button variant="outline" onClick={handleCancel}>Cancel</Button>
                        <Button onClick={handleSave} className="bg-blue-600 hover:bg-blue-700">Save Changes</Button>
                    </div>
                </CardContent>
            </Card>
        );
    }

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    {loading ? <div className="p-4 text-center">Loading profile...</div> : 
                     error ? <div className="p-4 text-center text-red-500">{error}</div> : (
                     <CardContent className="p-0 flex flex-col md:flex-row items-center gap-6">
                        <div className="h-24 w-24 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 text-3xl font-bold">
                            {data.name ? 
                                data.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() 
                                : <User className="h-12 w-12" />
                            }
                        </div>
                        <div className="text-center md:text-left flex-1">
                            <div className="flex flex-col md:flex-row items-center gap-2 mb-2">
                                <h2 className="text-2xl font-bold text-gray-800">{data.name}</h2>
                                <Badge variant="secondary" className="capitalize">{data.role}</Badge>
                            </div>
                            <p className="text-gray-500">{data.email} • {data.phone}</p>
                            <div className="flex flex-wrap gap-4 mt-3 justify-center md:justify-start">
                                {data.role === 'patient' && (
                                    <>
                                        <div className="text-sm"><span className="font-semibold">Age:</span> {data.age}</div>
                                        <div className="text-sm"><span className="font-semibold">Gender:</span> {data.gender}</div>
                                        <div className="text-sm"><span className="font-semibold">Blood Type:</span> {data.bloodType}</div>
                                    </>
                                )}
                                {(data.role === 'doctor' || data.role === 'pharmacist' || data.role === 'mlt') && (
                                    <div className="text-sm"><span className="font-semibold">License:</span> {data.licenseNumber || 'N/A'}</div>
                                )}
                                {data.role === 'doctor' && (
                                    <>
                                        <div className="text-sm"><span className="font-semibold">Dept:</span> {data.department || 'General'}</div>
                                        <div className="text-sm"><span className="font-semibold">Spec:</span> {data.specialization || 'General'}</div>
                                    </>
                                )}
                                {data.role === 'pharmacist' && (
                                    <div className="text-sm"><span className="font-semibold">Section:</span> {data.pharmacySection || 'Main'}</div>
                                )}
                                {data.role === 'mlt' && (
                                    <div className="text-sm"><span className="font-semibold">Lab:</span> {data.labSection || 'General'}</div>
                                )}
                            </div>
                        </div>
                        {(!readOnly || isMe) && (
                            <Button variant="outline" onClick={() => setIsEditing(true)}>
                                <Edit className="h-4 w-4 mr-2" /> Edit Profile
                            </Button>
                        )}
                    </CardContent>
                    )}
                </CardHeader>
            </Card>

            {/* Role Specific Content Sections */}
            
            {/* Patient Medical Info */}
            {data.role === 'patient' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <AlertCircle className="h-5 w-5 text-red-500" />
                                Medical Alerts
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                <div>
                                    <p className="text-sm font-medium text-gray-500 mb-2">Allergies</p>
                                    <div className="flex flex-wrap gap-2">
                                        {(data.allergies || []).map((allergy, i) => (
                                            <Badge key={i} variant="destructive">{allergy}</Badge>
                                        ))}
                                        {(!data.allergies || data.allergies.length === 0) && <span className="text-sm text-gray-400">No known allergies</span>}
                                    </div>
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-gray-500 mb-2">Chronic Conditions</p>
                                    <div className="flex flex-wrap gap-2">
                                        {(data.conditions || []).map((condition, i) => (
                                            <Badge key={i} variant="outline" className="border-orange-200 text-orange-700 bg-orange-50">{condition}</Badge>
                                        ))}
                                        {(!data.conditions || data.conditions.length === 0) && <span className="text-sm text-gray-400">No chronic conditions</span>}
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <FileText className="h-5 w-5 text-blue-500" />
                                Current Medications
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <ul className="space-y-2">
                                {(data.medications || []).map((med, i) => (
                                    <li key={i} className="flex items-center gap-2 text-sm p-2 bg-gray-50 rounded">
                                        <div className="h-2 w-2 rounded-full bg-green-500"></div>
                                        {med}
                                    </li>
                                ))}
                                {(!data.medications || data.medications.length === 0) && <li className="text-sm text-gray-400">No active medications</li>}
                            </ul>
                        </CardContent>
                    </Card>
                </div>
            )}

            {/* Admin Overview */}
            {data.role === 'admin' && (
                 <Card>
                    <CardHeader>
                        <CardTitle>Administration Overview</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-sm text-gray-600">
                             System administrator with full access privileges. Uses the Admin Portal for user management and system monitoring.
                        </div>
                    </CardContent>
                 </Card>
            )}
             
            {/* Staff Professional Info */}
            {(data.role === 'doctor' || data.role === 'pharmacist' || data.role === 'mlt') && (
                <Card>
                    <CardHeader>
                        <CardTitle>Professional Information</CardTitle>
                    </CardHeader>
                    <CardContent className="grid grid-cols-2 gap-4">
                        <div>
                             <p className="text-sm font-medium text-gray-500">License Number</p>
                             <p className="font-semibold">{data.licenseNumber || 'Not provided'}</p>
                        </div>
                        <div>
                             <p className="text-sm font-medium text-gray-500">Joined Date</p>
                             <p className="font-semibold">{data.joinedDate || 'Jan 2024'}</p>
                        </div>
                        {data.role === 'doctor' && (
                             <>
                                <div>
                                     <p className="text-sm font-medium text-gray-500">Specialization</p>
                                     <p className="font-semibold">{data.specialization || 'General'}</p>
                                </div>
                                <div>
                                     <p className="text-sm font-medium text-gray-500">Department</p>
                                     <p className="font-semibold">{data.department || 'General'}</p>
                                </div>
                                <div className="col-span-2">
                                     <p className="text-sm font-medium text-gray-500">Qualifications</p>
                                     <p className="font-semibold">{data.qualifications || 'N/A'}</p>
                                </div>
                                <div className="col-span-2">
                                     <p className="text-sm font-medium text-gray-500">Bio</p>
                                     <p className="text-gray-700 text-sm italic">{data.bio || 'No biography provided.'}</p>
                                </div>
                             </>
                        )}
                         {data.role === 'pharmacist' && (
                             <div>
                                 <p className="text-sm font-medium text-gray-500">Pharmacy Section</p>
                                 <p className="font-semibold">{data.pharmacySection || 'Main'}</p>
                             </div>
                        )}
                        {data.role === 'mlt' && (
                             <div>
                                 <p className="text-sm font-medium text-gray-500">Lab Section</p>
                                 <p className="font-semibold">{data.labSection || 'General'}</p>
                             </div>
                        )}
                    </CardContent>
                </Card>
            )}

        </div>
    );
}
