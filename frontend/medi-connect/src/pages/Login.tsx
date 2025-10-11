import {Card, CardContent, CardDescription, CardHeader, CardTitle} from '../components/card';
import {Button} from '../components/button';
import { Input } from '../components/input';
import { Label } from '../components/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/tabs';

export default function Login() {


    return (
        <div className="min-h-screen flex items-center justify-center px-4 bg-gradient-to-br from-blue-50 to-indigo-100">
            <div className="w-full max-w-md">
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold text-[rgba(28,83,142,1)] mb-2">MediConnect</h1>
                    <p className="text-gray-600">Healthcare Management Platform</p>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Welcome to MediConnect</CardTitle>
                        <CardDescription>Access your healthcare portal</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Tabs defaultValue="login" className="w-full">
                            <TabsList className="grid w-full grid-cols-2">
                                <TabsTrigger value="login">Login</TabsTrigger>
                                <TabsTrigger value="register">Register</TabsTrigger>
                            </TabsList>

                            <TabsContent value="login" className="space-y-4">
                                <form className="space-y-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="email">Email</Label>
                                        <Input
                                            id="email"
                                            type="email"
                                            placeholder="Enter your email"
                                            value={""}
                                            required
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="password">Password</Label>
                                        <Input
                                            id="password"
                                            type="password"
                                            placeholder="Enter your password"
                                            value={""}
                                            required
                                        />
                                    </div>
                                    <Button type="submit" className="w-full text-[rgba(255,255,255,1)] bg-[#376BFF] hover:bg-transparent hover:border hover:border-[#1C398E] hover:text-[#1C398E] hover:font-bold">Login</Button>
                                </form>

                            </TabsContent>

                            <TabsContent value="register" className="space-y-4">
                                <form className="space-y-4">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="firstName">First Name</Label>
                                            <Input
                                                id="firstName"
                                                placeholder="First name"
                                                value={""}
                                                required
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="lastName">Last Name</Label>
                                            <Input
                                                id="lastName"
                                                placeholder="Last name"
                                                value={""}
                                                required
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="role">Role</Label>
                                        <Select>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select your role" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="patient">Patient</SelectItem>
                                                <SelectItem value="doctor">Doctor</SelectItem>
                                                <SelectItem value="pharmacist">Pharmacist</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="regEmail">Email</Label>
                                        <Input
                                            id="regEmail"
                                            type="email"
                                            placeholder="Enter your email"
                                            value={""}
                                            required
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="phone">Phone Number</Label>
                                        <Input
                                            id="phone"
                                            type="tel"
                                            placeholder="Phone number"
                                            value={""}
                                            required
                                        />
                                    </div>


                                    <div className="space-y-2">
                                        <Label htmlFor="license">Medical License Number</Label>
                                        <Input
                                            id="license"
                                            placeholder="License number"
                                            value={""}
                                            required
                                        />
                                    </div>


                                    <div className="space-y-2">
                                        <Label htmlFor="regPassword">Password</Label>
                                        <Input
                                            id="regPassword"
                                            type="password"
                                            placeholder="Create password"
                                            value={""}
                                            required
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="confirmPassword">Confirm Password</Label>
                                        <Input
                                            id="confirmPassword"
                                            type="password"
                                            placeholder="Confirm password"
                                            value={""}
                                            required
                                        />
                                    </div>

                                    <Button type="submit" className="w-full">Register</Button>
                                </form>
                            </TabsContent>
                        </Tabs>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}

