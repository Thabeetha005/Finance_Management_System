import React, { useState } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import api from '../../api/axios';
import { useAuth } from '../../context/AuthContext';
import { 
  LayoutDashboard, 
  Users, 
  FileText, 
  Shield, 
  LogOut, 
  Menu, 
  X, 
  ArrowLeft, 
  HelpCircle,
  Bell,
  CreditCard,
  Video,
  ChevronDown,
  User as UserIcon,
  Settings,
  Lock
} from 'lucide-react';

const AdminLayout = () => {
  const { logout, user } = useAuth();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const navigate = useNavigate();

  // Query live admin profile from backend DB
  const { data: adminProfile } = useQuery({
    queryKey: ['adminProfile'],
    queryFn: async () => {
      const res = await api.get('/admin/profile');
      return res.data;
    },
    enabled: !!localStorage.getItem('token')
  });

  const navigation = [
    { name: 'Dashboard', href: '/admin', icon: LayoutDashboard },
    { name: 'All Customers', href: '/admin/users', icon: Users },
    { name: 'Consultants', href: '/admin/consultants', icon: Users },
    { name: 'Verification Queue', href: '/admin/verification-queue', icon: Shield },
    { name: 'Financial Approvals', href: '/admin/approvals', icon: CreditCard },
    { name: 'Blogs', href: '/admin/blogs', icon: FileText },
    { name: 'Consultations', href: '/admin/consultations', icon: Video },
    { name: 'Support Tickets', href: '/admin/support', icon: HelpCircle },
    { name: 'Announcements', href: '/admin/notifications', icon: Bell },
    { name: 'Audit Logs', href: '/admin/audit-logs', icon: Shield },
  ];

  const handleBack = () => {
    navigate(-1);
  };

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 z-20 bg-black bg-opacity-50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
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
              <span className="text-[10px] font-semibold text-gold tracking-widest uppercase">Admin Portal</span>
            </div>
          </Link>
          <button onClick={() => setSidebarOpen(false)} className="lg:hidden text-gray-300 hover:text-white">
            <X size={20} />
          </button>
        </div>
        <div className="overflow-y-auto py-4 h-[calc(100vh-4rem)] hide-scrollbar">
          <nav className="px-3 space-y-1">
            {navigation.map((item) => {
              const isActive = location.pathname === item.href || (location.pathname.startsWith(item.href) && item.href !== '/admin');
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
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Navbar */}
        <header className="flex-shrink-0 flex items-center justify-between h-16 px-4 bg-white shadow-sm lg:px-8 z-10">
          <div className="flex items-center flex-1">
            <button 
              className="lg:hidden p-2 text-gray-500 rounded-md hover:bg-gray-100 transition-colors mr-4"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu size={24} />
            </button>
            
            {/* Back Button */}
            <button 
              onClick={handleBack}
              className="hidden md:flex items-center gap-2 px-4 py-2 bg-gray-50 border border-gray-200 rounded-full text-sm font-medium text-gray-700 hover:bg-gray-100 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Back
            </button>
          </div>
          
          <div className="flex-1 px-4 flex justify-end">
            <div className="relative">
              <button 
                onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                className="flex items-center gap-3 hover:bg-gray-100 px-3 py-1.5 rounded-xl transition-colors cursor-pointer border border-gray-200"
              >
                <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#12241F] via-[#106354] to-[#887333] border border-[#D4AF37]/50 flex items-center justify-center text-white font-bold text-xs shadow-sm">
                  {((adminProfile?.name || user?.name || 'A')[0]).toUpperCase()}
                </div>
                <div className="flex flex-col text-left hidden sm:block">
                  <span className="text-sm font-bold text-[#12241F] leading-none">
                    {adminProfile?.name || user?.name || 'Admin User'}
                  </span>
                  <span className="text-[10px] text-gray-500 font-medium leading-none mt-1">
                    @{adminProfile?.username || 'admin'}
                  </span>
                </div>
                <ChevronDown className="w-4 h-4 text-gray-500 hidden sm:block" />
              </button>

              {profileDropdownOpen && (
                <>
                  <div 
                    className="fixed inset-0 z-10" 
                    onClick={() => setProfileDropdownOpen(false)} 
                  />
                  <div className="absolute right-0 mt-2 w-60 bg-white rounded-2xl shadow-xl border border-gray-100 py-2 z-20 animate-in fade-in zoom-in-95 duration-150">
                    <div className="px-4 py-3 border-b border-gray-100 bg-gray-50/50 rounded-t-2xl">
                      <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Signed in as</p>
                      <p className="text-sm font-bold text-gray-900 truncate mt-0.5">{adminProfile?.email || user?.email}</p>
                      <span className="inline-block mt-1 px-2 py-0.5 text-[10px] font-semibold text-emerald-800 bg-emerald-50 rounded-full border border-emerald-200">
                        Role: {adminProfile?.role || 'ADMIN'}
                      </span>
                    </div>

                    <div className="py-1">
                      <Link
                        to="/admin/profile"
                        onClick={() => setProfileDropdownOpen(false)}
                        className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-emerald-50 hover:text-[#12241F] font-medium transition-colors"
                      >
                        <UserIcon className="w-4 h-4 text-[#106354]" />
                        My Profile
                      </Link>
                      <Link
                        to="/admin/settings"
                        onClick={() => setProfileDropdownOpen(false)}
                        className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-amber-50 hover:text-[#12241F] font-medium transition-colors"
                      >
                        <Settings className="w-4 h-4 text-[#887333]" />
                        Account Settings
                      </Link>
                      <Link
                        to="/admin/profile?tab=password"
                        onClick={() => setProfileDropdownOpen(false)}
                        className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-emerald-50 hover:text-[#12241F] font-medium transition-colors"
                      >
                        <Lock className="w-4 h-4 text-emerald-600" />
                        Change Password
                      </Link>
                    </div>

                    <div className="border-t border-gray-100 pt-1">
                      <button
                        onClick={() => {
                          setProfileDropdownOpen(false);
                          logout();
                        }}
                        className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 font-medium transition-colors text-left"
                      >
                        <LogOut className="w-4 h-4" />
                        Logout
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-auto bg-gray-50/50 p-4 md:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
