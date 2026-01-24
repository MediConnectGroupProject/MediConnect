import React from 'react';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';
import { useNavigate } from 'react-router-dom';
import { Activity, Heart, Shield, Clock, Phone, Mail, MapPin } from 'lucide-react';
import logo from '../assets/logo-mediconnect.png';
import { useSystemSettings } from '../context/SystemSettingsContext';

export default function LandingPage() {
  const navigate = useNavigate();
  const { settings, loading } = useSystemSettings();

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="fixed w-full z-50 bg-white/80 backdrop-blur-md border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-2">
              <img src={logo} alt="MediConnect" className="h-12 w-auto" />
              <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent hidden sm:block">
                 {loading ? '...' : settings.hospitalName}
              </span>
            </div>
            <div className="hidden md:flex items-center space-x-8">
              <a href="#features" className="text-gray-600 hover:text-blue-600 transition-colors">Services</a>
              <a href="#about" className="text-gray-600 hover:text-blue-600 transition-colors">About Us</a>
              <a href="#contact" className="text-gray-600 hover:text-blue-600 transition-colors">Contact</a>
            </div>
            <div className="flex items-center gap-4">
              <Button variant="ghost" className="text-gray-600 hover:text-blue-600" onClick={() => navigate('/login')}>
                Log In
              </Button>
              <Button className="bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-200" onClick={() => navigate('/register')}>
                Register Now
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="relative pt-24 pb-16 lg:pt-32 lg:pb-24 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="lg:grid lg:grid-cols-12 lg:gap-16 items-center">
            <div className="lg:col-span-6 text-center lg:text-left">
              <h1 className="text-4xl lg:text-5xl xl:text-6xl font-extrabold text-gray-900 tracking-tight mb-6">
                Your Health, <br/>
                <span className="text-blue-600">Reimagined.</span>
              </h1>
              <p className="text-lg lg:text-xl text-gray-500 mb-8 max-w-2xl mx-auto lg:mx-0">
                Experience the future of healthcare with {loading ? 'MediConnect' : settings.hospitalName}. 
                Seamlessly manage appointments, prescriptions, and medical records 
                in one secure platform.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                <Button size="lg" className="bg-blue-600 hover:bg-blue-700 text-lg px-8 py-6 h-auto shadow-xl shadow-blue-200" onClick={() => navigate('/register')}>
                  Get Started - It's Free
                </Button>
                <Button size="lg" variant="outline" className="text-lg px-8 py-6 h-auto border-gray-300 hover:bg-gray-50 text-gray-700" onClick={() => navigate('/login')}>
                  Patient Login
                </Button>
              </div>
              <div className="mt-10 flex items-center justify-center lg:justify-start gap-6 text-sm text-gray-500">
                <div className="flex items-center gap-2">
                  <Shield className="h-5 w-5 text-green-500" />
                  <span>HIPAA Compliant</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="h-5 w-5 text-blue-500" />
                  <span>24/7 Access</span>
                </div>
              </div>
            </div>
            <div className="lg:col-span-6 mt-12 lg:mt-0 relative">
               <div className="relative rounded-2xl shadow-2xl overflow-hidden ring-1 ring-gray-900/10">
                  <img 
                    src="/hero-banner.png" 
                    alt="Modern Healthcare" 
                    className="w-full h-auto object-cover transform hover:scale-105 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-gray-900/20 to-transparent"></div>
               </div>
               
               {/* Floating Card Example */}
               <div className="absolute -bottom-6 -left-6 bg-white p-4 rounded-xl shadow-xl hidden md:block animate-bounce-slow">
                  <div className="flex items-center gap-3">
                     <div className="bg-green-100 p-2 rounded-full">
                        <Heart className="h-6 w-6 text-green-600" />
                     </div>
                     <div>
                        <p className="text-sm font-semibold text-gray-900">Total Patients</p>
                        <p className="text-xs text-gray-500">Serving 10,000+</p>
                     </div>
                  </div>
               </div>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <section id="features" className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Why Choose {loading ? 'MediConnect' : settings.hospitalName}?</h2>
            <p className="text-gray-500 max-w-2xl mx-auto">We bring the hospital to your fingertips. Manage your entire healthcare journey with our comprehensive suite of tools.</p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <FeatureCard 
              icon={<Clock className="h-6 w-6 text-white" />}
              color="bg-blue-500"
              title="Easy Scheduling"
              description="Book appointments with top specialists in seconds. View availability in real-time."
            />
            <FeatureCard 
              icon={<Shield className="h-6 w-6 text-white" />}
              color="bg-teal-500"
              title="Secure Records"
              description="Your medical history is safe with us. Access reports and prescriptions anytime."
            />
             <FeatureCard 
              icon={<Heart className="h-6 w-6 text-white" />}
              color="bg-rose-500"
              title="Personalized Care"
              description="Receive tailored health insights and reminders for your medications."
            />
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer id="contact" className="bg-gray-900 text-white pt-16 pb-8">
         <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
               <div className="col-span-1 md:col-span-2">
                  <div className="flex items-center gap-2 mb-4">
                     <img src={logo} alt="MediConnect" className="h-12 w-auto" />
                     <span className="text-xl font-bold text-white">
                        {loading ? '' : settings.hospitalName}
                     </span>
                  </div>
                  <p className="text-gray-400 max-w-sm">
                     Empowering patients and providers with next-generation digital healthcare solutions. 
                     Join us in building a healthier tomorrow.
                  </p>
               </div>
               <div>
                  <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
                  <ul className="space-y-2 text-gray-400">
                     <li><a href="#" className="hover:text-blue-400 transition-colors">Home</a></li>
                     <li><a href="#features" className="hover:text-blue-400 transition-colors">Services</a></li>
                     <li><a href="/login" className="hover:text-blue-400 transition-colors">Patient Portal</a></li>
                     <li><a href="/login" className="hover:text-blue-400 transition-colors">Staff Login</a></li>
                  </ul>
               </div>
               <div>
                  <h3 className="text-lg font-semibold mb-4">Contact</h3>
                   <ul className="space-y-4 text-gray-400">
                     <li className="flex items-center gap-3">
                        <MapPin className="h-5 w-5 text-blue-400" />
                        <span>{loading ? '123 Health Avenue, Med City' : settings.hospitalAddress}</span>
                     </li>
                     <li className="flex items-center gap-3">
                        <Phone className="h-5 w-5 text-blue-400" />
                        <span>{loading ? '+1 (555) 123-4567' : settings.hospitalPhone}</span>
                     </li>
                      <li className="flex items-center gap-3">
                        <Mail className="h-5 w-5 text-blue-400" />
                        <span>{loading ? 'support@mediconnect.com' : settings.supportEmail}</span>
                     </li>
                  </ul>
               </div>
            </div>
            <div className="border-t border-gray-800 pt-8 text-center text-gray-500 text-sm">
               © {new Date().getFullYear()} {loading ? 'MediConnect' : settings.hospitalName}. All rights reserved.
            </div>
         </div>
      </footer>
    </div>
  );
}

function FeatureCard({ icon, color, title, description }: { icon: React.ReactNode, color: string, title: string, description: string }) {
  return (
    <Card className="border-none shadow-lg hover:shadow-xl transition-shadow duration-300">
      <CardContent className="p-8 text-center">
        <div className={`h-14 w-14 ${color} rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-md`}>
          {icon}
        </div>
        <h3 className="text-xl font-bold text-gray-900 mb-3">{title}</h3>
        <p className="text-gray-500 leading-relaxed">{description}</p>
      </CardContent>
    </Card>
  )
}
