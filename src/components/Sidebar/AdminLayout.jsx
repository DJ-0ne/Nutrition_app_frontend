// src/components/admin/AdminLayout.jsx
import React from 'react';
import { NavLink } from 'react-router-dom';
import adminSidebar from '../sidebarData/AdminSidebar/AdminSidebar';

export default function AdminLayout({ children, user, logout }) {
  // Safe display name: prefer username (what Django returns), fallback to name
  const displayName = user?.username || user?.name || 'Admin';
  const avatarName = user?.username || user?.name || 'Admin';

  return (
    <div className="flex min-h-screen bg-slate-50 text-slate-900 font-sans">
      {/* Sidebar - Desktop Only */}
      <aside className="hidden lg:flex flex-col w-64 bg-white/80 backdrop-blur-xl border-r border-slate-200 sticky top-0 h-screen shadow-[10px_0_40px_rgba(0,0,0,0.05)] z-50 transition-all duration-500">
        
        {/* Logo Header */}
        <div className="p-6 flex items-center gap-3 border-b border-slate-200 mb-4 group transition-all duration-300">
          <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-violet-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-200/50 group-hover:shadow-indigo-400/50 group-hover:scale-110 transition-all duration-300">
            <span className="text-white font-extrabold text-sm tracking-tighter">AD</span>
          </div>
          <div className="transition-all duration-300">
            <h1 className="font-extrabold text-slate-800 text-base leading-tight tracking-tight group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-indigo-600 group-hover:to-violet-600 transition-all duration-300">
              Admin Panel
            </h1>
            <p className="text-[10px] font-bold text-indigo-600 uppercase tracking-[0.2em]">ABCDE Nutrition</p>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 space-y-2">
          {adminSidebar.map((item) => {
            const isLogout = item.link === '/Logout' || item.title.toLowerCase().includes('logout');

            return (
              <NavLink
                key={item.link}
                to={item.link}
                onClick={isLogout ? (e) => {
                  e.preventDefault();
                  logout();
                } : undefined}
                className={({ isActive }) => `w-full flex items-center gap-4 px-4 py-3.5 rounded-2xl transition-all duration-500 group relative overflow-hidden ${
                  isActive
                    ? 'bg-gradient-to-r from-indigo-50/80 to-violet-50/50 text-indigo-700 font-bold shadow-lg ring-2 ring-indigo-200/50 scale-105'
                    : isLogout
                    ? 'text-red-500 hover:bg-red-50/80 hover:text-red-700'
                    : 'text-slate-500 hover:bg-slate-50/80 hover:text-slate-700 hover:scale-102'
                }`}
              >
                {({ isActive }) => (
                  <>
                    <div className={`relative z-10 transition-all duration-500 ${
                      isActive 
                        ? 'text-indigo-600 scale-110 drop-shadow-lg' 
                        : isLogout 
                        ? 'text-red-500 group-hover:text-red-700' 
                        : 'text-slate-400 group-hover:text-slate-700 group-hover:scale-105'
                    }`}>
                      {item.icon}
                    </div>

                    <span className="relative z-10 text-sm tracking-wide transition-all duration-300">
                      {item.title}
                    </span>
                    
                    {/* Active indicator bar */}
                    {isActive && (
                      <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-gradient-to-b from-indigo-400 to-violet-600 rounded-r-full shadow-lg shadow-indigo-300/50 animate-pulse" />
                    )}
                  </>
                )}
              </NavLink>
            );
          })}
        </nav>

        {/* User Info Footer */}
        <div className="p-4 border-t border-slate-200 bg-gradient-to-b from-transparent to-white/40 transition-all duration-300">
          <div className="p-4 bg-white/60 backdrop-blur-sm rounded-2xl flex items-center gap-3 border border-slate-200/60 shadow-sm transition-all duration-300 hover:shadow-xl hover:bg-white/80 hover:scale-105 cursor-pointer group">
            <div className="w-10 h-10 bg-gradient-to-br from-indigo-100 to-violet-50 rounded-full flex items-center justify-center text-indigo-700 font-bold border-2 border-white shadow-sm overflow-hidden ring-2 ring-indigo-50 transition-all duration-300 group-hover:ring-indigo-200">
              <img 
                src={`https://ui-avatars.com/api/?name=${encodeURIComponent(avatarName)}&background=6366f1&color=fff`} 
                alt="Avatar" 
                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110" 
              />
            </div>
            <div className="flex-1 min-w-0 transition-all duration-300">
              <p className="text-sm font-black text-slate-800 truncate group-hover:text-indigo-700">
                {displayName}
              </p>
              <p className="text-[10px] text-slate-500 truncate capitalize font-bold tracking-wide transition-colors duration-300 group-hover:text-indigo-600">
                Admin
              </p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        <header className="bg-white/80 backdrop-blur-xl border-b border-slate-200 sticky top-0 z-50 px-4 lg:px-10 py-4 flex justify-between items-center shadow-sm transition-all duration-300">
          <div className="flex items-center gap-4">
            <h1 className="text-2xl font-black text-transparent bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text">Admin Panel</h1>
          </div>
          <div className="flex items-center gap-6">
            <span className="text-sm text-slate-500 hidden lg:block">
              Logged in as <span className="font-semibold text-slate-800">{displayName}</span>
            </span>
          </div>
        </header>

        <main className="flex-1 p-6 lg:p-10">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}