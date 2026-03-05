import { PrismaClient } from '@prisma/client';
import http from 'http';

const prisma = new PrismaClient();

function postRequest(path, body) {
    return new Promise((resolve, reject) => {
        const data = JSON.stringify(body);
        const options = {
            hostname: 'localhost',
            port: 3000,
            path: path,
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Content-Length': data.length
            }
        };

        const req = http.request(options, (res) => {
            let responseData = '';
            res.on('data', chunk => responseData += chunk);
            res.on('end', () => resolve({ statusCode: res.statusCode, headers: res.headers, body: responseData }));
        });

        req.on('error', error => reject(error));
        req.write(data);
        req.end();
    });
}

function getRequest(path, cookie) {
    return new Promise((resolve, reject) => {
        const options = {
            hostname: 'localhost',
            port: 3000,
            path: path,
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Cookie': cookie
            }
        };

        const req = http.request(options, (res) => {
            let responseData = '';
            res.on('data', chunk => responseData += chunk);
            res.on('end', () => resolve({ statusCode: res.statusCode, body: responseData }));
        });

        req.on('error', error => reject(error));
        req.end();
    });
}

async function main() {
    console.log('--- TEST API FLOW ---');
    try {
        // 1. Login
        console.log('Attempting Login...');
        const loginRes = await postRequest('/api/auth/login', {
            email: 'doctor@example.com',
            password: 'password123'
        });

        console.log(`Login Status: ${loginRes.statusCode}`);
        if (loginRes.statusCode !== 200) {
            console.log('Login Body:', loginRes.body);
            return;
        }

        const cookies = loginRes.headers['set-cookie'];
        if (!cookies) {
            console.log('No cookies received!');
            return;
        }
        const authCookie = cookies.find(c => c.startsWith('mediconnect='));
        console.log('Auth Cookie obtained.');

        // 2. Fetch Stats
        console.log('Fetching Doctor Stats...');
        const statsRes = await getRequest('/api/doctor/stats', authCookie);
        console.log(`Stats Status: ${statsRes.statusCode}`);
        console.log('Stats Body:', statsRes.body);

        // 3. Fetch Appointments
        console.log('Fetching Appointments (Today)...');
        const today = new Date().toISOString();
        const apptRes = await getRequest(`/api/doctor/appointments?date=${today}&status=ALL`, authCookie);
        console.log(`Appt Status: ${apptRes.statusCode}`);
        console.log('Appt Body:', apptRes.body);

    } catch (e) {
        console.error('Test Failed:', e);
    } finally {
        await prisma.$disconnect();
    }
}

main();
