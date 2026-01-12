
const ROLE_PRIORITY = [

    'ADMIN',
    'DOCTOR',
    'PHARMACIST',
    'RECEPTIONIST',
    'MLT',
    'PATIENT'
];

export const getPrimaryRole = (roles) => {

    for (const r of ROLE_PRIORITY) {

        if (roles.includes(r)) {

            return r;
        }
    }

    return 'PATIENT';
}