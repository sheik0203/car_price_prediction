import React, { useState } from 'react';
import { 
  User, Shield, Bell, CreditCard, 
  Moon, Sun, Globe, Database, 
  ChevronRight, Save, Lock, ArrowUpRight, Info
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

function Settings({ user }) {
  const [activeTab, setActiveTab] = useState('profile');
  const { theme, updateTheme } = useTheme();

  return (
    <div className="w-full max-w-full overflow-x-hidden p-4 md:p-10 space-y-8 md:space-y-10 animate-in fade-in duration-500 pb-24 lg:pb-10">
      <header>
        <h1 className="text-2xl md:text-3xl font-black text-slate-900 dark:text-white tracking-tight leading-none mb-3 text-center md:text-left">System Control</h1>
        <p className="text-slate-400 text-xs md:text-sm font-medium text-center md:text-left">Manage your enterprise profile and compute preferences.</p>
      </header>

      <div className="flex flex-col lg:flex-row gap-8 md:gap-12">
        {/* Navigation Tabs - Horizontal on Mobile, Vertical on Desktop */}
        <aside className="w-full lg:w-64 flex lg:flex-col overflow-x-auto lg:overflow-x-visible pb-4 lg:pb-0 space-x-4 lg:space-x-0 lg:space-y-2 no-scrollbar scroll-smooth">
          <TabButton 
            active={activeTab === 'profile'} 
            onClick={() => setActiveTab('profile')}
            icon={<User size={18}/>} 
            label="Profile" 
          />
          <TabButton 
            active={activeTab === 'security'} 
            onClick={() => setActiveTab('security')}
            icon={<Shield size={18}/>} 
            label="Security" 
          />
          <TabButton 
            active={activeTab === 'preferences'} 
            onClick={() => setActiveTab('preferences')}
            icon={<Moon size={18}/>} 
            label="Preferences" 
          />
          <TabButton 
            active={activeTab === 'billing'} 
            onClick={() => setActiveTab('billing')}
            icon={<CreditCard size={18}/>} 
            label="Billing" 
          />
        </aside>

        {/* Content Area */}
        <div className="flex-1 w-full max-w-3xl mx-auto lg:mx-0">
          <div className="bg-card dark:bg-slate-900 rounded-[2rem] md:rounded-[3rem] p-6 md:p-12 border border-border shadow-sm space-y-8 md:space-y-10 transition-colors">
            {activeTab === 'profile' && (
              <div className="space-y-8 md:space-y-10 animate-in slide-in-from-right-4">
                <div className="flex flex-col sm:flex-row items-center text-center sm:text-left space-y-6 sm:space-y-0 sm:space-x-6 pb-8 md:pb-10 border-b border-border">
                   <div className="relative group shrink-0">
                     <img 
                       src={user?.avatar || `https://ui-avatars.com/api/?name=${user?.name}&background=6366f1&color=fff`} 
                       alt="Avatar" 
                       className="w-20 h-20 md:w-24 md:h-24 rounded-[1.8rem] md:rounded-[2.2rem] object-cover ring-4 ring-input shadow-xl"
                     />
                     <button className="absolute -bottom-2 -right-2 p-2.5 md:p-3 bg-card dark:bg-slate-700 shadow-xl rounded-2xl text-indigo-600 border border-border">
                        <Save size={14} />
                     </button>
                   </div>
                   <div className="min-w-0">
                      <h3 className="text-lg md:text-xl font-black text-primary uppercase tracking-tight italic truncate">{user?.name}</h3>
                      <p className="text-xs md:text-sm font-bold text-indigo-600 tracking-widest uppercase mt-1 italic truncate">{user?.email}</p>
                   </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 md:gap-8">
                  <SettingInput label="Display Name" defaultValue={user?.name} />
                  <SettingInput label="Enterprise Email" defaultValue={user?.email} />
                  <SettingInput label="Assigned Company" defaultValue="ValuAI Systems" />
                  <SettingInput label="Inference Role" defaultValue={user?.role || 'Head of Operations'} />
                </div>

                <div className="pt-6 md:pt-10">
                   <button className="w-full sm:w-auto bg-indigo-600 text-white font-black py-4 px-10 rounded-2xl shadow-xl hover:opacity-90 transition-all active:scale-95">
                      Save Profile Updates
                   </button>
                </div>
              </div>
            )}

            {activeTab === 'security' && (
              <div className="space-y-8 animate-in slide-in-from-right-4">
                 <div className={`p-6 md:p-8 rounded-3xl border flex items-start space-x-4 ${user?.provider === 'google' ? 'bg-amber-50/50 border-amber-100/50' : 'bg-indigo-50/50 border-indigo-100/50'}`}>
                    <Shield className={user?.provider === 'google' ? 'text-amber-600 shrink-0' : 'text-indigo-600 shrink-0'} />
                    <div>
                       <h4 className={`font-black text-sm ${user?.provider === 'google' ? 'text-amber-950' : 'text-indigo-950'}`}>Authentication Method</h4>
                       <p className={`text-xs mt-1 font-medium leading-relaxed ${user?.provider === 'google' ? 'text-amber-700/60' : 'text-indigo-700/60'}`}>
                         {user?.provider === 'google' 
                            ? 'SSO active. Password management handled via Google account.' 
                            : 'Secured via local password strategy.'}
                       </p>
                    </div>
                 </div>

                 <div className="space-y-6">
                    <div>
                       <h3 className="text-[9px] md:text-[10px] font-black text-muted uppercase tracking-widest ml-1 mb-4">Password Management</h3>
                       {user?.provider === 'google' ? (
                          <div className="p-6 md:p-8 bg-input/40 dark:bg-slate-800/50 rounded-[1.8rem] md:rounded-[2rem] border border-border opacity-80 relative overflow-hidden">
                             <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                                <div className="flex items-center space-x-4 w-full sm:w-auto">
                                   <div className="p-3 bg-card dark:bg-slate-700 rounded-2xl shadow-sm shrink-0">
                                      <Lock size={20} className="text-muted/40" />
                                   </div>
                                   <div>
                                      <p className="text-xs md:text-sm font-black text-muted">Update Password</p>
                                      <p className="text-[8px] md:text-[9px] font-bold text-muted uppercase tracking-widest mt-1 italic leading-none">External SSO Management</p>
                                   </div>
                                </div>
                                <a 
                                  href="https://myaccount.google.com/security" 
                                  target="_blank" 
                                  rel="noopener noreferrer"
                                  className="w-full sm:w-auto px-5 py-3 bg-card dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 text-[10px] font-black rounded-xl border border-border shadow-sm hover:shadow-md transition-all flex items-center justify-center space-x-2 whitespace-nowrap"
                                >
                                   <span>Manage Google Security</span>
                                   <ArrowUpRight size={14} />
                                </a>
                             </div>
                             <div className="absolute top-2 right-2 p-1 text-amber-500 opacity-50"><Info size={12} /></div>
                          </div>
                       ) : (
                          <SecurityAction icon={<Lock size={16}/>} label="Update System Password" />
                       )}
                    </div>

                    <div className="space-y-4">
                       <h3 className="text-[9px] md:text-[10px] font-black text-muted uppercase tracking-widest ml-1">Additional Controls</h3>
                       <SecurityAction icon={<Shield size={16}/>} label="Two-Factor Auth" />
                       <SecurityAction icon={<Database size={16}/>} label="View Access Logs" />
                    </div>
                 </div>
              </div>
            )}

            {activeTab === 'preferences' && (
               <div className="space-y-8 md:space-y-10 animate-in slide-in-from-right-4">
                  <div className="space-y-6">
                    <div className="text-center sm:text-left">
                      <h3 className="text-lg md:text-xl font-black text-primary">Interface Appearance</h3>
                      <p className="text-xs md:text-sm font-medium text-muted">Choose how the dashboard looks on your device.</p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 md:gap-6">
                      <ThemeCard 
                        active={theme === 'light'} 
                        onClick={() => updateTheme('light')}
                        icon={<Sun className="text-amber-500" />} 
                        label="Light Mode" 
                        description="Professional"
                      />
                      <ThemeCard 
                        active={theme === 'dark'} 
                        onClick={() => updateTheme('dark')}
                        icon={<Moon className="text-indigo-400" />} 
                        label="Dark Mode" 
                        description="Reduced strain"
                      />
                      <ThemeCard 
                        active={theme === 'system'} 
                        onClick={() => updateTheme('system')}
                        icon={<Globe className="text-emerald-500" />} 
                        label="System Sync" 
                        description="Auto-matching"
                      />
                    </div>
                  </div>

                  <div className="p-6 md:p-8 bg-input/40 dark:bg-slate-800/50 rounded-[1.8rem] md:rounded-[2rem] border border-border">
                     <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                           <div className="p-3 bg-card dark:bg-slate-700 rounded-2xl shadow-sm text-indigo-600 shrink-0">
                              <Bell size={20} />
                           </div>
                           <div>
                              <p className="text-xs md:text-sm font-black text-primary">Dynamic Transitions</p>
                              <p className="text-[10px] md:text-xs text-muted font-medium">Enable smooth theme crossfades</p>
                           </div>
                        </div>
                        <div className="w-10 h-5 bg-indigo-600 rounded-full relative flex items-center px-1 shrink-0 cursor-pointer">
                           <div className="w-3.5 h-3.5 bg-white rounded-full translate-x-4.5"></div>
                        </div>
                     </div>
                  </div>
               </div>
            )}
            
            {activeTab === 'billing' && (
               <div className="text-center py-10 animate-in zoom-in-95">
                  <CreditCard className="w-12 h-12 text-muted mx-auto mb-4 opacity-30" />
                  <p className="text-sm font-black text-muted uppercase tracking-widest">Enterprise Billing Module</p>
                  <p className="text-xs text-muted mt-2">Connecting to secure gateway...</p>
               </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function TabButton({ active, icon, label, onClick }) {
  return (
    <button 
      onClick={onClick}
      className={`shrink-0 lg:w-full flex items-center justify-between p-4 px-6 lg:px-4 rounded-2xl font-bold text-xs md:text-sm transition-all whitespace-nowrap ${
        active 
          ? 'bg-indigo-600 text-white lg:bg-indigo-600 lg:text-white shadow-xl border-transparent' 
          : 'text-muted hover:bg-input bg-input/20 border-transparent'
      }`}
    >
      <div className="flex items-center space-x-3">
        {icon}
        <span>{label}</span>
      </div>
      {active && <ChevronRight size={14} className="hidden lg:block shrink-0" />}
    </button>
  );
}

function SettingInput({ label, defaultValue }) {
  return (
    <div className="space-y-2 font-inter">
      <label className="text-[9px] md:text-[10px] font-black text-muted uppercase tracking-widest ml-2">{label}</label>
      <input 
        defaultValue={defaultValue}
        className="w-full bg-input dark:bg-slate-800 border-none rounded-2xl py-4 px-6 focus:ring-2 focus:ring-indigo-600 transition-all outline-none text-sm font-bold text-primary placeholder:text-muted/30 shadow-inner"
      />
    </div>
  );
}

function SecurityAction({ icon, label }) {
  return (
    <button className="w-full flex items-center justify-between p-5 md:p-6 bg-input/30 dark:bg-slate-800/50 hover:bg-card dark:hover:bg-slate-800 hover:shadow-lg rounded-[1.5rem] transition-all group border border-transparent hover:border-border">
       <div className="flex items-center space-x-4">
          <div className="p-3 bg-card dark:bg-slate-700 rounded-xl text-muted group-hover:text-indigo-600 transition-colors shadow-sm shrink-0">{icon}</div>
          <span className="text-xs md:text-sm font-bold text-muted group-hover:text-primary transition-colors">{label}</span>
       </div>
       <ChevronRight size={16} className="text-muted group-hover:text-indigo-600 transition-colors shrink-0" />
    </button>
  );
}

function ThemeCard({ active, icon, label, description, onClick }) {
  return (
    <button 
      onClick={onClick}
      className={`p-5 md:p-6 rounded-[2rem] border-2 text-left transition-all relative overflow-hidden group ${active ? 'border-indigo-600 bg-indigo-50/20' : 'border-border bg-input/20 hover:border-muted/30'}`}
    >
      <div className={`p-2.5 md:p-3 rounded-2xl mb-4 inline-block ${active ? 'bg-card shadow-md' : 'bg-card/50 shadow-sm'}`}>
        {icon}
      </div>
      <h4 className={`text-xs md:text-sm font-black mb-1 ${active ? 'text-indigo-950 dark:text-indigo-100' : 'text-primary'}`}>{label}</h4>
      <p className="text-[8px] md:text-[9px] font-bold text-muted uppercase tracking-widest whitespace-nowrap">{description}</p>
      {active && (
        <div className="absolute top-4 right-4 w-1.5 h-1.5 bg-indigo-600 rounded-full"></div>
      )}
    </button>
  );
}

export default Settings;
