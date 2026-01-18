import { useState } from 'react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../components/ui/card';
import { useNavigate } from 'react-router-dom';
import { MockApi } from '../services/mockApi'; 
import { useAuth } from '../utils/authContext';
import { ArrowLeft } from 'lucide-react';

export default function Register() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { setUser } = useAuth();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (password !== confirmPassword) {
        setError("Passwords do not match");
        return;
    }

    setLoading(true);

    try {
      // Hardcoded 'patient' role for public registration
      const user = await MockApi.register(email, password, name, 'patient');
      if (user) {
        // Auto login after register? Or redirect to login?
        // Let's redirect to login for security/verification flow usually, or auto-login.
        // For this demo, let's login directly.
        setUser(user); // Set auth context
        navigate('/patient-portal'); // Redirect to patient portal
      } else {
        setError('Registration failed. Please try again.');
      }
    } catch (err) {
      setError('Registration failed. Email might be in use.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
            <Button variant="ghost" className="w-fit pl-0 mb-2" onClick={() => navigate('/')}>
                <ArrowLeft className="h-4 w-4 mr-2" /> Back
            </Button>
          <CardTitle className="text-2xl font-bold text-center">Patient Registration</CardTitle>
          <CardDescription className="text-center">Create your MediConnect account</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleRegister} className="space-y-4">
            {error && <div className="text-red-500 text-sm text-center bg-red-50 p-2 rounded">{error}</div>}
            
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input id="name" required placeholder="John Doe" value={name} onChange={e => setName(e.target.value)} />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" required placeholder="john@example.com" value={email} onChange={e => setEmail(e.target.value)} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input id="password" type="password" required value={password} onChange={e => setPassword(e.target.value)} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <Input id="confirmPassword" type="password" required value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} />
            </div>

            <Button type="submit" className="w-full bg-green-600 hover:bg-green-700" disabled={loading}>
              {loading ? 'Creating Account...' : 'Register'}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="justify-center">
            <p className="text-sm text-gray-500">
                Already have an account? <Button variant="link" className="p-0" onClick={() => navigate('/login')}>Login here</Button>
            </p>
        </CardFooter>
      </Card>
    </div>
  );
}
