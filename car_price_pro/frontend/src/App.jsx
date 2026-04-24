import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import axios from 'axios';

// Layout & Pages
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Inventory from './pages/Inventory';
import Analytics from './pages/Analytics';
import History from './pages/History';
import Settings from './pages/Settings';
import Predict from './pages/Predict';

// Auth Components
import { Car, Loader2, AlertCircle, ArrowRight, CheckCircle2, User, Mail, Lock, ShieldCheck } from 'lucide-react';

import { GoogleLogin } from '@react-oauth/google';
import { jwtDecode } from 'jwt-decode';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:9000';

function App() {
  const [token, setToken] = useState(localStorage.getItem('access_token'));
  const [user, setUser] = useState(JSON.parse(localStorage.getItem('userData')));
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(null);
  const [error, setError] = useState(null);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirm_password: ''
  });

  const handleGoogleSuccess = async (credentialResponse) => {
    setLoading(true);
    setError(null);
    try {
      const resp = await axios.post(`${API_BASE}/api/auth/google/`, {
        token: credentialResponse.credential
      });
      
      const sessionUser = resp.data.user;
      const sessionToken = resp.data.access;

      setToken(sessionToken);
      setUser(sessionUser);
      localStorage.setItem('access_token', sessionToken);
      localStorage.setItem('userData', JSON.stringify(sessionUser));

    } catch (err) {
      console.error("AUTH_ERROR:", err);
      // Detailed error reporting
      const errorMsg = err.response?.data?.error || 
                       err.response?.data?.detail || 
                       (err.message === 'Network Error' ? 'Connection Blocked (Ensure Backend is using HTTPS or use Localhost)' : err.message);
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const resp = await axios.post(`${API_BASE}/api/login/`, {
        email: formData.email,
        password: formData.password
      });
      const jwtToken = resp.data.access;
      const dummyUser = { 
        name: formData.email.split('@')[0], 
        email: formData.email, 
        avatar: `https://ui-avatars.com/api/?name=${formData.email}&background=6366f1&color=fff`,
        role: 'Standard User',
        provider: 'local'
      };
      
      setToken(jwtToken);
      setUser(dummyUser);
      localStorage.setItem('access_token', jwtToken);
      localStorage.setItem('userData', JSON.stringify(dummyUser));
    } catch (err) {
      setError(err.response?.data?.detail || 'Login failed. Check server status.');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      if (formData.password !== formData.confirm_password) {
        throw new Error("Passwords do not match");
      }
      await axios.post(`${API_BASE}/api/register/`, {
        name: formData.name,
        email: formData.email,
        password: formData.password,
        confirm_password: formData.confirm_password
      });
      setSuccess("Account created! Please sign in.");
      setIsLogin(true);
    } catch (err) {
      setError(err.response?.data?.error || err.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('userData');
    setToken(null);
    setUser(null);
  };

  return (
    <BrowserRouter>
      <Routes>
        {token && user ? (
          <Route element={<Layout onLogout={handleLogout} />}>
            <Route path="/" element={<Dashboard user={user} />} />
            <Route path="/inventory" element={<Inventory />} />
            <Route path="/analytics" element={<Analytics />} />
            <Route path="/history" element={<History />} />
            <Route path="/predict" element={<Predict />} />
            <Route path="/settings" element={<Settings user={user} />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        ) : (
          <Route path="*" element={
            <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center p-6 transition-colors font-inter">
              <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-2xl p-10 border border-slate-100 dark:border-slate-800 animate-in fade-in zoom-in duration-500">
                <div className="text-center mb-10">
                  <div className="w-14 h-14 bg-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg rotate-3 border-4 border-white dark:border-slate-800">
                    <Car className="text-white w-7 h-7" />
                  </div>
                  <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight leading-none">ValuAI Edge</h1>
                  <p className="text-slate-500 dark:text-slate-400 font-medium mt-3">{isLogin ? 'Sign in to access engine' : 'Create your secure account'}</p>
                </div>

                {success && (
                  <div className="mb-6 p-4 bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-100 dark:border-emerald-500/20 rounded-2xl flex items-center space-x-3 text-emerald-700 dark:text-emerald-400">
                    <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
                    <p className="text-sm font-bold">{success}</p>
                  </div>
                )}

                <form onSubmit={isLogin ? handleLogin : handleRegister} className="space-y-4">
                  {!isLogin && (
                    <AuthInput label="Full Name" icon={<User className="w-4 h-4" />} type="text" placeholder="John Doe" 
                      value={formData.name} onChange={v => setFormData({...formData, name: v})} />
                  )}
                  <AuthInput label="Email Address" icon={<Mail className="w-4 h-4" />} type="email" placeholder="john@company.com" 
                    value={formData.email} onChange={v => setFormData({...formData, email: v})} />
                  <AuthInput label="Password" icon={<Lock className="w-4 h-4" />} type="password" placeholder="••••••••" 
                    value={formData.password} onChange={v => setFormData({...formData, password: v})} />
                  {!isLogin && (
                    <AuthInput label="Confirm Password" icon={<ShieldCheck className="w-4 h-4" />} type="password" placeholder="••••••••" 
                      value={formData.confirm_password} onChange={v => setFormData({...formData, confirm_password: v})} />
                  )}

                  {error && (
                    <div className="p-4 bg-red-50 dark:bg-red-500/10 border border-red-500 rounded-2xl flex items-center space-x-3 text-red-600 dark:text-red-400 font-bold text-[10px] uppercase leading-tight">
                      <AlertCircle className="w-4 h-4 shrink-0" /> <span>{error}</span>
                    </div>
                  )}

                  <button disabled={loading} className="w-full bg-slate-900 dark:bg-indigo-600 text-white font-black py-4 rounded-3xl hover:opacity-90 transition-all flex items-center justify-center space-x-2 shadow-xl hover:-translate-y-1 disabled:opacity-70">
                    {loading ? <Loader2 className="animate-spin w-5 h-5" /> : <span>{isLogin ? 'Sign In Engine' : 'Create Access'}</span>}
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </form>

                {isLogin && (
                  <div className="mt-8 space-y-6">
                    <div className="relative">
                      <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-100 dark:border-slate-800"></div></div>
                      <div className="relative flex justify-center text-xs"><span className="px-3 bg-white dark:bg-slate-900 text-slate-400 font-bold uppercase tracking-widest">Or Securely Login With</span></div>
                    </div>
                    <div className="flex justify-center">
                      <GoogleLogin 
                        onSuccess={handleGoogleSuccess}
                        onError={() => setError('Google Authentication Failed')}
                        theme={document.documentElement.classList.contains('dark') ? 'filled_black' : 'outline'}
                        shape="pill"
                        width="380"
                      />
                    </div>
                  </div>
                )}

                <div className="mt-8 text-center">
                  <button onClick={() => { setIsLogin(!isLogin); setError(null); setSuccess(null); }} className="text-sm font-black text-slate-400 hover:text-indigo-600 transition-colors">
                    {isLogin ? "Don't have an account? Create one" : "Already have an account? Sign in"}
                  </button>
                </div>
              </div>
            </div>
          } />
        )}
      </Routes>
    </BrowserRouter>
  );
}

function AuthInput({ label, icon, ...props }) {
  return (
    <div className="group font-inter">
      <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1.5 ml-2 group-focus-within:text-indigo-600 transition-colors">{label}</label>
      <div className="relative">
        <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-indigo-500">{icon}</div>
        <input {...props} className="w-full pl-11 pr-5 py-4 bg-slate-50 text-slate-900 border-none rounded-2xl text-sm font-bold focus:ring-2 focus:ring-indigo-600 transition-all outline-none placeholder:text-slate-400" onChange={(e) => props.onChange(e.target.value)} />
      </div>
    </div>
  );
}

export default App;
