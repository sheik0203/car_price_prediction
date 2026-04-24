import React, { useState } from 'react';
import { predictionService } from '../api/api';
import {
  Cpu, IndianRupee, Car, Gauge, Fuel,
  Settings2, User as UserIcon, Loader2, Info, CheckCircle2,
  AlertCircle, Sparkles, ShieldCheck, MapPin, 
  History as HistoryIcon, Camera, TrendingDown,
  ArrowRight, Activity, ChevronDown, UserCheck, Wrench
} from 'lucide-react';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, 
  Tooltip, ResponsiveContainer, LabelList 
} from 'recharts';

function Predict() {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    year: '',
    present_price: '',
    kms_driven: '',
    fuel_type: 'Petrol',
    transmission: 'Manual',
    seller_type: 'Individual',
    city: 'Mumbai',
    exterior: 'Good',
    interior: 'Good',
    accident: 'No Accident',
    service: 'Full Service History',
    owner: 0,
    images: [null, null, null, null]
  });

  const [loading, setLoading] = useState(false);
  const [loadStage, setLoadStage] = useState('');
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [analysis, setAnalysis] = useState(null);

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    setLoading(true);
    setLoadStage('Initializing market audit...');
    setError(null);
    setResult(null);
    setAnalysis(null);

    try {
      let damagePenalty = 0;
      if (formData.images && formData.images.some(img => img !== null)) {
        setLoadStage('AI scanning vehicle surfaces...');
        const ad = new FormData();
        formData.images.forEach((img, idx) => {
          if (img) ad.append(`images[${idx}]`, img);
        });
        
        const analysisRes = await predictionService.analyzeVehicle(ad);
        setAnalysis(analysisRes.data);
        damagePenalty = analysisRes.data.penalty_factor || 0;
      }

      setLoadStage('Mapping regional demand trends...');
      
      // Filter payload to match PredictionSerializer EXACTLY
      const payload = {
        year: parseInt(formData.year),
        present_price: parseFloat(formData.present_price),
        kms_driven: parseInt(formData.kms_driven),
        fuel_type: formData.fuel_type,
        transmission: formData.transmission,
        seller_type: formData.seller_type,
        owner: parseInt(formData.owner || 0),
        
        // Metadata mapping
        city: formData.city,
        exterior_condition: formData.exterior,
        interior_condition: formData.interior,
        accident_history: formData.accident,
        service_history: formData.service
      };

      const predictRes = await predictionService.predict(payload);
      const output = predictRes.data;

      if (damagePenalty > 0) {
        output.original_predicted_price = output.predicted_price;
        output.predicted_price = parseFloat((output.predicted_price * (1 - damagePenalty)).toFixed(2));
        output.damage_penalty_pct = Math.round(damagePenalty * 100);
      }

      setResult(output);
      setStep(3); // Result view
    } catch (err) {
      console.error("DEBUG: Valuation Error:", err.response?.data);
      const errorMsg = err.response?.data 
        ? Object.entries(err.response.data).map(([k, v]) => `${k}: ${v}`).join(', ')
        : 'Market analysis failed.';
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const getDepreciationData = (basePrice) => {
    if (!basePrice) return [];
    const currentYear = new Date().getFullYear();
    const factors = [
      { yr: 0, scale: 1.0 },
      { yr: 1, scale: 0.88 },
      { yr: 2, scale: 0.78 },
      { yr: 3, scale: 0.68 },
    ];
    return factors.map(f => ({
      year: (currentYear + f.yr).toString(),
      val: basePrice * f.scale
    }));
  };

  const renderProgress = () => (
    <div className="flex items-center justify-between mb-10 px-4">
      {[1, 2, 3].map(i => (
        <div key={i} className="flex-1 flex items-center group cursor-pointer" onClick={() => step > i && setStep(i)}>
          <div className={`w-10 h-10 rounded-2xl flex items-center justify-center font-black text-sm transition-all shadow-md ${
            step === i ? 'bg-indigo-600 text-white scale-110 shadow-indigo-200' : 
            step > i ? 'bg-emerald-500 text-white' : 'bg-input text-muted opacity-40'
          }`}>
            {step > i ? '✓' : i}
          </div>
          {i < 3 && <div className={`h-1 flex-1 mx-3 rounded-full transition-all ${step > i ? 'bg-emerald-500' : 'bg-input'}`} />}
        </div>
      ))}
    </div>
  );

  return (
    <div className="max-w-6xl mx-auto space-y-10 pb-10">
      {/* Dynamic Step Header */}
      <div className="space-y-4 px-4 sm:px-0 text-center lg:text-left">
        <h1 className="text-4xl sm:text-5xl font-black tracking-tight italic uppercase">Market Compute</h1>
        <p className="text-muted font-bold text-xs uppercase tracking-[0.3em] italic">Proprietary AI Valuation Engine</p>
      </div>

      {renderProgress()}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-14">
        {/* Main Flow Area */}
        <div className="lg:col-span-7 space-y-8">
          
          {step === 1 && (
            <div className="bg-card p-6 sm:p-10 rounded-[3rem] border border-border shadow-2xl animate-in slide-in-from-bottom-10 space-y-8">
              <div className="flex items-center space-x-3 mb-4">
                <Settings2 className="text-indigo-600" />
                <h3 className="text-lg font-black tracking-tight">Step 1: Vehicle Profile</h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <InputGroup label="Mfg Year" icon={<Car size={18} />} type="number" value={formData.year} onChange={v => setFormData({ ...formData, year: v })} />
                <InputGroup label="Showroom (Lakhs)" icon={<IndianRupee size={18} />} type="number" value={formData.present_price} onChange={v => setFormData({ ...formData, present_price: v })} />
                <InputGroup label="Kms Driven" icon={<Gauge size={18} />} type="number" value={formData.kms_driven} onChange={v => setFormData({ ...formData, kms_driven: v })} />
                <FormSelect label="City Hub" icon={<MapPin size={18} />} options={['Mumbai', 'Delhi', 'Bangalore', 'Chennai', 'Pune', 'Hyderabad']} value={formData.city} onChange={v => setFormData({ ...formData, city: v })} />
                
                {/* Advanced Core Inputs */}
                <FormSelect label="Fuel Type" icon={<Fuel size={18} />} options={['Petrol', 'Diesel', 'CNG']} value={formData.fuel_type} onChange={v => setFormData({ ...formData, fuel_type: v })} />
                <FormSelect label="Transmission" icon={<Cpu size={18} />} options={['Manual', 'Automatic']} value={formData.transmission} onChange={v => setFormData({ ...formData, transmission: v })} />
                <FormSelect label="Seller Type" icon={<UserCheck size={18} />} options={['Individual', 'Dealer']} value={formData.seller_type} onChange={v => setFormData({ ...formData, seller_type: v })} />
                <FormSelect label="Service History" icon={<Wrench size={18} />} options={['Full Service History', 'Partial', 'No Service Logs']} value={formData.service} onChange={v => setFormData({ ...formData, service: v })} />
              </div>

              <div className="pt-6 border-t border-border grid grid-cols-3 gap-4">
                <FormSelect label="Exter." options={['Excellent', 'Good', 'Average', 'Poor']} value={formData.exterior} onChange={v => setFormData({ ...formData, exterior: v })} />
                <FormSelect label="Inter." options={['Excellent', 'Good', 'Average', 'Poor']} value={formData.interior} onChange={v => setFormData({ ...formData, interior: v })} />
                <FormSelect label="History" options={['No Accident', 'Minor', 'Major']} value={formData.accident} onChange={v => setFormData({ ...formData, accident: v })} />
              </div>

              <button 
                onClick={() => setStep(2)} 
                className="w-full py-5 bg-slate-900 text-white font-black rounded-3xl shadow-xl hover:bg-slate-800 transition-all flex items-center justify-center space-x-3"
              >
                <span>Continue to Media</span>
                <ArrowRight size={18} />
              </button>
            </div>
          )}

          {step === 2 && (
            <div className="bg-card p-6 sm:p-10 rounded-[3rem] border border-border shadow-2xl animate-in slide-in-from-right-10 space-y-8">
              <div className="flex items-center space-x-3 mb-4">
                <Camera className="text-indigo-600" />
                <h3 className="text-lg font-black tracking-tight">Step 2: Visual Audit</h3>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-2 gap-4">
                {[0, 1, 2, 3].map(idx => (
                  <label key={idx} className="aspect-square bg-input/50 rounded-3xl border-2 border-dashed border-border flex flex-col items-center justify-center cursor-pointer hover:border-indigo-500 transition-all overflow-hidden relative group">
                    {formData.images?.[idx] ? (
                      <div className="w-full h-full relative">
                        <img src={URL.createObjectURL(formData.images[idx])} className="w-full h-full object-cover" alt="Preview"/>
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                           <span className="text-white text-[10px] font-black uppercase tracking-widest">Replace</span>
                        </div>
                      </div>
                    ) : (
                      <>
                        <Camera size={24} className="text-muted mb-2 group-hover:scale-110 transition-transform" />
                        <span className="text-[10px] font-black uppercase text-muted">Angle {idx + 1}</span>
                      </>
                    )}
                    <input type="file" accept="image/*" capture="environment" className="hidden" 
                      onChange={e => {
                        const img = [...formData.images];
                        img[idx] = e.target.files[0];
                        setFormData({...formData, images: img});
                      }} />
                  </label>
                ))}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <button onClick={() => setStep(1)} className="py-5 bg-card border border-border text-primary font-black rounded-3xl hover:bg-input transition-all">Back</button>
                <button onClick={handleSubmit} className="py-5 bg-indigo-600 text-white font-black rounded-3xl shadow-xl hover:bg-indigo-700 transition-all flex items-center justify-center space-x-3">
                  <span>Start AI Compute</span>
                  <Sparkles size={18} />
                </button>
              </div>
            </div>
          )}

          {loading && (
             <div className="fixed inset-0 z-[200] flex items-center justify-center p-6 bg-background/80 backdrop-blur-xl">
               <div className="bg-card p-10 rounded-[3rem] border border-border shadow-2xl text-center space-y-6 max-w-sm w-full animate-in zoom-in-50">
                 <div className="w-20 h-20 bg-indigo-600 rounded-[2rem] flex items-center justify-center mx-auto shadow-2xl animate-bounce">
                    <Loader2 className="text-white animate-spin" size={32} />
                 </div>
                 <div className="space-y-4">
                   <h4 className="text-xl font-black italic uppercase tracking-tight">Analyzing Marketplace</h4>
                   <p className="text-muted font-bold text-xs uppercase tracking-widest">{loadStage}</p>
                 </div>
                 <div className="h-1.5 w-full bg-input rounded-full overflow-hidden">
                    <div className="h-full bg-indigo-600 animate-progress" style={{width: '60%'}}></div>
                 </div>
               </div>
             </div>
          )}

          {step === 3 && result && (
            <div className="space-y-8 animate-in slide-in-from-bottom-10">
                <div className="bg-indigo-600 text-white p-8 sm:p-12 rounded-[4rem] shadow-2xl relative overflow-hidden">
                  <div className="relative z-10 space-y-8 text-center sm:text-left">
                    <div className="flex flex-col sm:flex-row justify-between items-center sm:items-start space-y-4 sm:space-y-0">
                      <div>
                        <p className="text-xs font-bold uppercase tracking-[0.3em] opacity-60 italic mb-2">ValuAI Certified Value</p>
                        <h2 className="text-6xl sm:text-8xl font-black italic tracking-tighter leading-none">₹{result?.predicted_price}L</h2>
                      </div>
                      <div className="bg-white/10 px-6 py-4 rounded-3xl backdrop-blur-md border border-white/10 text-center">
                        <p className="text-[10px] font-black uppercase tracking-[0.2em] mb-1">Confidence</p>
                        <p className="text-2xl font-black">{result?.confidence}%</p>
                      </div>
                    </div>
                  </div>
                  <div className="absolute -bottom-20 -right-20 w-80 h-80 bg-white/10 rounded-full blur-3xl opacity-30"></div>
                </div>

                <div className="bg-card p-8 rounded-[3rem] border border-border space-y-6">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 rounded-lg"><CheckCircle2 size={18} /></div>
                    <h4 className="text-sm font-black uppercase tracking-widest">Inspection Summary</h4>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                     <div className="p-4 bg-emerald-50 dark:bg-emerald-500/5 rounded-2xl border border-emerald-100 dark:border-emerald-500/10 text-xs font-bold">
                        Exter: {formData.exterior}
                     </div>
                     <div className="p-4 bg-emerald-50 dark:bg-emerald-500/5 rounded-2xl border border-emerald-100 dark:border-emerald-500/10 text-xs font-bold">
                        Inter: {formData.interior}
                     </div>
                  </div>
                  {analysis && analysis.damages?.length > 0 && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {analysis.damages.map((d, i) => (
                        <div key={i} className="flex items-center justify-between p-4 bg-rose-50 dark:bg-rose-500/5 rounded-2xl border border-rose-100 dark:border-rose-500/10">
                           <div className="space-y-1">
                             <p className="text-[10px] font-black uppercase text-rose-600">{d.type}</p>
                             <p className="text-xs font-bold opacity-60">Detected Angle {i+1}</p>
                           </div>
                           <span className="text-[10px] font-black px-2 py-1 bg-rose-100 dark:bg-rose-900/40 rounded text-rose-600">{Math.round(d.confidence*100)}% Match</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
            </div>
          )}
        </div>

        {/* Results Sidebar / Extended Content */}
        <div className="lg:col-span-5 space-y-8">
           {step === 3 && result && (
             <div className="space-y-8 animate-in slide-in-from-right-10">
                <div className="bg-card p-8 rounded-[3rem] border border-border space-y-6">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center space-x-3">
                      <TrendingDown className="text-rose-500" size={20} />
                      <h4 className="text-sm font-black uppercase tracking-widest">Projection</h4>
                    </div>
                  </div>
                  <div className="min-w-0 h-64 sm:h-80 w-full mt-4">
                    <ResponsiveContainer width="100%" aspect={1.2}>
                      <AreaChart data={getDepreciationData(result?.predicted_price)}>
                        <defs>
                          <linearGradient id="colorVal" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/>
                            <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <Area type="monotone" dataKey="val" stroke="#6366f1" fillOpacity={1} fill="url(#colorVal)" strokeWidth={4} />
                        <XAxis dataKey="year" axisLine={false} tickLine={false} tick={{fontSize: 10, fontWeight: 900}} />
                        <Tooltip content={() => null} />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                <div className="bg-card p-8 rounded-[3rem] border border-border space-y-4">
                   <h4 className="text-[10px] font-black uppercase tracking-widest text-muted italic">Engine Explication</h4>
                   <div className="space-y-3">
                      {result?.explanation?.map((e, idx) => (
                        <div key={idx} className="p-4 bg-input rounded-2xl border border-border flex items-start space-x-3">
                           <div className="w-1.5 h-1.5 rounded-full bg-indigo-600 mt-1.5 shrink-0" />
                           <p className="text-xs font-bold leading-relaxed">{e}</p>
                        </div>
                      ))}
                   </div>
                </div>

                <button onClick={() => setStep(1)} className="w-full py-5 bg-card border border-border text-primary font-black rounded-3xl hover:bg-input transition-all">
                  Run New Audit
                </button>
             </div>
           )}

           {(step !== 3 || !result) && (
              <div className="hidden lg:block bg-input/20 border-2 border-dashed border-border rounded-[4rem] p-20 text-center space-y-6 h-full flex flex-col items-center justify-center min-h-[600px]">
                 <Activity size={48} className="text-muted opacity-20" />
                 <p className="text-xs font-black uppercase tracking-widest text-muted italic max-w-xs leading-loose">Initialize the market sensor by providing vehicle metrics and visual assets for high-fidelity evaluation.</p>
              </div>
           )}
        </div>
      </div>

      {error && (
        <div className="fixed bottom-32 left-6 right-6 z-[150] lg:static lg:mt-6 bg-rose-500 text-white p-6 rounded-[2.5rem] shadow-2xl flex items-center space-x-4 animate-in slide-in-from-bottom-5">
           <AlertCircle size={24} className="shrink-0" />
           <p className="text-sm font-black uppercase tracking-widest italic">{error}</p>
        </div>
      )}
    </div>
  );
}

function InputGroup({ label, icon, ...props }) {
  if (!label) return null;
  return (
    <div className="space-y-4 group text-primary">
      <label className="text-[10px] font-black text-muted uppercase tracking-[0.2em] mb-1 ml-2 group-focus-within:text-indigo-600 transition-colors italic">{label}</label>
      <div className="relative">
        {icon && <div className="absolute inset-y-0 left-6 flex items-center pointer-events-none text-muted opacity-40 group-focus-within:text-indigo-500 transition-all">{icon}</div>}
        <input
          {...props}
          className={`${icon ? 'pl-16' : 'px-8'} w-full bg-input text-primary border-none rounded-[1.8rem] py-5 pr-8 focus:ring-2 focus:ring-indigo-600 transition-all outline-none text-sm font-bold placeholder:text-muted/30 shadow-inner`}
          onChange={(e) => props.onChange?.(e.target.value)}
        />
      </div>
    </div>
  );
}

function FormSelect({ label, icon, options = [], value, onChange }) {
  if (!label || !options) return null;
  return (
    <div className="space-y-4 group text-primary">
      <label className="text-[10px] font-black text-muted uppercase tracking-[0.2em] mb-1 ml-2 group-focus-within:text-indigo-600 transition-colors italic">{label}</label>
      <div className="relative">
        {icon && <div className="absolute inset-y-0 left-6 flex items-center pointer-events-none text-muted opacity-40 group-focus-within:text-indigo-500 transition-all">{icon}</div>}
        <select
          value={value}
          onChange={(e) => onChange?.(e.target.value)}
          className={`${icon ? 'pl-16' : 'px-8'} w-full bg-input text-primary border-none rounded-[1.8rem] py-5 pr-10 focus:ring-2 focus:ring-indigo-600 transition-all outline-none text-sm font-bold appearance-none cursor-pointer shadow-inner`}
        >
          {options.map((opt, i) => (
            <option key={`${opt}-${i}`} value={opt} className="bg-card text-primary font-bold">
              {opt}
            </option>
          ))}
        </select>
        <ChevronDown size={14} className="absolute right-6 top-1/2 -translate-y-1/2 text-muted pointer-events-none" />
      </div>
    </div>
  );
}

export default Predict;
