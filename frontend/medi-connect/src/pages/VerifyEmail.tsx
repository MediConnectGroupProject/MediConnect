import { useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';

function VerifyEmail() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');

  useEffect(() => {
    if (token) {
      // call backend API
      fetch(`${import.meta.env.VITE_API_URL}/auth/verify-email?token=${token}`)
        .then(res => res.json())
        .then(data => {
          console.log(data);
        })
        .catch(err => {
          console.error(err);
        });
    }
  }, [token]);

  return (
    <div>
      <h2>Email Verification</h2>
      {token ? (
        <p>Verifying your email...</p>
      ) : (
        <p>Invalid or missing token</p>
      )}
    </div>
  );
}

export default VerifyEmail;
