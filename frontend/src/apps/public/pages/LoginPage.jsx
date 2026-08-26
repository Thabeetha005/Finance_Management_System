import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../../shared/context/AuthContext';
import { Mail, Lock, User as UserIcon, AlertCircle, Eye, EyeOff, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const LoginPage = ({ initialMode = 'login' }) => {
  const location = useLocation();
  // isSignUp: false = Sign In view, true = Create Account view
  const [isSignUp, setIsSignUp] = useState(
    initialMode === 'signup' || location.pathname.includes('/register') || location.pathname.includes('/signin')
  );

  // Login Form State
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [showLoginPassword, setShowLoginPassword] = useState(false);

  // Sign Up Form State
  const [signUpName, setSignUpName] = useState('');
  const [signUpEmail, setSignUpEmail] = useState('');
  const [signUpPassword, setSignUpPassword] = useState('');
  const [signUpConfirmPassword, setSignUpConfirmPassword] = useState('');
  const [showSignUpPassword, setShowSignUpPassword] = useState(false);

  // Feedback & Loading
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const { login, register } = useAuth();
  const navigate = useNavigate();

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');
    setIsLoading(true);

    const result = await login(loginEmail, loginPassword);
    setIsLoading(false);

    if (result.success) {
      const role = (result.role || '').toUpperCase();
      if (role === 'ADMIN') {
        navigate('/admin');
      } else if (role === 'CONSULTANT') {
        navigate('/consultant');
      } else {
        navigate('/profile');
      }
    } else {
      setError(result.message || 'Invalid email or password.');
    }
  };

  const handleSignUpSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');

    if (signUpPassword !== signUpConfirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    if (signUpPassword.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    setIsLoading(true);

    const result = await register(signUpName, signUpEmail, signUpPassword);
    setIsLoading(false);

    if (result.success) {
      const role = (result.role || '').toUpperCase();
      if (role === 'ADMIN') {
        navigate('/admin');
      } else if (role === 'CONSULTANT') {
        navigate('/consultant');
      } else {
        navigate('/profile');
      }
    } else {
      setError(result.message || 'Registration failed. Please try again.');
    }
  };

  const toggleMode = (targetSignUp) => {
    setError('');
    setSuccessMsg('');
    setIsSignUp(targetSignUp);
  };

  return (
    <div className="min-h-screen bg-[#041d16] relative overflow-hidden flex flex-col justify-center items-center py-8 px-4 sm:px-6 lg:px-8 font-sans selection:bg-[#073828] selection:text-white">
      {/* Subtle ambient glow background */}
      <div className="absolute top-1/4 left-1/3 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-emerald-700/10 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-10 right-1/4 w-[500px] h-[500px] bg-teal-600/10 rounded-full blur-[120px] pointer-events-none" />



      {/* Outer Card Shell with light warm cream interior background */}
      <div className="relative z-10 w-full max-w-4xl min-h-[600px] bg-[#f5f0e6] rounded-[32px] shadow-2xl shadow-emerald-950/80 overflow-hidden flex flex-col md:flex-row border border-[#e3d7c3]/60">
        
        {/* ==================== WHITE/CREAM BANNER - FORM 1: SIGN IN ==================== */}
        <div className={`w-full md:w-1/2 p-8 sm:p-10 pr-4 sm:pr-6 flex flex-col justify-between text-[#0d2b20] transition-all duration-500 ${isSignUp ? 'opacity-0 pointer-events-none md:opacity-100 md:pointer-events-none' : 'opacity-100'}`}>
          <div className="w-full max-w-[290px] sm:max-w-[320px]">
            <div className="mb-6">
              <h2 className="text-3xl sm:text-4xl font-extrabold text-[#0d2b20] tracking-tight">
                Sign in
              </h2>
              <div className="w-12 h-[3px] bg-[#9e824c] rounded-full mt-2 mb-2" />
              <p className="text-sm text-[#0d2b20]/75 font-normal">
                Welcome back to your financial advisory portal.
              </p>
            </div>

            {!isSignUp && error && (
              <div className="mb-5 bg-red-50 border-l-4 border-red-500 p-3.5 rounded-r-xl flex items-start gap-2.5">
                <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
                <p className="text-xs text-red-800 font-medium">{error}</p>
              </div>
            )}

            <form onSubmit={handleLoginSubmit} className="space-y-5">
              <div>
                <label className="block text-xs font-semibold text-[#0d2b20]/80 uppercase tracking-wider mb-2">
                  Email address
                </label>
                <div className="relative border-b-2 border-[#0d2b20]/20 focus-within:border-[#0d2b20] transition-colors pb-1">
                  <Mail className="absolute left-0 top-1/2 -translate-y-1/2 w-4 h-4 text-[#0d2b20]/60 pointer-events-none" />
                  <input
                    type="email"
                    required
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    className="w-full bg-transparent text-[#0d2b20] placeholder-[#0d2b20]/40 text-sm outline-none py-1.5 font-medium pl-6 pr-2"
                    placeholder="name@example.com"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#0d2b20]/80 uppercase tracking-wider mb-2">
                  Password
                </label>
                <div className="relative border-b-2 border-[#0d2b20]/20 focus-within:border-[#0d2b20] transition-colors pb-1">
                  <Lock className="absolute left-0 top-1/2 -translate-y-1/2 w-4 h-4 text-[#0d2b20]/60 pointer-events-none" />
                  <input
                    type={showLoginPassword ? "text" : "password"}
                    required
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    className="w-full bg-transparent text-[#0d2b20] placeholder-[#0d2b20]/40 text-sm outline-none py-1.5 font-medium pl-6 pr-8"
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowLoginPassword(!showLoginPassword)}
                    className="absolute right-0 top-1/2 -translate-y-1/2 text-[#0d2b20]/50 hover:text-[#0d2b20] transition-colors cursor-pointer p-1"
                  >
                    {showLoginPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="pt-4">
                <button
                  type="submit"
                  disabled={isLoading || isSignUp}
                  className="w-full py-3.5 px-6 rounded-full font-semibold text-base text-white bg-[#063726] hover:bg-[#032318] active:scale-[0.99] shadow-lg transition-all duration-300 cursor-pointer disabled:opacity-50"
                >
                  {isLoading ? 'Signing in...' : 'Sign in'}
                </button>
              </div>
            </form>
          </div>

          <div className="mt-8 pt-4 w-full max-w-[290px] sm:max-w-[320px] text-center flex items-center justify-center">
            <p className="text-sm text-[#0d2b20]/80 font-normal text-center w-full">
              Don't have an account?{' '}
              <button
                type="button"
                onClick={() => toggleMode(true)}
                className="font-bold text-[#063726] hover:underline underline-offset-4 cursor-pointer transition-all"
              >
                Create account
              </button>
            </p>
          </div>
        </div>

        {/* ==================== WHITE/CREAM BANNER - FORM 2: CREATE ACCOUNT ==================== */}
        <div className={`w-full md:w-1/2 p-8 sm:p-10 pl-6 sm:pl-10 flex flex-col justify-between text-[#0d2b20] transition-all duration-500 ${!isSignUp ? 'opacity-0 pointer-events-none md:opacity-100 md:pointer-events-none' : 'opacity-100'}`}>
          <div className="w-full max-w-[300px] sm:max-w-[330px] ml-auto">
            <div className="mb-4">
              <h2 className="text-3xl sm:text-4xl font-extrabold text-[#0d2b20] tracking-tight">
                Create <span className="font-serif italic font-normal text-[#0d2b20]">account</span>
              </h2>
              <div className="w-12 h-[3px] bg-[#9e824c] rounded-full mt-2 mb-2" />
              <p className="text-sm text-[#0d2b20]/75 font-normal">
                One account for all your wealth & advisory solutions.
              </p>
            </div>

            {isSignUp && error && (
              <div className="mb-4 bg-red-50 border-l-4 border-red-500 p-3 rounded-r-xl flex items-start gap-2.5">
                <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
                <p className="text-xs text-red-800 font-medium">{error}</p>
              </div>
            )}

            {isSignUp && successMsg && (
              <div className="mb-4 bg-emerald-50 border-l-4 border-emerald-600 p-3 rounded-r-xl flex items-start gap-2.5">
                <CheckCircle2 className="w-5 h-5 text-emerald-700 mt-0.5 flex-shrink-0" />
                <p className="text-xs text-emerald-800 font-medium">{successMsg}</p>
              </div>
            )}

            <form onSubmit={handleSignUpSubmit} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-[#0d2b20]/80 uppercase tracking-wider mb-1">
                  Full name
                </label>
                <div className="relative border-b-2 border-[#0d2b20]/20 focus-within:border-[#0d2b20] transition-colors pb-1">
                  <UserIcon className="absolute left-0 top-1/2 -translate-y-1/2 w-4 h-4 text-[#0d2b20]/60 pointer-events-none" />
                  <input
                    type="text"
                    required
                    value={signUpName}
                    onChange={(e) => setSignUpName(e.target.value)}
                    className="w-full bg-transparent text-[#0d2b20] placeholder-[#0d2b20]/40 text-sm outline-none py-1 font-medium pl-6 pr-2"
                    placeholder="John Doe"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#0d2b20]/80 uppercase tracking-wider mb-1">
                  Email address
                </label>
                <div className="relative border-b-2 border-[#0d2b20]/20 focus-within:border-[#0d2b20] transition-colors pb-1">
                  <Mail className="absolute left-0 top-1/2 -translate-y-1/2 w-4 h-4 text-[#0d2b20]/60 pointer-events-none" />
                  <input
                    type="email"
                    required
                    value={signUpEmail}
                    onChange={(e) => setSignUpEmail(e.target.value)}
                    className="w-full bg-transparent text-[#0d2b20] placeholder-[#0d2b20]/40 text-sm outline-none py-1 font-medium pl-6 pr-2"
                    placeholder="name@example.com"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#0d2b20]/80 uppercase tracking-wider mb-1">
                  Password
                </label>
                <div className="relative border-b-2 border-[#0d2b20]/20 focus-within:border-[#0d2b20] transition-colors pb-1">
                  <Lock className="absolute left-0 top-1/2 -translate-y-1/2 w-4 h-4 text-[#0d2b20]/60 pointer-events-none" />
                  <input
                    type={showSignUpPassword ? "text" : "password"}
                    required
                    value={signUpPassword}
                    onChange={(e) => setSignUpPassword(e.target.value)}
                    className="w-full bg-transparent text-[#0d2b20] placeholder-[#0d2b20]/40 text-sm outline-none py-1 font-medium pl-6 pr-8"
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowSignUpPassword(!showSignUpPassword)}
                    className="absolute right-0 top-1/2 -translate-y-1/2 text-[#0d2b20]/50 hover:text-[#0d2b20] transition-colors cursor-pointer p-1"
                  >
                    {showSignUpPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                <p className="text-[11px] text-[#0d2b20]/50 mt-1 font-normal">Use 8 characters or more.</p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#0d2b20]/80 uppercase tracking-wider mb-1">
                  Confirm Password
                </label>
                <div className="relative border-b-2 border-[#0d2b20]/20 focus-within:border-[#0d2b20] transition-colors pb-1">
                  <Lock className="absolute left-0 top-1/2 -translate-y-1/2 w-4 h-4 text-[#0d2b20]/60 pointer-events-none" />
                  <input
                    type="password"
                    required
                    value={signUpConfirmPassword}
                    onChange={(e) => setSignUpConfirmPassword(e.target.value)}
                    className="w-full bg-transparent text-[#0d2b20] placeholder-[#0d2b20]/40 text-sm outline-none py-1 font-medium pl-6 pr-2"
                    placeholder="••••••••"
                  />
                </div>
              </div>

              <div className="pt-3">
                <button
                  type="submit"
                  disabled={isLoading || !isSignUp}
                  className="w-full py-3.5 px-6 rounded-full font-semibold text-base text-white bg-[#063726] hover:bg-[#032318] active:scale-[0.99] shadow-lg transition-all duration-300 cursor-pointer disabled:opacity-50"
                >
                  {isLoading ? 'Creating account...' : 'Create account'}
                </button>
              </div>
            </form>
          </div>

          <div className="mt-8 pt-2 w-full max-w-[300px] sm:max-w-[330px] ml-auto text-center flex items-center justify-center">
            <p className="text-sm text-[#0d2b20]/80 font-normal text-center w-full">
              Already have an account?{' '}
              <button
                type="button"
                onClick={() => toggleMode(false)}
                className="font-bold text-[#063726] hover:underline underline-offset-4 cursor-pointer transition-all"
              >
                Sign in
              </button>
            </p>
          </div>
        </div>

        {/* ==================== THE DARK GREEN SLANTING BANNER OVERLAY ==================== */}
        {/* 
          - Shifted to x: '74%' in Sign In mode so the slanting edge sits further back (rightwards), leaving full breathing room for the form!
        */}
        <motion.div
          initial={false}
          animate={{
            x: isSignUp ? '-26%' : '74%',
            skewX: -12,
          }}
          transition={{ duration: 0.7, ease: [0.65, 0, 0.35, 1] }}
          className="hidden md:block absolute top-0 left-0 w-[65%] h-[130%] -top-[15%] z-20 overflow-hidden shadow-2xl bg-gradient-to-br from-[#032318] via-[#063726] to-[#021810] border-l-2 border-r-2 border-amber-300/80 pointer-events-auto"
        >
          {/* Glowing gold slanted seam line on the left edge */}
          <div className="absolute top-0 left-0 w-1.5 h-full bg-gradient-to-b from-amber-300/90 via-emerald-400/70 to-amber-400/90 shadow-[0_0_20px_rgba(251,191,36,0.9)] z-30" />

          {/* Glowing gold slanted seam line on the right edge */}
          <div className="absolute top-0 right-0 w-1.5 h-full bg-gradient-to-b from-amber-300/90 via-emerald-400/70 to-amber-400/90 shadow-[0_0_20px_rgba(251,191,36,0.9)] z-30" />

          {/* Counter-skewed wrapper (skewX: 12) */}
          <div 
            className="w-full h-full flex flex-col justify-between p-14 pt-28 pb-20 select-none relative z-10 text-white"
            style={{
              transform: 'skewX(12deg)', // Counter-skewing to keep text and copy straight
            }}
          >
            <AnimatePresence mode="wait">
              {isSignUp ? (
                <motion.div
                  key="signup-blade-text"
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  transition={{ duration: 0.35 }}
                  className="flex flex-col justify-between h-full pl-36 sm:pl-44 pr-14"
                >
                  <div className="space-y-6 pt-2">
                    <span className="text-xs uppercase tracking-[0.25em] font-mono text-amber-200/90 font-bold">
                      KALPANAAA
                    </span>
                    <h3 className="text-4xl font-extrabold text-white leading-[1.15] tracking-tight">
                      Start the <br />
                      <span className="text-amber-100 font-serif italic font-normal">first page.</span>
                    </h3>
                    <p className="text-sm text-emerald-100/75 leading-relaxed max-w-[260px] font-light">
                      One account for every board, every draft and every device you own.
                    </p>
                  </div>

                  <div className="pb-2">
                    <div className="w-12 h-0.5 bg-amber-300/50 rounded-full" />
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  key="login-blade-text"
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  transition={{ duration: 0.35 }}
                  className="flex flex-col justify-between h-full pl-14 sm:pl-16 pr-10"
                >
                  <div className="space-y-6 pt-2">
                    <span className="text-xs uppercase tracking-[0.25em] font-mono text-amber-200/90 font-bold">
                      KALPANAAA
                    </span>
                    <h3 className="text-4xl font-extrabold text-white leading-[1.15] tracking-tight">
                      Welcome <br />
                      <span className="text-amber-100 font-serif italic font-normal">back.</span>
                    </h3>
                    <p className="text-sm text-emerald-100/75 leading-relaxed max-w-[270px] font-light">
                      Sign in to manage your digital wealth, investments, and financial advisory sessions.
                    </p>
                  </div>

                  <div className="pb-2">
                    <div className="w-12 h-0.5 bg-amber-300/50 rounded-full" />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>

      </div>

      {/* Footer Disclaimer */}
      <div className="mt-8 text-center text-xs text-emerald-200/40">
        &copy; {new Date().getFullYear()} Kalpanaaa Finance. All rights reserved. 256-Bit SSL Encrypted Access.
      </div>
    </div>
  );
};

export default LoginPage;
