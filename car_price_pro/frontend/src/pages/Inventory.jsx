import React, { useState, useEffect } from 'react';
import { vehicleService } from '../api/api';
import { 
  Plus, Edit2, Trash2, Search, Filter, 
  ChevronRight, MoreHorizontal, Loader2,
  Calendar, Gauge, Info, X
} from 'lucide-react';

function Inventory() {
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    brand: '', model: '', year: 2020, mileage: 0, 
    fuel_type: 'Petrol', transmission: 'Manual', showroom_price: 10
  });

  useEffect(() => { loadVehicles(); }, []);

  const loadVehicles = () => {
    setLoading(true);
    vehicleService.getAll()
      .then(res => setVehicles(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  const handleAdd = (e) => {
    e.preventDefault();
    vehicleService.create(formData)
      .then(() => {
        setShowForm(false);
        loadVehicles();
      })
      .catch(console.error);
  };

  const handleDelete = (id) => {
    if (window.confirm("Delete this vehicle?")) {
      vehicleService.delete(id).then(loadVehicles);
    }
  };

  return (
    <div className="w-full max-w-full overflow-x-hidden p-4 md:p-10 space-y-6 md:space-y-8 animate-in fade-in duration-500 pb-24 lg:pb-10">
      <header className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-6">
        <div className="w-full sm:w-auto">
          <h1 className="text-2xl md:text-3xl font-black text-slate-900 dark:text-white tracking-tight leading-none mb-3">Inventory Lab</h1>
          <p className="text-slate-400 text-xs md:text-sm font-medium italic">Simulating market portfolios and asset management.</p>
        </div>
        <button 
          onClick={() => setShowForm(true)}
          className="w-full sm:w-auto bg-indigo-600 text-white font-bold py-3.5 px-8 rounded-2xl flex items-center justify-center space-x-2 shadow-lg shadow-indigo-100 dark:shadow-none hover:bg-slate-900 transition-all active:scale-95"
        >
          <Plus size={18} />
          <span>Onboard Vehicle</span>
        </button>
      </header>

      {showForm && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-300 overflow-y-auto">
          <div className="bg-card w-full max-w-2xl rounded-[2.5rem] p-8 md:p-12 shadow-3xl relative my-auto">
            <button onClick={() => setShowForm(false)} className="absolute top-6 right-6 p-2 bg-input rounded-full text-muted hover:text-primary transition-colors"><X size={20}/></button>
            <h2 className="text-xl md:text-2xl font-black mb-8 pr-10">System Registration</h2>
            <form onSubmit={handleAdd} className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <InputGroup label="Manufacturer" placeholder="e.g. BMW" value={formData.brand} onChange={v => setFormData({...formData, brand: v})} />
              <InputGroup label="Model Variant" placeholder="e.g. M3" value={formData.model} onChange={v => setFormData({...formData, model: v})} />
              <InputGroup label="Year" type="number" value={formData.year} onChange={v => setFormData({...formData, year: parseInt(v)})} />
              <InputGroup label="Odometer (KM)" type="number" value={formData.mileage} onChange={v => setFormData({...formData, mileage: parseInt(v)})} />
              <div className="grid grid-cols-2 gap-4 sm:col-span-2 pt-4">
                 <button onClick={() => setShowForm(false)} type="button" className="py-4 text-slate-400 font-bold hover:text-primary transition-colors">Abort</button>
                 <button className="py-4 bg-indigo-600 text-white font-black rounded-2xl shadow-xl hover:bg-slate-900 transition-all">Register</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Main Table Container */}
      <div className="bg-card rounded-[2rem] md:rounded-[3rem] border border-border shadow-sm overflow-hidden">
        <div className="p-6 md:p-8 border-b border-border flex flex-col sm:flex-row justify-between items-center bg-input/20 gap-4 sm:gap-0">
           <div className="relative w-full sm:w-72">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted w-4 h-4" />
              <input 
                placeholder="Query database..."
                className="w-full pl-11 pr-4 py-3 bg-card border border-border rounded-xl text-xs font-bold outline-none focus:ring-2 focus:ring-indigo-600 transition-all text-primary"
              />
           </div>
           <div className="flex space-x-2 w-full sm:w-auto justify-end">
              <button className="p-3 bg-card border border-border rounded-xl text-muted hover:text-indigo-600 transition-all"><Filter size={16}/></button>
              <button className="p-3 bg-card border border-border rounded-xl text-muted hover:text-indigo-600 transition-all"><MoreHorizontal size={16}/></button>
           </div>
        </div>

        <div className="overflow-x-auto w-full">
          <table className="w-full text-left min-w-[600px] border-collapse">
            <thead>
              <tr className="bg-input/30">
                <th className="px-6 md:px-8 py-5 text-[9px] md:text-[10px] font-black text-muted uppercase tracking-widest whitespace-nowrap">Asset Details</th>
                <th className="px-6 md:px-8 py-5 text-[9px] md:text-[10px] font-black text-muted uppercase tracking-widest text-center whitespace-nowrap">Diagnostics</th>
                <th className="px-6 md:px-8 py-5 text-[9px] md:text-[10px] font-black text-muted uppercase tracking-widest text-right whitespace-nowrap">Computed Value</th>
                <th className="px-6 md:px-8 py-5 text-[9px] md:text-[10px] font-black text-muted uppercase tracking-widest text-center whitespace-nowrap">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {loading ? (
                <tr><td colSpan="4" className="py-20 text-center"><Loader2 className="animate-spin text-indigo-600 mx-auto w-10 h-10" /></td></tr>
              ) : vehicles.length === 0 ? (
                <tr><td colSpan="4" className="py-20 text-center text-slate-300 font-black uppercase tracking-widest text-sm">Deployment Buffer Empty</td></tr>
              ) : vehicles.map(v => (
                <tr key={v.id} className="hover:bg-input/10 transition-colors group">
                  <td className="px-6 md:px-8 py-6">
                    <div className="flex items-center space-x-3 md:space-x-4">
                      <div className="w-10 h-10 md:w-12 md:h-12 bg-indigo-50 dark:bg-indigo-500/10 rounded-xl md:rounded-2xl flex items-center justify-center text-indigo-600 font-black shrink-0">
                        {v.brand[0]}
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs md:text-sm font-black text-primary tracking-tight truncate">{v.brand} {v.model}</p>
                        <div className="flex items-center space-x-2 text-[9px] md:text-[10px] font-bold text-muted uppercase tracking-widest mt-0.5 whitespace-nowrap">
                           <Calendar className="w-3 h-3" /> <span>{v.year}</span>
                           <span className="w-1 h-1 bg-border rounded-full"></span>
                           <Gauge className="w-3 h-3" /> <span>{v.mileage.toLocaleString()} KM</span>
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 md:px-8 py-6 text-center">
                    <span className={`px-3 md:px-4 py-1.5 rounded-full text-[8px] md:text-[9px] font-black uppercase tracking-widest ${v.estimated_price ? 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' : 'bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400'}`}>
                      {v.estimated_price ? 'Optimized' : 'Raw Data'}
                    </span>
                  </td>
                  <td className="px-6 md:px-8 py-6 text-right">
                    <p className="text-xs md:text-sm font-black text-primary tracking-tighter">
                      {v.estimated_price ? `₹${v.estimated_price}L` : 'Calculating...'}
                    </p>
                  </td>
                  <td className="px-6 md:px-8 py-6">
                    <div className="flex justify-center space-x-1 md:space-x-2">
                       <button onClick={() => handleDelete(v.id)} className="p-2 md:p-2.5 text-muted hover:bg-rose-50 dark:hover:bg-rose-500/10 hover:text-rose-500 rounded-xl transition-all"><Trash2 size={16}/></button>
                       <button className="p-2 md:p-2.5 text-muted hover:bg-input hover:text-primary rounded-xl transition-all"><Edit2 size={16}/></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function InputGroup({ label, ...props }) {
  return (
    <div className="space-y-2">
      <label className="text-[9px] md:text-[10px] font-black text-muted uppercase tracking-[0.2em] ml-2">{label}</label>
      <input 
        {...props}
        className="w-full bg-input text-primary border-none rounded-2xl py-4 px-6 focus:ring-2 focus:ring-indigo-600 transition-all outline-none text-sm font-bold placeholder:text-muted/30 shadow-inner"
        onChange={(e) => props.onChange(e.target.value)}
      />
    </div>
  );
}

export default Inventory;
