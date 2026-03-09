import nodemailer from 'nodemailer';

const isMailConfigured = !!(process.env.MAIL_HOST && process.env.MAIL_USER && process.env.MAIL_PASS);

const transporter = isMailConfigured
    ? nodemailer.createTransport({
          host: process.env.MAIL_HOST,
          port: Number(process.env.MAIL_PORT) || 587,
          secure: Number(process.env.MAIL_PORT) === 465,
          auth: {
              user: process.env.MAIL_USER,
              pass: process.env.MAIL_PASS
          }
      })
    : null;

const sendEmail = async ({ to, subject, html }) => {
    if (!transporter) {
        // Dev fallback: log the email to the console instead of crashing
        console.log('\n─────────────────────────────────────────');
        console.log('📧  [DEV EMAIL – SMTP not configured]');
        console.log(`To:      ${to}`);
        console.log(`Subject: ${subject}`);
        console.log(`Body:\n${html.replace(/<[^>]+>/g, '')}`);
        console.log('─────────────────────────────────────────\n');
        return;
    }

    try {
        await transporter.sendMail({
            from: process.env.MAIL_FROM || process.env.MAIL_USER,
            to,
            subject,
            html
        });
    } catch (err) {
        console.error('⚠️  Failed to send email (SMTP error):', err.message);
        console.log('📧  [Fallback] Email details:');
        console.log(`To: ${to} | Subject: ${subject}`);
        // Do NOT re-throw — allow the caller to succeed even if email fails
    }
};

export default sendEmail;