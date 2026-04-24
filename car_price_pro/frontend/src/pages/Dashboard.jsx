import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { analyticsService, predictionService } from '../api/api';
import { 
  Car, Gauge, Activity, TrendingUp, IndianRupee,
  PlusCircle, History, Loader2, ArrowUpRight, BarChart3
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip } from 'recharts';

function Dashboard({ user }) {
  const [stats, setStats] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    Promise.all([
      analyticsService.getDashboard(),
      predictionService.getHistory()
    ]).then(([analytics, hist]) => {
      setStats(analytics.data);
      setHistory(hist.data.slice(0, 5));
    }).finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="h-[60vh] flex items-center justify-center">
      <Loader2 className="animate-spin text-indigo-600 w-10 h-10" />
    </div>
  );

  return (
    <div className="w-full space-y-6 md:space-y-10 animate-in fade-in duration-500 text-primary">
      {/* Header Section */}
      <header className="flex flex-col sm:flex-row justify-between items-center bg-card p-6 md:p-8 rounded-[2rem] border border-border shadow-sm gap-6">
        <div className="flex flex-col sm:flex-row items-center text-center sm:text-left space-y-4 sm:space-y-0 sm:space-x-6">
          <img 
            src={user?.avatar || `https://ui-avatars.com/api/?name=${user?.name}&background=6366f1&color=fff`} 
            alt="Profile" 
            className="w-16 h-16 rounded-full border-4 border-background shadow-lg shadow-indigo-500/10 shrink-0"
          />
          <div className="min-w-0">
            <h1 className="text-2xl md:text-3xl font-black tracking-tight leading-tight truncate">Welcome back, {user?.name?.split(' ')[0]}</h1>
            <p className="text-muted text-xs md:text-sm font-medium mt-1 truncate">{user?.email}</p>
          </div>
        </div>
        <div className="flex flex-col items-center sm:items-end shrink-0">
           <div className="px-5 py-2.5 bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-2xl flex items-center space-x-2 border border-emerald-100/50 dark:border-emerald-500/20">
              <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
              <span className="text-[10px] font-black uppercase tracking-widest">Inference Hub Online</span>
           </div>
           <p className="text-[9px] font-bold text-indigo-500 uppercase tracking-widest mt-2">{user?.role || 'Enterprise Node'}</p>
        </div>
      </header>

      {/* Summary Stat Grid - Fully Responsive */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 md:gap-8">
        <MiniCard label="Asset Portfolio" value={stats?.total_vehicles} icon={<Car className="text-indigo-600"/>} trend="+12%" />
        <MiniCard label="Total Computes" value={stats?.total_predictions} icon={<BarChart3 className="text-blue-500"/>} trend="+5.4k" />
        <MiniCard label="Avg Asset Value" value={`₹${stats?.avg_price?.toFixed(1)}L`} icon={<IndianRupee className="text-emerald-500"/>} trend="-2%" />
        <MiniCard label="Network Health" value="98.2%" icon={<Activity className="text-amber-500"/>} trend="Optimal" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 md:gap-10">
        <div className="lg:col-span-8 space-y-6 md:space-y-10">
          {/* Main Chart Card */}
          <div className="bg-card p-6 md:p-10 rounded-[2.5rem] md:rounded-[3rem] border border-border shadow-xl shadow-slate-200/40 dark:shadow-none transition-colors overflow-hidden">
            <div className="flex justify-between items-center mb-8 md:mb-10">
               <div>
                  <h3 className="text-lg font-black tracking-tight">Market Benchmarking</h3>
                  <p className="text-[10px] font-black text-muted uppercase tracking-widest mt-1">Vehicle Age vs Computed Price</p>
               </div>
               <ArrowUpRight className="text-muted opacity-50 shrink-0" />
            </div>
            <div className="min-w-0 w-full">
              <ResponsiveContainer width="100%" aspect={window.innerWidth < 768 ? 1.5 : 2.2}>
                <BarChart data={stats?.history_data}>
                  <XAxis dataKey="year" axisLine={false} tickLine={false} hide />
                  <Tooltip 
                    cursor={{fill: 'var(--input)'}} 
                    contentStyle={{
                      backgroundColor: 'var(--card)', 
                      borderRadius: '16px', 
                      border: '1px solid var(--border)', 
                      boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
                      color: 'var(--text)',
                      fontSize: '12px'
                    }} 
                  />
                  <Bar dataKey="price" fill="#6366f1" radius={[12, 12, 12, 12]} barSize={20} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Recent Activity Card */}
          <div className="bg-card p-6 md:p-10 rounded-[2.5rem] border border-border shadow-sm relative overflow-hidden">
             <div className="flex justify-between items-center mb-8">
                <h3 className="text-lg font-black flex items-center tracking-tight">
                   <History className="mr-3 text-indigo-600 shrink-0" size={18} /> Recent Compute Activity
                </h3>
             </div>
             <div className="divide-y divide-border">
                {history.map((h, i) => (
                  <div key={i} className="py-5 flex items-center justify-between group transition-all">
                     <div className="flex items-center space-x-4 min-w-0">
                        <div className="w-10 h-10 bg-input rounded-xl flex items-center justify-center text-muted group-hover:bg-indigo-50 dark:group-hover:bg-indigo-500/10 group-hover:text-indigo-600 transition-colors font-black text-[10px] shrink-0">{h.year[2]}{h.year[3]}</div>
                        <div className="min-w-0">
                           <p className="text-sm font-black truncate">{h.fuel_type} Variant</p>
                           <p className="text-[10px] font-bold text-muted uppercase tracking-widest truncate">{h.kms_driven.toLocaleString()} KM Logged</p>
                        </div>
                     </div>
                     <div className="text-right shrink-0">
                        <p className="text-base font-black text-indigo-600 tracking-tighter">₹{h.predicted_price}L</p>
                        <p className="text-[9px] font-black text-muted uppercase tracking-widest leading-none mt-1">Estim. Value</p>
                     </div>
                  </div>
                ))}
             </div>
          </div>
        </div>

        {/* Sidebar / Quick Actions Panel */}
        <div className="lg:col-span-4 space-y-6 md:space-y-10">
           <div className="bg-indigo-600 p-10 rounded-[2.5rem] text-white shadow-3xl shadow-indigo-200 dark:shadow-none text-center flex flex-col items-center">
              <PlusCircle className="w-16 h-16 mb-4 opacity-40 shrink-0" />
              <h3 className="text-xl font-black mb-2 leading-none">Ready for appraisal?</h3>
              <p className="text-indigo-100 text-xs font-medium mb-8 leading-relaxed px-2">Initialize the neural engine to compute fair market value for any vehicle.</p>
              <button 
                onClick={() => navigate('/predict')}
                className="w-full bg-white text-indigo-950 font-black py-4 rounded-2xl shadow-xl hover:-translate-y-1 transition-transform transform active:scale-95"
              >
                 Start New Compute
              </button>
           </div>

           <div className="bg-card p-8 rounded-[2.5rem] border border-border bg-input/20">
              <div className="flex items-center space-x-3 mb-6">
                 <div className="w-2 h-2 bg-indigo-600 rounded-full"></div>
                 <h4 className="text-[10px] font-black text-muted uppercase tracking-widest">Market Status</h4>
              </div>
              <p className="text-sm font-bold leading-relaxed mb-4">Values are currently trending <span className="text-emerald-500 font-black">+2.1% higher</span> than Q1 averages.</p>
              <div className="w-full bg-input h-1.5 rounded-full overflow-hidden">
                 <div className="w-3/4 bg-indigo-600 h-full"></div>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
}

function MiniCard({ label, value, icon, trend }) {
  return (
    <div className="bg-card p-7 rounded-[2rem] border border-border shadow-sm relative overflow-hidden group hover:shadow-xl transition-all duration-300">
      <div className="flex justify-between items-start mb-6">
         <div className="p-3 bg-input rounded-2xl group-hover:bg-indigo-50 dark:group-hover:bg-indigo-500/10 transition-colors shrink-0">{icon}</div>
         <span className={`text-[10px] font-black px-2 py-1 rounded-lg shrink-0 ${trend.includes('+') ? 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' : 'bg-input text-muted'}`}>{trend}</span>
      </div>
      <p className="text-[10px] font-black text-muted uppercase tracking-widest mb-1">{label}</p>
      <p className="text-2xl font-black tracking-tighter truncate">{value}</p>
    </div>
  );
}

export default Dashboard;
