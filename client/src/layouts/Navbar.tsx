import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ShoppingBag,
  Search,
  Menu,
  X,
  LayoutDashboard,
  LogOut,
  PackageCheck,
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { useCart } from '../hooks/useCart';

export const Navbar: React.FC = () => {
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const { itemCount } = useCart();
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const navigate = useNavigate();

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchOpen(false);
      setMobileMenuOpen(false);
    }
  };

  return (
    <header className="sticky top-0 z-50 bg-[#0c0d14]/95 backdrop-blur-md border-b border-[#1f2333] text-[#f5f4ef] transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20 gap-4">
          {/* Left Navigation Links */}
          <nav className="hidden lg:flex items-center gap-7 text-xs font-mono-code tracking-widest text-[#a3a9be] uppercase">
            <Link to="/products" className="hover:text-white transition-colors">
              Shop
            </Link>
            <Link to="/products?category=electronics-audio" className="hover:text-white transition-colors">
              Hardware
            </Link>
            <Link to="/products?category=mechanical-computing" className="hover:text-white transition-colors">
              Computing
            </Link>
            <a href="#philosophy" className="hover:text-white transition-colors">
              About
            </a>
            <a href="#locations" className="hover:text-white transition-colors">
              Labs
            </a>
          </nav>

          {/* Center Brand Logo: shopvista® */}
          <div className="flex items-center">
            <Link
              to="/"
              className="text-2xl md:text-3xl font-extrabold tracking-tighter text-[#f5f4ef] hover:opacity-90 transition-opacity font-syne lowercase"
            >
              shopvista<span className="text-xs align-super ml-0.5 font-normal tracking-normal text-[#3b82f6]">®</span>
            </Link>
          </div>

          {/* Right Controls */}
          <div className="flex items-center gap-3 md:gap-5">
            {/* Search Button / Bar */}
            <div className="relative">
              {searchOpen ? (
                <form onSubmit={handleSearchSubmit} className="flex items-center">
                  <input
                    type="text"
                    autoFocus
                    placeholder="Search devices, audio, EDC..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onBlur={() => !searchQuery && setSearchOpen(false)}
                    className="w-48 sm:w-64 bg-[#141724] text-xs font-mono-code text-[#f5f4ef] rounded-full pl-8 pr-3 py-1.5 border border-[#2b3048] focus:outline-none focus:border-[#3b82f6]"
                  />
                  <Search className="w-3.5 h-3.5 text-[#737b98] absolute left-2.5 pointer-events-none" />
                </form>
              ) : (
                <button
                  onClick={() => setSearchOpen(true)}
                  className="p-2 text-[#a3a9be] hover:text-white transition-colors cursor-pointer"
                  title="Search"
                >
                  <Search className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Shopping Bag */}
            <Link
              to="/cart"
              className="relative p-2 text-[#a3a9be] hover:text-white transition-colors flex items-center"
              title="Shopping Bag"
            >
              <ShoppingBag className="w-4 h-4" />
              {itemCount > 0 && (
                <span className="absolute -top-1 -right-1 min-w-4.5 h-4.5 bg-[#3b82f6] text-white text-[10px] font-bold font-mono-code rounded-full flex items-center justify-center px-1 shadow-sm">
                  {itemCount}
                </span>
              )}
            </Link>

            {/* Order Online Live Button */}
            <Link
              to="/products"
              className="hidden sm:inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#f5f4ef] text-[#0c0d14] text-xs font-mono-code font-bold tracking-wider uppercase hover:bg-white transition-colors shadow-sm"
            >
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping inline-block" />
              <span>Order Online</span>
            </Link>

            {/* User Dropdown / Login */}
            {isAuthenticated ? (
              <div className="relative">
                <button
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  className="flex items-center gap-2 p-1 pl-2 pr-1.5 rounded-full border border-[#272b3e] bg-[#141724] hover:bg-[#1a1f30] transition-colors cursor-pointer"
                >
                  <div className="w-6 h-6 rounded-full bg-[#3b82f6] text-white font-bold text-xs flex items-center justify-center font-mono-code">
                    {user?.name.charAt(0).toUpperCase()}
                  </div>
                </button>

                {userDropdownOpen && (
                  <>
                    <div
                      className="fixed inset-0 z-40"
                      onClick={() => setUserDropdownOpen(false)}
                    />
                    <div className="absolute right-0 mt-2 w-56 rounded-2xl bg-[#141724] border border-[#272b3e] shadow-2xl py-2 z-50 animate-in fade-in zoom-in-95 font-mono-code text-xs text-[#e8eaf2]">
                      <div className="px-4 py-2.5 border-b border-[#212538]">
                        <p className="font-bold text-white truncate">{user?.name}</p>
                        <p className="text-[11px] text-[#868fa8] truncate">{user?.email}</p>
                        {isAdmin && (
                          <span className="inline-block mt-1 text-[9px] font-bold text-[#60a5fa] bg-[#3b82f6]/15 border border-[#3b82f6]/30 px-2 py-0.5 rounded-full">
                            ADMINISTRATOR
                          </span>
                        )}
                      </div>

                      <div className="py-1">
                        {isAdmin && (
                          <Link
                            to="/admin"
                            onClick={() => setUserDropdownOpen(false)}
                            className="flex items-center gap-2 px-4 py-2 hover:bg-[#1c2133] text-[#60a5fa] transition-colors"
                          >
                            <LayoutDashboard className="w-3.5 h-3.5" />
                            Admin Console
                          </Link>
                        )}
                        <Link
                          to="/orders"
                          onClick={() => setUserDropdownOpen(false)}
                          className="flex items-center gap-2 px-4 py-2 hover:bg-[#1c2133] transition-colors"
                        >
                          <PackageCheck className="w-3.5 h-3.5" />
                          Order History
                        </Link>
                        <button
                          onClick={() => {
                            setUserDropdownOpen(false);
                            logout();
                          }}
                          className="w-full flex items-center gap-2 px-4 py-2 text-rose-400 hover:bg-rose-950/30 transition-colors text-left cursor-pointer"
                        >
                          <LogOut className="w-3.5 h-3.5" />
                          Sign Out
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            ) : (
              <Link
                to="/login"
                className="text-xs font-mono-code tracking-wider uppercase text-[#a3a9be] hover:text-white px-2 py-1"
              >
                Sign In
              </Link>
            )}

            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 text-[#a3a9be] hover:text-white"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-[#0f111a] border-b border-[#212538] px-4 pt-3 pb-6 font-mono-code text-xs uppercase tracking-wider space-y-3">
          <Link
            to="/products"
            onClick={() => setMobileMenuOpen(false)}
            className="block py-2 text-[#a3a9be] hover:text-white"
          >
            All Products
          </Link>
          <Link
            to="/products?category=electronics-audio"
            onClick={() => setMobileMenuOpen(false)}
            className="block py-2 text-[#a3a9be] hover:text-white"
          >
            Audio & Electronics
          </Link>
          <Link
            to="/products?category=mechanical-computing"
            onClick={() => setMobileMenuOpen(false)}
            className="block py-2 text-[#a3a9be] hover:text-white"
          >
            Computing Gear
          </Link>
          <Link
            to="/products?category=wearables-smart-tech"
            onClick={() => setMobileMenuOpen(false)}
            className="block py-2 text-[#a3a9be] hover:text-white"
          >
            Wearables
          </Link>
          <Link
            to="/cart"
            onClick={() => setMobileMenuOpen(false)}
            className="flex items-center justify-between py-2 text-[#60a5fa]"
          >
            <span>Shopping Bag</span>
            <span>({itemCount})</span>
          </Link>
        </div>
      )}
    </header>
  );
};
