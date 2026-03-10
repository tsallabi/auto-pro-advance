
const fetch = require('node-fetch');

async function testRegistration() {
    const testUser = {
        email: 'buyer_test@example.com',
        password: 'password123',
        firstName: 'Ahmed',
        lastName: 'Mansour',
        role: 'buyer',
        phone: '+218910000000',
        address1: 'Street 15, Janzour',
        country: 'Libya',
        nationalId: '119900223344',
        iban: 'LY12345678901234567890',
        commercialRegister: 'CR-998877'
    };

    try {
        const res = await fetch('http://localhost:5173/api/auth/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(testUser)
        });
        const data = await res.json();
        console.log('Registration Result:', data);
    } catch (e) {
        console.error('Error during test registration:', e.message);
    }
}

testRegistration();
