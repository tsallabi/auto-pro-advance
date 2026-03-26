import nodemailer from 'nodemailer';

async function testEmail() {
    const transporter = nodemailer.createTransport({
        host: 'smtp.gmail.com',
        port: 587,
        secure: false,
        auth: {
            user: 'your-email@gmail.com',
            pass: 'your-app-password',
        },
    });

    try {
        await transporter.verify();
        console.log("SMTP Connection successful!");
    } catch (error) {
        console.error("SMTP Connection failed:", error.message);
    }
}

testEmail();
