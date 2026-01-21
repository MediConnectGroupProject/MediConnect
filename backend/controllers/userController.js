import prisma from '../config/connection.js';

// Get current user profile
export const getMe = async (req, res) => {
    try {
        const userId = req.user.id;

        const user = await prisma.user.findUnique({
            where: { id: userId },
            include: {
                roles: {
                    include: {
                        role: true
                    }
                },
                doctors: true, // If doctor
                patients: true, // If patient
                license: true // If staff
            }
        });

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Construct profile object
        // Base profile
        const profile = {
            id: user.id,
            name: `${user.firstName} ${user.lastName}`,
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
            phone: user.phone,
            roles: user.roles.map(ur => ur.role.name), // ['DOCTOR', 'ADMIN']
            
            // Default role for UI context (first role or preferred)
            role: user.roles[0]?.role.name.toLowerCase() || 'patient',
        };

        // Enrich with role specific data
        const doctorData = user.doctors[0];
        if (doctorData) {
            profile.specialization = doctorData.specialization;
            profile.bio = doctorData.bio;
            profile.qualifications = doctorData.qualifications;
            profile.department = 'General'; // Schema missing department, using placeholder
        }

        const patientData = user.patients[0];
        if (patientData) {
            profile.dob = patientData.dob;
            profile.gender = patientData.gender;
            profile.address = patientData.address;
            profile.bloodType = patientData.bloodType;
            profile.allergies = patientData.allergies ? patientData.allergies.split(',').map(s => s.trim()) : [];
            profile.conditions = patientData.conditions ? patientData.conditions.split(',').map(s => s.trim()) : [];
            
            // Calculate age
            const today = new Date();
            const birthDate = new Date(patientData.dob);
            let age = today.getFullYear() - birthDate.getFullYear();
            const m = today.getMonth() - birthDate.getMonth();
            if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
                age--;
            }
            profile.age = age;
        }

        const licenseData = user.license[0];
        if (licenseData) {
            profile.licenseNumber = licenseData.license_no;
        }

        res.status(200).json(profile);

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
}

// Update current user profile
export const updateMe = async (req, res) => {
    try {
        const userId = req.user.id;
        const data = req.body;

        // Base user update
        const userUpdateData = {};
        if (data.name) {
             const names = data.name.split(' ');
             if(names.length > 0) userUpdateData.firstName = names[0];
             if(names.length > 1) userUpdateData.lastName = names.slice(1).join(' ');
        }
        if (data.phone) userUpdateData.phone = data.phone;
        // Email update usually requires verification, skip for now or allow if trusted

        await prisma.user.update({
            where: { id: userId },
            data: userUpdateData
        });

        // Role specific updates
        // DOCTOR
        if (data.role === 'doctor' || (data.roles && data.roles.includes('DOCTOR'))) {
            const docUpdate = {};
            if(data.specialization) docUpdate.specialization = data.specialization;
            if(data.bio) docUpdate.bio = data.bio;
            if(data.qualifications) docUpdate.qualifications = data.qualifications;
            
            if(Object.keys(docUpdate).length > 0) {
                 await prisma.doctor.update({
                     where: { doctorId: userId },
                     data: docUpdate
                 });
            }
        }
        
        // PATIENT
        if (data.role === 'patient' || (data.roles && data.roles.includes('PATIENT'))) {
            const patUpdate = {};
            if(data.address) patUpdate.address = data.address;
            if(data.bloodType) patUpdate.bloodType = data.bloodType;
            if(data.allergies) patUpdate.allergies = Array.isArray(data.allergies) ? data.allergies.join(', ') : data.allergies;
            if(data.conditions) patUpdate.conditions = Array.isArray(data.conditions) ? data.conditions.join(', ') : data.conditions;
             // DOB/Gender usually immutable or require admin, but let's allow basic edits if needed
             if(data.gender) patUpdate.gender = data.gender.toUpperCase() === 'MALE' ? 'MALE' : 'FEMALE';
            
            if(Object.keys(patUpdate).length > 0) {
                 await prisma.patient.update({
                     where: { patientId: userId },
                     data: patUpdate
                 });
            }
        }

        // STAFF License
        if (data.licenseNumber) {
            // Check if license exists
            const existing = await prisma.license.findUnique({ where: { userId } });
            if(existing) {
                 await prisma.license.update({ where: { userId }, data: { license_no: data.licenseNumber }});
            } else {
                 await prisma.license.create({ data: { userId, license_no: data.licenseNumber }});
            }
        }

        res.status(200).json({ message: 'Profile updated successfully' });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Failed to update profile' });
    }
}
