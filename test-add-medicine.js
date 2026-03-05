
async function testAddMedicine() {
    try {
        const payload = {
            name: 'Test Cosmetic Med',
            description: 'Safe for test',
            categoryId: 6, // cosmetics usually 6 if added later
            dosageId: 1, // table/capsule
            price: 50.0,
            batchNumber: 'BATCH-XYZ',
            quantity: 100,
            costPrice: 20.0,
            expiryDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 365).toISOString() // 1 year
        };

        // Need to authenticate first to get a token
        const loginRes = await fetch('http://192.168.166.179:5000/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: 'pharmacist@test.com', password: 'password123' }) // Assuming a pharmacist exists
        });
        
        const loginData = await loginRes.json();
        const cookies = loginRes.headers.raw()['set-cookie'];
        const cookieStr = cookies ? cookies.map(c => c.split(';')[0]).join('; ') : '';

        console.log('Login Status:', loginRes.status, 'Cookie:', cookieStr);

        // Now post to medicine
        const res = await fetch('http://192.168.166.179:5000/api/pharmacist/medicine', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Cookie': cookieStr
            },
            body: JSON.stringify(payload)
        });

        const txt = await res.text();
        console.log('Response Status:', res.status);
        console.log('Response Body:', txt);
    } catch (error) {
        console.error('Fetch error:', error);
    }
}

testAddMedicine();
