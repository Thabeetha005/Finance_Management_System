import { ArrowUpRight, ArrowDownRight, DollarSign, Users, CreditCard, Activity } from 'lucide-react';

export default function Dashboard() {
  const stats = [
    { name: 'Total Revenue', value: '$2.4M', change: '+12.5%', isPositive: true, icon: DollarSign },
    { name: 'Active Users', value: '45,231', change: '+5.2%', isPositive: true, icon: Users },
    { name: 'Transactions', value: '12,450', change: '-2.1%', isPositive: false, icon: CreditCard },
    { name: 'Active Sessions', value: '1,243', change: '+8.4%', isPositive: true, icon: Activity },
  ];

  const recentTransactions = [
    { id: 'TRX-9482', user: 'Acme Corp', amount: '$4,500.00', status: 'Completed', date: '2 mins ago' },
    { id: 'TRX-9483', user: 'Globex Inc', amount: '$1,250.00', status: 'Pending', date: '15 mins ago' },
    { id: 'TRX-9484', user: 'Soylent Corp', amount: '$8,900.00', status: 'Completed', date: '1 hour ago' },
    { id: 'TRX-9485', user: 'Initech', amount: '$320.00', status: 'Failed', date: '3 hours ago' },
    { id: 'TRX-9486', user: 'Umbrella Corp', amount: '$12,400.00', status: 'Completed', date: '5 hours ago' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Dashboard Overview</h1>
        <p className="text-slate-500 mt-1">Welcome back, here's what's happening today.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <div key={stat.name} className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-slate-500">{stat.name}</p>
                <p className="text-3xl font-bold text-slate-900 mt-2">{stat.value}</p>
              </div>
              <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-600 border border-slate-100">
                <stat.icon className="w-5 h-5" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm">
              <span className={`flex items-center font-medium ${stat.isPositive ? 'text-emerald-600' : 'text-rose-600'}`}>
                {stat.isPositive ? <ArrowUpRight className="w-4 h-4 mr-1" /> : <ArrowDownRight className="w-4 h-4 mr-1" />}
                {stat.change}
              </span>
              <span className="text-slate-500 ml-2">vs last month</span>
            </div>
          </div>
        ))}
      </div>

      {/* Main Content Area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chart Area Placeholder */}
        <div className="lg:col-span-2 bg-white rounded-2xl p-6 border border-slate-200 shadow-sm min-h-[400px] flex flex-col">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-bold text-slate-900">Revenue Overview</h2>
            <select className="bg-slate-50 border border-slate-200 text-slate-700 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-2">
              <option>Last 7 days</option>
              <option>Last 30 days</option>
              <option>This year</option>
            </select>
          </div>
          <div className="flex-1 flex items-center justify-center bg-slate-50 rounded-xl border border-slate-100 border-dashed">
            <p className="text-slate-400">Chart visualization goes here</p>
          </div>
        </div>

        {/* Recent Transactions */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-bold text-slate-900">Recent Transactions</h2>
            <button className="text-sm font-medium text-blue-600 hover:text-blue-700">View All</button>
          </div>
          <div className="space-y-5">
            {recentTransactions.map((trx) => (
              <div key={trx.id} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    trx.status === 'Completed' ? 'bg-emerald-100 text-emerald-600' : 
                    trx.status === 'Pending' ? 'bg-amber-100 text-amber-600' : 'bg-rose-100 text-rose-600'
                  }`}>
                    <DollarSign className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-900">{trx.user}</p>
                    <p className="text-xs text-slate-500">{trx.date}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-slate-900">{trx.amount}</p>
                  <p className={`text-xs font-medium ${
                    trx.status === 'Completed' ? 'text-emerald-600' : 
                    trx.status === 'Pending' ? 'text-amber-600' : 'text-rose-600'
                  }`}>{trx.status}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
