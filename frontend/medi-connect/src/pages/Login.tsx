import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { RouteNames } from '../utils/RouteNames';
import { useAuth } from '../utils/authContext';
import { loginUser } from '../api/authApi';

export default function Login() {

  const navigate = useNavigate();

  // for login form
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null); // for common errors
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const { setUser } = useAuth();

  // login from submission .....
  const handleLogin = async (e: React.FormEvent) => {

    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // REAL API MODE
      const data = await loginUser(email, password);
      // Real API call logic would go here...

      const user = data.user;

      setUser(user as any); // Cast for compatibility if needed or check types
      localStorage.setItem("user", JSON.stringify(user));

      switch (user.primaryRole) {

        case "ADMIN":
          navigate(`${RouteNames.DASHBOARD}/admin`);
          break;

        case "DOCTOR":
          navigate(`${RouteNames.DASHBOARD}/doctor`);
          break;

        case "PHARMACIST":
          navigate(`${RouteNames.DASHBOARD}/pharmacist`);
          break;

        case "RECEPTIONIST":
          navigate(`${RouteNames.DASHBOARD}/receptionist`);
          break;

        case "MLT":
          navigate(`${RouteNames.DASHBOARD}/mlt`);
          break;

        default:
          navigate(`${RouteNames.DASHBOARD}/patient`);
      }

    } catch (err: any) {

      setError(err.message);
    } finally {

      setLoading(false);
    }

  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
            <Card className="w-full max-w-md">
                <CardHeader>
                    <CardTitle className="text-2xl font-bold text-center">Login</CardTitle>
                    <CardDescription className="text-center">Access your MediConnect account</CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleLogin}>
                        <div className="space-y-4">
                            {error && <div className="text-red-500 text-sm text-center bg-red-50 p-2 rounded">{error}</div>}
                            <div className="space-y-2">
                                <Label htmlFor="email">Email</Label>
                                <Input 
                                    id="email" 
                                    type="email" 
                                    placeholder="user@example.com" 
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="password">Password</Label>
                                <Input 
                                    id="password" 
                                    type="password" 
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                />
                            </div>
                            <Button type="submit" className="w-full" disabled={loading}>
                                {loading ? 'Logging in...' : 'Login'}
                            </Button>
                        </div>
                    </form>
                </CardContent>
                <CardFooter className="justify-center flex-col gap-2">
                    <p className="text-sm text-gray-500">
                        Don't have an account? <span className="text-blue-600 cursor-pointer hover:underline" onClick={() => navigate('/register')}>Register as Patient</span>
                    </p>
                    <Button variant="link" size="sm" onClick={() => navigate('/')}>Back to Home</Button>
                </CardFooter>
            </Card>
    </div>
  );
}