import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  Cpu, LayoutDashboard, History, 
  BarChart3, Settings, Car 
} from 'lucide-react';

function BottomNav() {
  const items = [
    { path: '/', icon: <LayoutDashboard size={20} />, label: 'Home' },
    { path: '/predict', icon: <Cpu size={20} />, label: 'Market' },
    { path: '/inventory', icon: <Car size={20} />, label: 'Fleet' },
    { path: '/history', icon: <History size={20} />, label: 'Logs' },
    { path: '/settings', icon: <Settings size={20} />, label: 'Meta' },
  ];

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 w-full h-[72px] bg-card/80 backdrop-blur-xl border-t border-border/50 flex flex-row items-center justify-around px-4 z-[100] safe-bottom">
      {items.map((item) => (
        <NavLink
          key={item.path}
          to={item.path}
          className={({ isActive }) => `
            flex flex-col items-center justify-center flex-1 h-full space-y-1 transition-all duration-300 relative
            ${isActive 
              ? 'text-indigo-600' 
              : 'text-muted hover:text-indigo-400'
            }
          `}
        >
          {({ isActive }) => (
            <>
              <div className={`transition-transform duration-300 ${isActive ? 'scale-110' : ''}`}>
                {item.icon}
              </div>
              <span className="text-[10px] font-black uppercase tracking-tighter tabular-nums">{item.label}</span>
              {isActive && (
                <div className="absolute top-0 w-8 h-1 bg-indigo-600 rounded-b-full"></div>
              )}
            </>
          )}
        </NavLink>
      ))}
    </nav>
  );
}

export default BottomNav;
