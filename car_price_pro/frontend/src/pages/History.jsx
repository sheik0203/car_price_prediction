import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { predictionService } from '../api/api';
import { 
  Download, Search, Filter, Trash2, 
  ChevronDown, History, Calendar, IndianRupee,
  Loader2, ExternalLink
} from 'lucide-react';

function HistoryPage() {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    predictionService.getHistory()
      .then(res => setHistory(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const handleView = (id) => {
    console.log(`DEBUG: Navigating to detail view for ID: ${id}`);
    navigate(`/history/${id}`);
  };

  const exportCSV = () => {
    const headers = ['Date', 'Year', 'Mileage', 'Fuel', 'Transmission', 'Predicted Price'];
    const rows = history.map(h => [
        new Date(h.created_at).toLocaleDateString(),
        h.year,
        h.kms_driven,
        h.fuel_type,
        h.transmission,
        h.predicted_price
    ]);
    
    let csvContent = "data:text/csv;charset=utf-8," + headers.join(",") + "\n" + rows.map(e => e.join(",")).join("\n");
    const link = document.createElement("a");
    link.setAttribute("href", encodeURI(csvContent));
    link.setAttribute("download", "prediction_history.csv");
    document.body.appendChild(link);
    link.click();
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to remove this valuation record?")) return;
    
    try {
      await predictionService.deleteHistory(id);
      setHistory(prev => prev.filter(item => item.id !== id));
    } catch (err) {
      console.error('Delete failed:', err);
      alert('Unable to delete record.');
    }
  };

  const filteredHistory = history.filter(h => 
    h.fuel_type.toLowerCase().includes(searchTerm.toLowerCase()) ||
    h.year.toString().includes(searchTerm)
  );

  return (
    <div className="w-full max-w-full overflow-x-hidden p-4 md:p-10 space-y-6 md:space-y-8 animate-in slide-in-from-bottom-10 duration-700 pb-24 lg:pb-10">
      <header className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-6 text-primary">
        <div className="w-full sm:w-auto">
          <h1 className="text-2xl md:text-3xl font-black tracking-tight leading-none mb-3">Valuation Archives</h1>
          <p className="text-muted text-xs md:text-sm font-medium">Full historical compute logs for audit and tracking.</p>
        </div>
        <button 
          onClick={exportCSV}
          className="w-full sm:w-auto bg-card border border-border text-muted font-black py-3.5 px-6 rounded-2xl flex items-center justify-center space-x-3 hover:bg-slate-50 transition-all shadow-sm active:scale-95"
        >
          <Download size={18} />
          <span className="text-sm">Export Data</span>
        </button>
      </header>

      <div className="bg-card rounded-[2rem] md:rounded-[3rem] shadow-xl shadow-slate-200/40 dark:shadow-none border border-border overflow-hidden">
        <div className="p-6 md:p-8 flex flex-col lg:flex-row items-center justify-between bg-input/50 gap-4">
          <div className="relative w-full lg:w-96 font-inter text-primary">
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-muted opacity-50 w-5 h-5 pointer-events-none" />
            <input 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Filter by fuel, year or mileage..."
              className="w-full pl-14 pr-6 py-4 bg-card border-2 border-border rounded-[1.5rem] text-sm font-bold focus:ring-4 focus:ring-indigo-100 focus:border-indigo-500 outline-none transition-all placeholder:text-muted/30"
            />
          </div>
          <div className="flex items-center space-x-4 md:space-x-6 w-full lg:w-auto justify-end">
            <div className="flex items-center space-x-2 text-muted shrink-0">
              <span className="text-[10px] font-black uppercase tracking-widest">Sort:</span>
              <button className="flex items-center space-x-1 text-xs font-black text-primary">
                <span>Recent</span> <ChevronDown size={14}/>
              </button>
            </div>
            <button className="p-4 bg-indigo-600 text-white rounded-2xl shadow-lg hover:rotate-1 hover:scale-110 active:scale-90 transition-all">
              <Filter size={18} />
            </button>
          </div>
        </div>

        <div className="overflow-x-auto w-full">
          <table className="w-full text-left border-collapse text-primary min-w-[700px]">
            <thead>
              <tr className="border-b-2 border-border bg-input/20">
                <th className="px-6 md:px-10 py-6 text-[9px] md:text-[10px] font-black text-muted uppercase tracking-[0.2em] whitespace-nowrap">Execution Date</th>
                <th className="px-6 md:px-10 py-6 text-[9px] md:text-[10px] font-black text-muted uppercase tracking-[0.2em] whitespace-nowrap">Vehicle Config</th>
                <th className="px-6 md:px-10 py-6 text-[9px] md:text-[10px] font-black text-muted uppercase tracking-[0.2em] text-center whitespace-nowrap">Transmission</th>
                <th className="px-6 md:px-10 py-6 text-[9px] md:text-[10px] font-black text-muted uppercase tracking-[0.2em] text-right whitespace-nowrap">Estimate</th>
                <th className="px-6 md:px-10 py-6"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {loading ? (
                 <tr><td colSpan="5" className="py-24 text-center"><Loader2 className="animate-spin text-indigo-600 mx-auto w-10 h-10" /></td></tr>
              ) : filteredHistory.length === 0 ? (
                 <tr><td colSpan="5" className="py-24 text-center text-muted/20 font-black uppercase tracking-[0.3em]">No Records Found</td></tr>
              ) : filteredHistory.map(item => (
                <tr key={item.id} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/50 transition-colors group">
                  <td className="px-6 md:px-10 py-8">
                    <div className="flex items-center space-x-3 shrink-0">
                       <Calendar className="text-muted opacity-50 w-4 h-4" />
                       <span className="text-sm font-bold whitespace-nowrap">{new Date(item.created_at).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                    </div>
                  </td>
                  <td className="px-6 md:px-10 py-8">
                    <div className="space-y-1 min-w-[150px]">
                      <p className="text-sm font-black tracking-tight">{item.year} Model • {item.kms_driven.toLocaleString()} KM</p>
                      <span className={`inline-block px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-widest ${item.fuel_type === 'Petrol' ? 'bg-amber-100 text-amber-700' : 'bg-blue-100 text-blue-700'}`}>
                        {item.fuel_type}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 md:px-10 py-8 text-center text-xs font-bold text-muted uppercase tracking-widest whitespace-nowrap">
                    {item.transmission}
                  </td>
                  <td className="px-6 md:px-10 py-8 text-right">
                    <div className="flex items-center justify-end space-x-1 shrink-0">
                      <IndianRupee className="w-3 h-3 text-indigo-600 mb-0.5" />
                      <span className="text-lg font-black tracking-tighter whitespace-nowrap">{item.predicted_price}L</span>
                    </div>
                  </td>
                  <td className="px-6 md:px-10 py-8 text-right opacity-100 group-hover:opacity-100 lg:opacity-0 transition-opacity">
                    <div className="flex justify-end space-x-1 sm:space-x-2">
                      <button onClick={() => handleView(item.id)} className="p-3 text-muted hover:text-indigo-600 hover:bg-card dark:hover:bg-slate-700 rounded-xl shadow-sm transition-all"><ExternalLink size={16}/></button>
                      <button onClick={() => handleDelete(item.id)} className="p-3 text-muted hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-500/10 rounded-xl transition-all"><Trash2 size={16}/></button>
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

export default HistoryPage;
