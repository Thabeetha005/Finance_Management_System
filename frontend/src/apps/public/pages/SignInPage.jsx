import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../../shared/context/AuthContext';
import { ArrowRight, Lock, Mail, User, AlertCircle, CheckCircle2 } from 'lucide-react';

const SignInPage = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setIsLoading(true);

    const result = await register(name, email, password);
    
    setIsLoading(false);
    
    if (result.success) {
      if (result.role === 'ADMIN' || result.role === 'admin') {
        navigate('/admin');
      } else if (result.role === 'CONSULTANT') {
        navigate('/consultant');
      } else {
        navigate('/profile');
      }
    } else {
      setError(result.message);
    }
  };

  return (
    <div className="min-h-screen bg-[#051e17] relative overflow-hidden flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      {/* Ambient background glow effects */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-emerald-500/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-80 h-80 bg-teal-400/10 rounded-full blur-3xl pointer-events-none" />
      
      <div className="relative z-10 sm:mx-auto sm:w-full sm:max-w-lg px-4">
        {/* Teal Green Glassmorphic Outer Card */}
        <div className="bg-[#082a20]/75 backdrop-blur-xl border border-emerald-500/30 rounded-3xl p-6 sm:p-8 shadow-2xl shadow-emerald-950/80">
          
          {/* Header & Logo inside Teal Glass Container */}
          <div className="sm:mx-auto sm:w-full sm:max-w-md mb-6 text-center">
            <a href="/" className="inline-block transition-transform hover:scale-105 duration-300">
              <img src="/kalpanaaa-logo-new.png" alt="Kalpanaaa Finance" className="h-12 md:h-14 w-auto object-contain mx-auto drop-shadow-lg" />
            </a>

            <h2 className="mt-5 text-center text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Create a new account
            </h2>
            <p className="mt-2 text-center text-sm text-emerald-200/80">
              Already have an account?{' '}
              <Link to="/login" className="font-semibold text-emerald-400 hover:text-emerald-300 transition-colors underline decoration-emerald-400/30 underline-offset-4">
                Log in instead
              </Link>
            </p>
          </div>

          {/* White Form Content Card */}
          <div className="bg-white py-8 px-5 sm:px-8 shadow-xl rounded-2xl border border-gray-100">
            {error && (
              <div className="mb-5 bg-red-50 border-l-4 border-red-500 p-4 rounded-r-md flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" />
                <p className="text-sm text-red-700 font-medium">{error}</p>
              </div>
            )}

            {successMsg && (
              <div className="mb-5 bg-green-50 border-l-4 border-green-500 p-4 rounded-r-md flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                <p className="text-sm text-green-700 font-medium">{successMsg}</p>
              </div>
            )}

            <form className="space-y-5" onSubmit={handleSubmit}>
              
              {/* Username / Name */}
              <div>
                <label htmlFor="name" className="block text-sm font-semibold text-gray-700">
                  Full Name
                </label>
                <div className="mt-1.5 relative rounded-lg shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                    <User className="h-5 w-5 text-emerald-600/70" />
                  </div>
                  <input
                    id="name"
                    name="name"
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="focus:ring-2 focus:ring-emerald-600 focus:border-emerald-600 block w-full pl-10 sm:text-sm border-gray-300 rounded-lg py-3 border outline-none transition-all duration-200 text-gray-900 bg-gray-50/50 focus:bg-white"
                    placeholder="John Doe"
                  />
                </div>
              </div>

              {/* Email */}
              <div>
                <label htmlFor="email" className="block text-sm font-semibold text-gray-700">
                  Email address
                </label>
                <div className="mt-1.5 relative rounded-lg shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-emerald-600/70" />
                  </div>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="focus:ring-2 focus:ring-emerald-600 focus:border-emerald-600 block w-full pl-10 sm:text-sm border-gray-300 rounded-lg py-3 border outline-none transition-all duration-200 text-gray-900 bg-gray-50/50 focus:bg-white"
                    placeholder="you@example.com"
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <label htmlFor="password" className="block text-sm font-semibold text-gray-700">
                  Password
                </label>
                <div className="mt-1.5 relative rounded-lg shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-emerald-600/70" />
                  </div>
                  <input
                    id="password"
                    name="password"
                    type="password"
                    autoComplete="new-password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="focus:ring-2 focus:ring-emerald-600 focus:border-emerald-600 block w-full pl-10 sm:text-sm border-gray-300 rounded-lg py-3 border outline-none transition-all duration-200 text-gray-900 bg-gray-50/50 focus:bg-white"
                    placeholder="••••••••"
                  />
                </div>
              </div>

              {/* Confirm Password */}
              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-semibold text-gray-700">
                  Confirm Password
                </label>
                <div className="mt-1.5 relative rounded-lg shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-emerald-600/70" />
                  </div>
                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type="password"
                    autoComplete="new-password"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="focus:ring-2 focus:ring-emerald-600 focus:border-emerald-600 block w-full pl-10 sm:text-sm border-gray-300 rounded-lg py-3 border outline-none transition-all duration-200 text-gray-900 bg-gray-50/50 focus:bg-white"
                    placeholder="••••••••"
                  />
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full flex justify-center items-center py-3.5 px-4 border border-transparent rounded-lg shadow-lg text-sm font-bold tracking-wider text-white bg-[#064e3b] hover:bg-[#043d2e] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-600 uppercase transition-all duration-300 disabled:opacity-70 disabled:cursor-not-allowed group"
                >
                  {isLoading ? 'Creating account...' : 'Create Account'}
                  {!isLoading && <ArrowRight className="w-4 h-4 ml-2 transform group-hover:translate-x-1 transition-transform" />}
                </button>
              </div>
            </form>
            
            <div className="mt-6">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-200" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-3 bg-white text-emerald-800 font-semibold tracking-wider text-xs uppercase">
                    Secure Portal Access
                  </span>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );

};

export default SignInPage;
