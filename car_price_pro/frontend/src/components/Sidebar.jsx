import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  Car, LayoutDashboard, Database, TrendingUp, 
  History, Settings, LogOut, Cpu
} from 'lucide-react';

function Sidebar({ onLogout }) {
  const navItems = [
    { icon: <LayoutDashboard size={18}/>, label: "Dashboard", path: "/" },
    { icon: <Cpu size={18}/>, label: "Compute AI", path: "/predict" },
    { icon: <Database size={18}/>, label: "Inventory", path: "/inventory" },
    { icon: <TrendingUp size={18}/>, label: "Analytics", path: "/analytics" },
    { icon: <History size={18}/>, label: "History", path: "/history" },
    { icon: <Settings size={18}/>, label: "Settings", path: "/settings" },
  ];

  return (
    <aside className="w-full flex flex-col h-screen bg-card transition-colors duration-300">
      <div className="p-8 flex-1 flex flex-col">
        <div className="flex items-center space-x-3 text-primary mb-10 transition-colors duration-300">
          <div className="w-10 h-10 bg-indigo-500 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/20">
            <Car className="w-6 h-6 text-white" />
          </div>
          <span className="text-xl font-black tracking-tighter">ValuAI</span>
        </div>

        <nav className="space-y-1.5 md:space-y-2">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) => 
                `flex items-center space-x-4 p-4 rounded-2xl cursor-pointer transition-all duration-300 ${
                  isActive 
                  ? 'bg-indigo-600 text-white shadow-lg' 
                  : 'text-muted hover:bg-input hover:text-primary'
                }`
              }
            >
              {item.icon}
              <span className="font-bold text-sm tracking-tight">{item.label}</span>
            </NavLink>
          ))}
        </nav>
      </div>

      <div className="p-8 border-t border-border transition-colors duration-300">
        <button 
          onClick={onLogout}
          className="flex items-center space-x-3 text-muted hover:text-primary transition-colors duration-300 w-full"
        >
          <LogOut size={18} />
          <span className="font-bold text-sm">Sign Out System</span>
        </button>
      </div>
    </aside>
  );
}

export default Sidebar;
