import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { GetPrimaryRole } from '../utils/GetPrimaryRole';
import { RouteNames } from '../utils/RouteNames';
import { useAuth } from '../utils/authContext';

export default function Login() {

  const API_URL = `${import.meta.env.VITE_API_URL}/auth`
  const navigate = useNavigate();

  // for login form
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null); // for common errors
  const [loginError, setLoginError] = useState<{ [key: string]: string }>({}); // for zod errors
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // for register form states .....
  const [regError, setRegError] = useState<string | null>(null); // for common errors
  const [fieldErrors, setFieldErrors] = useState<{ [key: string]: string }>({}); // for zod errors
  const [regFirstName, setRegFirstName] = useState("");
  const [regLastName, setRegLastName] = useState("");
  const [regEmail, setRegEmail] = useState("");
  const [regPhone, setRegPhone] = useState("");
  const [regPassword, setRegPassword] = useState("");
  const [regConfirmPassword, setRegConfirmPassword] = useState("");
  const [regSuccessInfo, setRegSuccessInfo] = useState("");

  const { setUser } = useAuth();

  // login from submission .....
  const handleLogin = async (e: React.FormEvent) => {

    e.preventDefault();
    setLoading(true);
    setError(null);
    setLoginError({});

    try {

      const res = await fetch(

        `${API_URL}/login`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          credentials: "include",
          body: JSON.stringify({ email, password })
        }
      );

      const data = await res.json();

      if (!res.ok) {

        if (data.errors?.body) {

          setLoginError(data.errors.body);
          return;
        }

        throw new Error(data.message || data.errors || "Login failed");
      }

      const roles: string[] = data.user.roles?.map(r => r.role.name);
      console.log(data.user);
      const primaryRole = GetPrimaryRole(roles);
      const user = {

        id: data.user.id,
        email: data.user.email,
        roles: roles,
        name: data.user.firstName + " " + data.user.lastName,
        primaryRole: primaryRole
      };

      setUser(user);

      switch (primaryRole) {

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

  // register from submission .....
  const handleRegister = async (e: React.FormEvent) => {

    e.preventDefault();
    setLoading(true);
    setError(null);
    setFieldErrors({});

    try {

      if (regPassword !== regConfirmPassword) {

        throw new Error('Passwords do not match');
      }

      const res = await fetch(
        `${API_URL}/register`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            firstName: regFirstName,
            lastName: regLastName,
            email: regEmail,
            phone: regPhone,
            password: regPassword
          }),
        }
      );

      const data = await res.json();

      if (!res.ok) {

        if (data.errors.body) {

          setFieldErrors(data.errors.body);
          return;
        }

        throw new Error(data.message || 'Registration failed');
      } else if (data.user) {

        setRegSuccessInfo(`Registration successful! Verification email sent to ${regEmail}`);
      }
    } catch (err: any) {

      setRegError(err.message);
    } finally {

      setLoading(false);
    }

  };


  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-[rgba(28,83,142,1)] mb-2">MediConnect</h1>
          <p className="text-gray-600">Your Healthcare Management Platform</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Welcome to MediConnect</CardTitle>
            <CardDescription>Access your healthcare portal</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="login" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger className='cursor-pointer' value="login">Login</TabsTrigger>
                <TabsTrigger className='cursor-pointer' value="register">Register</TabsTrigger>
              </TabsList>

              <TabsContent value="login" className="space-y-4">
                <form onSubmit={handleLogin} className="space-y-4">

                  {error && (

                    <p className="text-red-500 text-sm">{error}</p>
                  )}

                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="Enter your email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                    {loginError.email && <p className="text-red-500 text-sm">{loginError.email}</p>}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="password">Password</Label>
                    <Input
                      id="password"
                      type="password"
                      placeholder="Enter your password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                    {loginError.password && <p className="text-red-500 text-sm">{loginError.password}</p>}
                  </div>
                  <Button disabled={loading} type="submit" className="w-full cursor-pointer text-[rgba(255,255,255,1)] bg-[#376BFF] hover:bg-transparent hover:border hover:border-[#1C398E] hover:text-[#1C398E] hover:font-bold">
                    {loading ? 'Logging in...' : 'Login'}
                  </Button>
                </form>

              </TabsContent>

              <TabsContent value="register" className="space-y-4">
                <form onSubmit={handleRegister} className="space-y-4">

                  {regError && (

                    <p className="text-red-500 text-sm">{regError}</p>
                  )}

                  {regSuccessInfo && (

                    <p className="text-green-500 text-sm">{regSuccessInfo}</p>
                  )}

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="firstName">First Name</Label>
                      <Input
                        id="firstName"
                        placeholder="First name"
                        value={regFirstName}
                        onChange={(e) => setRegFirstName(e.target.value)}
                        required
                      />
                      {fieldErrors.firstName && <p className="text-red-500 text-sm">{fieldErrors.firstName}</p>}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="lastName">Last Name</Label>
                      <Input
                        id="lastName"
                        placeholder="Last name"
                        value={regLastName}
                        onChange={(e) => setRegLastName(e.target.value)}
                        required
                      />
                      {fieldErrors.lastName && <p className="text-red-500 text-sm">{fieldErrors.lastName}</p>}
                    </div>
                  </div>

                  {/* <div className="space-y-2">
                    <Label htmlFor="role">Role</Label>
                    <Select onValueChange={(value) => setRegRole(value.toUpperCase())} defaultValue="patient">
                      <SelectTrigger>
                        <SelectValue placeholder="Select your role" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="patient">Patient</SelectItem>
                        <SelectItem value="doctor">Doctor</SelectItem>
                        <SelectItem value="pharmacist">Pharmacist</SelectItem>
                      </SelectContent>
                    </Select>
                  </div> */}

                  <div className="space-y-2">
                    <Label htmlFor="regEmail">Email</Label>
                    <Input
                      id="regEmail"
                      type="email"
                      placeholder="Enter your email"
                      value={regEmail}
                      onChange={(e) => setRegEmail(e.target.value)}
                      required
                    />
                    {fieldErrors.email && <p className="text-red-500 text-sm">{fieldErrors.email}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input
                      id="phone"
                      type="tel"
                      placeholder="Phone number"
                      value={regPhone}
                      onChange={(e) => setRegPhone(e.target.value)}
                      required
                    />
                    {fieldErrors.phone && <p className="text-red-500 text-sm">{fieldErrors.phone}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="regPassword">Password</Label>
                    <Input
                      id="regPassword"
                      type="password"
                      placeholder="Create password"
                      value={regPassword}
                      onChange={(e) => setRegPassword(e.target.value)}
                      required
                    />
                    {fieldErrors.password && <p className="text-red-500 text-sm">{fieldErrors.password}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword">Confirm Password</Label>
                    <Input
                      id="confirmPassword"
                      type="password"
                      placeholder="Confirm password"
                      value={regConfirmPassword}
                      onChange={(e) => setRegConfirmPassword(e.target.value)}
                      required
                    />
                  </div>

                  <Button disabled={loading} type="submit" className="w-full cursor-pointer">
                    {loading ? 'Registering...' : 'Register'}
                  </Button>
                </form>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}