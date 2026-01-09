export const verificationEmail = (verifyUrl) => `
  <div style="font-family: Arial, sans-serif;">
    <h2>Verify your email</h2>
    <p>Thanks for registering with MediConnect.</p>
    <p>Please verify your email by clicking the link below:</p>
    <a href="${verifyUrl}" 
       style="padding:10px 16px; background:#2563eb; color:#fff; text-decoration:none; border-radius:4px;">
       Verify Email
    </a>
    <p>This link expires in 24 hours.</p>
  </div>
`;
export default verificationEmail;