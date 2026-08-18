import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  Sparkles,
  LogOut,
  Upload,
  User,
  Menu,
  X,
  ExternalLink,
  Layers
} from 'lucide-react';

const Navbar = ({ onToggleSidebar, isSidebarOpen }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="sticky top-0 z-30 bg-[#0B0F19]/80 backdrop-blur-md border-b border-slate-800/80 px-4 sm:px-6 py-3">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Left: Brand & Mobile Toggle */}
        <div className="flex items-center gap-3">
          <button
            onClick={onToggleSidebar}
            className="md:hidden p-2 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
            aria-label="Toggle navigation"
          >
            {isSidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>

          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-purple-500 flex items-center justify-center text-white shadow-md shadow-indigo-600/30 group-hover:scale-105 transition-transform">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-base tracking-tight bg-gradient-to-r from-white via-slate-100 to-slate-300 bg-clip-text text-transparent">
                  MetaMind AI
                </span>
                <span className="hidden sm:inline-block px-1.5 py-0.5 rounded text-[10px] font-semibold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                  Hackathon
                </span>
              </div>
              <div className="hidden lg:block text-[10px] text-slate-400 font-medium tracking-wide">
                Tag → Understand → Search → Discover
              </div>
            </div>
          </Link>
        </div>

        {/* Right: Quick actions & User Profile */}
        <div className="flex items-center gap-3 sm:gap-4">
          <Link
            to="/upload"
            className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-md shadow-indigo-600/20 transition-all hover:scale-105"
          >
            <Upload className="w-3.5 h-3.5" />
            <span>Upload Script</span>
          </Link>

          <a
            href="http://localhost:8000/docs"
            target="_blank"
            rel="noreferrer"
            className="hidden md:inline-flex items-center gap-1 text-xs text-slate-400 hover:text-indigo-400 transition-colors font-medium px-2.5 py-1 rounded-lg hover:bg-slate-800"
          >
            <span>FastAPI Docs</span>
            <ExternalLink className="w-3 h-3" />
          </a>

          {user && (
            <div className="flex items-center gap-2.5 pl-2 sm:pl-3 border-l border-slate-800">
              <div className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700 text-indigo-400 flex items-center justify-center font-bold text-xs">
                {user.name ? user.name.charAt(0).toUpperCase() : <User className="w-4 h-4" />}
              </div>
              <div className="hidden md:block text-left">
                <div className="text-xs font-semibold text-slate-200 truncate max-w-[120px]">
                  {user.name}
                </div>
                <div className="text-[10px] text-slate-400 truncate max-w-[120px]">
                  {user.email}
                </div>
              </div>

              <button
                onClick={handleLogout}
                title="Log out"
                className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors ml-1"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Navbar;
