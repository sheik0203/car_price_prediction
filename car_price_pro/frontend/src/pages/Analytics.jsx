import React, { useState, useEffect } from 'react';
import { 
  LineChart, Line, PieChart, Pie, Cell, 
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import { analyticsService } from '../api/api';
import { TrendingUp, BarChart3, PieChart as PieIcon, Activity, Loader2 } from 'lucide-react';

const COLORS = ['#6366f1', '#60a5fa', '#34d399', '#fbbf24', '#f87171'];

function Analytics() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    analyticsService.getDashboard()
      .then(res => setData(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="h-[60vh] flex items-center justify-center">
      <Loader2 className="animate-spin text-indigo-600 w-10 h-10" />
    </div>
  );

  return (
    <div className="w-full max-w-full overflow-x-hidden p-4 md:p-10 space-y-6 md:space-y-10 animate-in fade-in duration-700 pb-24 lg:pb-10">
      <header className="mb-6 md:mb-10 text-center md:text-left">
        <h1 className="text-2xl md:text-3xl font-black text-slate-900 dark:text-white tracking-tight leading-none mb-3">Market Intel</h1>
        <p className="text-slate-400 text-xs md:text-sm font-medium">Global vehicle trends and predictive data models.</p>
      </header>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        <StatCard title="Inventory Size" value={data?.total_vehicles || 0} icon={<BarChart3 className="text-indigo-600"/>} />
        <StatCard title="Computations" value={data?.total_predictions || 0} icon={<Activity className="text-emerald-500"/>} />
        <StatCard title="Avg Market Price" value={`₹${data?.avg_price?.toFixed(1) || 0}L`} icon={<TrendingUp className="text-blue-500"/>} />
        <StatCard title="Primary Fuel" value={data?.popular_fuel || 'Petrol'} icon={<PieIcon className="text-amber-500"/>} />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 md:gap-10">
        {/* Price History Line Chart */}
        <ChartWrapper title="Market Value Trends" subtitle="Car Age vs Selling Price">
          <div className="min-w-0 w-full overflow-hidden">
            <ResponsiveContainer width="100%" aspect={window.innerWidth < 768 ? 1.4 : 2.0}>
              <LineChart data={data?.history_data}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="year" axisLine={false} tickLine={false} tick={{fontSize: 10, fill: '#94a3b8'}} />
                <YAxis axisLine={false} tickLine={false} tick={{fontSize: 10, fill: '#94a3b8'}} />
                <Tooltip 
                  contentStyle={{
                    borderRadius: '16px', 
                    border: 'none', 
                    boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
                    fontSize: '12px'
                  }} 
                />
                <Line type="monotone" dataKey="price" stroke="#6366f1" strokeWidth={4} dot={{r: 4, fill: '#6366f1', strokeWidth: 2, stroke: '#fff'}} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </ChartWrapper>

        {/* Fuel Distribution Pie Chart */}
        <ChartWrapper title="Powerplant Mix" subtitle="Inventory Fuel Distribution">
          <div className="min-w-0 w-full overflow-hidden">
            <ResponsiveContainer width="100%" aspect={window.innerWidth < 768 ? 1.4 : 2.0}>
              <PieChart>
                <Pie
                  data={data?.fuel_dist}
                  innerRadius={window.innerWidth < 768 ? 50 : 60}
                  outerRadius={window.innerWidth < 768 ? 70 : 80}
                  paddingAngle={8}
                  dataKey="value"
                >
                  {data?.fuel_dist?.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} cornerRadius={10} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{fontSize: '12px'}} />
                <Legend verticalAlign="bottom" height={36} iconType="circle" wrapperStyle={{fontSize: '10px'}}/>
              </PieChart>
            </ResponsiveContainer>
          </div>
        </ChartWrapper>
      </div>
    </div>
  );
}

function StatCard({ title, value, icon }) {
  return (
    <div className="bg-card p-5 md:p-6 rounded-[1.8rem] md:rounded-[2rem] border border-border shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
      <div className="flex justify-between items-start mb-4">
        <div className="p-2.5 md:p-3 bg-input rounded-xl md:rounded-2xl shrink-0">{icon}</div>
      </div>
      <p className="text-[10px] md:text-[10px] font-black text-muted uppercase tracking-widest mb-1 truncate">{title}</p>
      <p className="text-xl md:text-2xl font-black text-primary tracking-tighter truncate">{value}</p>
    </div>
  );
}

function ChartWrapper({ title, subtitle, children }) {
  return (
    <div className="bg-card p-6 md:p-8 rounded-[2rem] md:rounded-[2.5rem] border border-border shadow-sm">
      <div className="mb-6 md:mb-8 text-center sm:text-left">
        <h3 className="text-base md:text-lg font-black text-primary tracking-tight">{title}</h3>
        <p className="text-muted text-[9px] md:text-xs font-medium uppercase tracking-widest mt-1 italic">{subtitle}</p>
      </div>
      {children}
    </div>
  );
}

export default Analytics;
