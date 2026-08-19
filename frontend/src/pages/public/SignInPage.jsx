import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
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
    <div className="min-h-screen bg-brandWhite-off flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <a href="/" className="flex items-center justify-center gap-3">
          <img src="/kalpanaa-logo-new.png" alt="Kalpanaaa Finance" className="w-[24rem] md:w-[32rem] h-24 md:h-28 object-contain" />
        </a>
        <h2 className="mt-6 text-center text-3xl font-extrabold text-brandBlack">
          Create a new account
        </h2>
        <p className="mt-2 text-center text-sm text-brandBlack-muted">
          Already have an account?{' '}
          <Link to="/login" className="font-medium text-primary hover:text-primary-hover transition-colors">
            Log in instead
          </Link>
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10 border border-gray-100">
          
          {error && (
            <div className="mb-4 bg-red-50 border-l-4 border-red-500 p-4 flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-500 mt-0.5" />
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          {successMsg && (
            <div className="mb-4 bg-green-50 border-l-4 border-green-500 p-4 flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-green-500 mt-0.5" />
              <p className="text-sm text-green-700">{successMsg}</p>
            </div>
          )}

          <form className="space-y-5" onSubmit={handleSubmit}>
            
            {/* Username / Name */}
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-brandBlack-muted">
                Full Name
              </label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="name"
                  name="name"
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="focus:ring-primary focus:border-primary block w-full pl-10 sm:text-sm border-gray-300 rounded-md py-3 border outline-none transition-colors"
                  placeholder="John Doe"
                />
              </div>
            </div>

            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-brandBlack-muted">
                Email address
              </label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="focus:ring-primary focus:border-primary block w-full pl-10 sm:text-sm border-gray-300 rounded-md py-3 border outline-none transition-colors"
                  placeholder="you@example.com"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-brandBlack-muted">
                Password
              </label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="new-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="focus:ring-primary focus:border-primary block w-full pl-10 sm:text-sm border-gray-300 rounded-md py-3 border outline-none transition-colors"
                  placeholder="••••••••"
                />
              </div>
            </div>

            {/* Confirm Password */}
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-brandBlack-muted">
                Confirm Password
              </label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  autoComplete="new-password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="focus:ring-primary focus:border-primary block w-full pl-10 sm:text-sm border-gray-300 rounded-md py-3 border outline-none transition-colors"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-bold tracking-wider text-white bg-primary hover:bg-primary-hover focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary uppercase transition-all duration-300 disabled:opacity-70 disabled:cursor-not-allowed group"
              >
                {isLoading ? 'Creating account...' : 'Create Account'}
                {!isLoading && <ArrowRight className="w-4 h-4 ml-2 transform group-hover:translate-x-1 transition-transform" />}
              </button>
            </div>
          </form>
          
          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-copper font-medium tracking-wider text-xs uppercase">
                  Secure Portal Access
                </span>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default SignInPage;
