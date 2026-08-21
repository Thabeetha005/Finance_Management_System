import { useState } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../../shared/context/AuthContext';
import { 
  LayoutDashboard, 
  Wallet, 
  ArrowLeftRight, 
  Users, 
  Settings, 
  Bell, 
  Search, 
  Menu, 
  X,
  LogOut,
  ChevronDown,
  FileText,
  Tags,
  ShieldCheck,
  UserCheck,
  MessageSquare,
  FileCheck,
  HelpCircle,
  Mail,
  Briefcase
} from 'lucide-react';

export default function AdminLayout() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const { user, logout } = useAuth();
  const location = useLocation();

  const navigation = [
    { name: 'Dashboard', href: '/admin', icon: LayoutDashboard, exact: true },
    { name: 'Customers', href: '/admin/users', icon: Users },
    { name: 'Consultants', href: '/admin/consultants', icon: Briefcase },
    { name: 'Consultations', href: '/admin/consultations', icon: MessageSquare },
    { name: 'Loan and Approvals', href: '/admin/loans', icon: FileCheck },
    { name: 'Blogs', href: '/admin/blogs', icon: FileText },
    { name: 'KYC Verification', href: '/admin/verifications', icon: UserCheck },
    { name: 'Announcements', href: '/admin/announcements', icon: Bell },
    { name: 'Contact Requests', href: '/admin/contact-requests', icon: Mail },
    { name: 'Support Tickets', href: '/admin/support', icon: HelpCircle },
    { name: 'Audit Logs', href: '/admin/audit-logs', icon: ShieldCheck },
    { name: 'Accounts', href: '/admin/accounts', icon: Wallet },
    { name: 'Transactions', href: '/admin/transactions', icon: ArrowLeftRight },
    { name: 'Settings', href: '/admin/settings', icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex font-sans text-gray-900">
      {/* Sidebar */}
      <aside 
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-[#051e17] text-white transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0 flex flex-col justify-between ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div>
          <div className="flex items-center justify-between h-20 px-6 border-b border-white/10">
            <Link to="/" className="flex items-center">
              <img src="/kalpanaaa-logo-new.png" alt="Kalpanaaa" className="h-10 w-auto object-contain" />
            </Link>
            <button 
              onClick={() => setIsSidebarOpen(false)}
              className="lg:hidden text-gray-400 hover:text-white"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          <nav className="p-4 space-y-1 overflow-y-auto max-h-[calc(100vh-140px)] scrollbar-thin scrollbar-thumb-white/10">
            {navigation.map((item) => {
              const isActive = item.exact 
                ? location.pathname === item.href 
                : location.pathname.startsWith(item.href);
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  onClick={() => {
                    if (window.innerWidth < 1024) setIsSidebarOpen(false);
                  }}
                  className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all duration-200 ${
                    isActive 
                      ? 'bg-[#106354] text-white shadow-md border-l-4 border-[#D4AF37]' 
                      : 'text-gray-300 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <item.icon className={`w-4 h-4 ${isActive ? 'text-[#D4AF37]' : 'text-gray-400'}`} />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="p-4 border-t border-white/10 bg-[#041913]">
          <button 
            onClick={logout}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold text-red-400 hover:text-white hover:bg-red-950/40 transition-colors cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Topbar */}
        <header className="h-20 bg-white border-b border-gray-200 flex items-center justify-between px-4 sm:px-6 lg:px-8 z-40">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setIsSidebarOpen(true)}
              className="lg:hidden text-gray-500 hover:text-gray-700"
            >
              <Menu className="w-6 h-6" />
            </button>
            
            <div className="hidden md:flex relative max-w-md w-full">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-4 w-4 text-gray-400" />
              </div>
              <input
                type="text"
                className="block w-full pl-9 pr-3 py-2 border border-gray-200 rounded-xl leading-5 bg-gray-50 placeholder-gray-400 focus:outline-none focus:bg-white focus:ring-2 focus:ring-[#106354] focus:border-[#106354] text-xs font-medium transition-colors"
                placeholder="Search transactions, customers, loans..."
              />
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-[#12241F] text-emerald-400 border border-emerald-900 flex items-center justify-center font-bold text-sm shadow-sm">
                {user?.name ? user.name.charAt(0).toUpperCase() : 'A'}
              </div>
              <div className="hidden md:block text-left">
                <p className="text-xs font-bold text-gray-900 leading-tight">{user?.name || 'Admin User'}</p>
                <p className="text-[10px] text-emerald-700 font-semibold leading-tight uppercase tracking-wider">{user?.role || 'Administrator'}</p>
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto bg-[#F8FAFC] p-4 sm:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
      
      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden backdrop-blur-sm"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}
    </div>
  );
}
