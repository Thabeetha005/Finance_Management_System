import React, { useState } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { 
  LayoutDashboard, 
  Video,
  LogOut,
  Menu,
  X,
  ArrowLeft,
  FileText,
  PieChart,
  Power,
  ShieldAlert,
  RefreshCw
} from 'lucide-react';
import api from '../../api/axios';
import { toast } from 'react-hot-toast';

const ConsultantLayout = () => {
  const { logout, user } = useAuth();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [profileStatus, setProfileStatus] = useState('ACTIVE');
  const [terminationNotice, setTerminationNotice] = useState(null);
  const [confirmingTermination, setConfirmingTermination] = useState(false);
  const navigate = useNavigate();

  const navigation = [
    { name: 'Dashboard', href: '/consultant', icon: LayoutDashboard },
    { name: 'My Sessions', href: '/consultant/sessions', icon: Video },
    { name: 'Logs', href: '/consultant/logs', icon: FileText },
    { name: 'Reports', href: '/consultant/reports', icon: PieChart },
  ];

  React.useEffect(() => {
    fetchProfileStatus();
  }, []);

  const fetchProfileStatus = async () => {
    try {
      const res = await api.get('/consultant/dashboard/profile');
      if (res.data && res.data.status) {
        setProfileStatus(res.data.status);
      }
      const termRes = await api.get('/consultant/dashboard/termination-status');
      if (termRes.data && termRes.data.isPendingTermination) {
        setTerminationNotice(termRes.data);
      }
    } catch (error) {
      console.error('Failed to fetch profile status:', error);
    }
  };

  const handleConfirmTermination = async () => {
    try {
      setConfirmingTermination(true);
      await api.post('/consultant/dashboard/confirm-termination');
      toast.success('Your consultant account has been deactivated and terminated.');
      logout();
      navigate('/login');
    } catch (err) {
      console.error('Failed to confirm termination:', err);
      toast.error('Failed to confirm termination');
    } finally {
      setConfirmingTermination(false);
    }
  };

  const toggleStatus = async () => {
    const newStatus = profileStatus === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
    try {
      const res = await api.put('/consultant/dashboard/profile', { status: newStatus });
      if (res.data) {
        setProfileStatus(res.data.status);
      }
    } catch (error) {
      console.error('Failed to update status:', error);
    }
  };

  const handleBack = () => {
    navigate(-1);
  };

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      {sidebarOpen && (
        <div 
          className="fixed inset-0 z-20 bg-black bg-opacity-50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <aside 
        className={`fixed inset-y-0 left-0 z-30 w-64 bg-[#12241F] text-white transform transition-transform duration-300 lg:translate-x-0 lg:static lg:inset-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex items-center justify-between h-16 px-6 bg-[#091512] border-b border-emerald/20">
          <Link to="/" className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-emerald via-gold to-copper flex items-center justify-center font-bold text-white shadow-md">
              K
            </div>
            <div className="flex flex-col">
              <span className="text-lg font-bold text-white tracking-tight leading-none">Kalpanaa</span>
              <span className="text-[10px] font-semibold text-gold tracking-widest uppercase">Consultant Portal</span>
            </div>
          </Link>
          <button onClick={() => setSidebarOpen(false)} className="lg:hidden text-gray-300 hover:text-white">
            <X size={20} />
          </button>
        </div>
        <div className="overflow-y-auto py-4 h-[calc(100vh-4rem)] hide-scrollbar">
          <nav className="px-3 space-y-1">
            {navigation.map((item) => {
              const isActive = location.pathname === item.href || (location.pathname.startsWith(item.href) && item.href !== '/consultant');
              const Icon = item.icon;
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`flex items-center px-3 py-2.5 rounded-xl transition-all group ${
                    isActive 
                      ? 'bg-[#106354] text-white font-bold shadow-md border-l-4 border-[#D4AF37]' 
                      : 'text-gray-300 hover:bg-white/5 hover:text-white font-medium'
                  }`}
                >
                  <Icon className={`w-5 h-5 mr-3 flex-shrink-0 ${isActive ? 'text-[#D4AF37]' : 'text-gray-400 group-hover:text-[#D4AF37]'}`} />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </nav>

          <div className="mt-auto absolute bottom-0 left-0 right-0 p-4 border-t border-[#4E8B83]/20 bg-[#0a1411]">
            <div className="flex items-center justify-between px-3 py-3 rounded-xl bg-white/5 border border-white/10">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${profileStatus === 'ACTIVE' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                  <Power className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-sm font-medium text-white">Status</p>
                  <p className={`text-xs ${profileStatus === 'ACTIVE' ? 'text-green-400' : 'text-red-400'}`}>
                    {profileStatus === 'ACTIVE' ? 'Taking Sessions' : 'Not Available'}
                  </p>
                </div>
              </div>
              <button
                onClick={toggleStatus}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${
                  profileStatus === 'ACTIVE' ? 'bg-green-500' : 'bg-gray-600'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    profileStatus === 'ACTIVE' ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
          </div>
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <header className="flex-shrink-0 flex items-center justify-between h-16 px-4 bg-white shadow-sm lg:px-8 z-10">
          <div className="flex items-center flex-1">
            <button 
              className="lg:hidden p-2 text-gray-500 rounded-md hover:bg-gray-100 transition-colors mr-4"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu size={24} />
            </button>
            
            <button 
              onClick={handleBack}
              className="hidden md:flex items-center gap-2 px-4 py-2 bg-gray-50 border border-gray-200 rounded-full text-sm font-medium text-gray-700 hover:bg-gray-100 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Back
            </button>
          </div>
          
          <div className="flex-1 px-4 flex justify-end">
            <div className="flex items-center gap-6">
              <Link to="/consultant/settings" className="flex items-center gap-3 hover:bg-gray-100 px-3 py-1.5 rounded-lg transition-colors cursor-pointer">
                <div className="w-8 h-8 rounded-full border border-gray-200 flex items-center justify-center text-[#12241F] bg-gray-50 font-bold text-xs">
                  {(user?.name || 'C')[0].toUpperCase()}
                </div>
                <span className="text-sm font-bold text-[#12241F] hidden sm:block">
                  {user?.name || 'Consultant User'}
                </span>
              </Link>
              <button 
                onClick={logout} 
                className="inline-flex items-center justify-center p-2 text-gray-500 hover:text-red-600 transition-colors rounded-full hover:bg-red-50"
                title="Logout"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-auto bg-gray-50/50 p-4 md:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>

      {/* ACCOUNT TERMINATION NOTICE POP-UP MODAL */}
      {terminationNotice && terminationNotice.isPendingTermination && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-red-100 text-center space-y-5">
            <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto shadow-inner">
              <ShieldAlert className="w-9 h-9" />
            </div>

            <div>
              <h3 className="text-xl font-extrabold text-gray-900">Account Termination Notice</h3>
              <p className="text-xs text-red-600 font-semibold mt-1">
                Your consultant account has been scheduled for termination by Administration.
              </p>
            </div>

            <div className="p-4 bg-red-50/70 border border-red-200 rounded-2xl text-left text-xs space-y-2">
              <p className="text-[10px] font-bold text-red-800 uppercase tracking-wider">Termination Reason</p>
              <p className="text-red-950 font-bold leading-relaxed">
                "{terminationNotice.reason || 'Account termination initiated by Admin'}"
              </p>
            </div>

            <p className="text-xs text-gray-500 font-medium leading-relaxed">
              Your account is currently pending deactivation. Once you acknowledge this notice, your account will be deactivated and permanently removed.
            </p>

            <button
              onClick={handleConfirmTermination}
              disabled={confirmingTermination}
              className="w-full py-3.5 bg-red-600 hover:bg-red-700 text-white font-bold rounded-2xl text-xs shadow-lg shadow-red-600/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              {confirmingTermination ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Deactivating Account...</span>
                </>
              ) : (
                <>
                  <LogOut className="w-4 h-4" />
                  <span>Confirm Termination & Log Out</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ConsultantLayout;
