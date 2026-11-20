import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ShoppingBag,
  Search,
  ShoppingCart,
  Menu,
  X,
  LayoutDashboard,
  LogOut,
  PackageCheck,
  ArrowUpRight,
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
    <header className="sticky top-0 z-50 bg-[#120a06]/95 backdrop-blur-md border-b border-[#2d1b11] text-[#f5f4ef] transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20 gap-4">
          {/* Left Navigation Links */}
          <nav className="hidden lg:flex items-center gap-7 text-xs font-mono-code tracking-widest text-[#d8d2c4] uppercase">
            <Link to="/products" className="hover:text-white transition-colors">
              Shop
            </Link>
            <Link to="/products?category=hot-brews-espresso" className="hover:text-white transition-colors">
              Menu
            </Link>
            <a href="#philosophy" className="hover:text-white transition-colors">
              Our Story
            </a>
            <a href="#locations" className="hover:text-white transition-colors">
              Locations
            </a>
          </nav>

          {/* Center Brand Logo: brewns® */}
          <div className="flex items-center">
            <Link
              to="/"
              className="text-2xl md:text-3xl font-extrabold tracking-tighter text-[#f5f4ef] hover:opacity-90 transition-opacity font-syne lowercase"
            >
              brewns<span className="text-xs align-super ml-0.5 font-normal tracking-normal text-[#d4a373]">®</span>
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
                    placeholder="Search coffee, roasts, pastries..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onBlur={() => !searchQuery && setSearchOpen(false)}
                    className="w-48 sm:w-64 bg-[#1e120b] text-xs font-mono-code text-[#f5f4ef] rounded-full pl-8 pr-3 py-1.5 border border-[#3f271a] focus:outline-none focus:border-[#d4a373]"
                  />
                  <Search className="w-3.5 h-3.5 text-[#a89b8d] absolute left-2.5 pointer-events-none" />
                </form>
              ) : (
                <button
                  onClick={() => setSearchOpen(true)}
                  className="p-2 text-[#d8d2c4] hover:text-white transition-colors cursor-pointer"
                  title="Search"
                >
                  <Search className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Shopping Cart */}
            <Link
              to="/cart"
              className="relative p-2 text-[#d8d2c4] hover:text-white transition-colors flex items-center"
              title="Shopping Bag"
            >
              <ShoppingBag className="w-4 h-4" />
              {itemCount > 0 && (
                <span className="absolute -top-1 -right-1 min-w-4.5 h-4.5 bg-[#d4a373] text-[#120a06] text-[10px] font-bold font-mono-code rounded-full flex items-center justify-center px-1 shadow-sm">
                  {itemCount}
                </span>
              )}
            </Link>

            {/* Order Online Live Button */}
            <Link
              to="/products"
              className="hidden sm:inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#f5f4ef] text-[#120a06] text-xs font-mono-code font-bold tracking-wider uppercase hover:bg-[#e2ded2] transition-colors shadow-sm"
            >
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping inline-block" />
              <span>Order Online</span>
            </Link>

            {/* User Dropdown / Login */}
            {isAuthenticated ? (
              <div className="relative">
                <button
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  className="flex items-center gap-2 p-1 pl-2 pr-1.5 rounded-full border border-[#3a2316] bg-[#1c110a] hover:bg-[#25170e] transition-colors cursor-pointer"
                >
                  <div className="w-6 h-6 rounded-full bg-[#d4a373] text-[#120a06] font-bold text-xs flex items-center justify-center font-mono-code">
                    {user?.name.charAt(0).toUpperCase()}
                  </div>
                </button>

                {userDropdownOpen && (
                  <>
                    <div
                      className="fixed inset-0 z-40"
                      onClick={() => setUserDropdownOpen(false)}
                    />
                    <div className="absolute right-0 mt-2 w-56 rounded-2xl bg-[#1a100a] border border-[#3a2316] shadow-2xl py-2 z-50 animate-in fade-in zoom-in-95 font-mono-code text-xs text-[#e8e4db]">
                      <div className="px-4 py-2.5 border-b border-[#2d1b11]">
                        <p className="font-bold text-white truncate">{user?.name}</p>
                        <p className="text-[11px] text-[#a89b8d] truncate">{user?.email}</p>
                        {isAdmin && (
                          <span className="inline-block mt-1 text-[9px] font-bold text-[#d4a373] bg-[#d4a373]/15 border border-[#d4a373]/30 px-2 py-0.5 rounded-full">
                            BARISTA / ADMIN
                          </span>
                        )}
                      </div>

                      <div className="py-1">
                        {isAdmin && (
                          <Link
                            to="/admin"
                            onClick={() => setUserDropdownOpen(false)}
                            className="flex items-center gap-2 px-4 py-2 hover:bg-[#25170e] text-[#d4a373] transition-colors"
                          >
                            <LayoutDashboard className="w-3.5 h-3.5" />
                            Admin Console
                          </Link>
                        )}
                        <Link
                          to="/orders"
                          onClick={() => setUserDropdownOpen(false)}
                          className="flex items-center gap-2 px-4 py-2 hover:bg-[#25170e] transition-colors"
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
                className="text-xs font-mono-code tracking-wider uppercase text-[#d8d2c4] hover:text-white px-2 py-1"
              >
                Sign In
              </Link>
            )}

            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 text-[#d8d2c4] hover:text-white"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-[#160e09] border-b border-[#2d1b11] px-4 pt-3 pb-6 font-mono-code text-xs uppercase tracking-wider space-y-3">
          <Link
            to="/products"
            onClick={() => setMobileMenuOpen(false)}
            className="block py-2 text-[#d8d2c4] hover:text-white"
          >
            Shop All
          </Link>
          <Link
            to="/products?category=hot-brews-espresso"
            onClick={() => setMobileMenuOpen(false)}
            className="block py-2 text-[#d8d2c4] hover:text-white"
          >
            Espresso Menu
          </Link>
          <Link
            to="/products?category=iced-cold-specialty"
            onClick={() => setMobileMenuOpen(false)}
            className="block py-2 text-[#d8d2c4] hover:text-white"
          >
            Cold Specialties
          </Link>
          <Link
            to="/products?category=single-origin-beans"
            onClick={() => setMobileMenuOpen(false)}
            className="block py-2 text-[#d8d2c4] hover:text-white"
          >
            Whole Beans
          </Link>
          <Link
            to="/cart"
            onClick={() => setMobileMenuOpen(false)}
            className="flex items-center justify-between py-2 text-[#d4a373]"
          >
            <span>Your Bag</span>
            <span>({itemCount})</span>
          </Link>
        </div>
      )}
    </header>
  );
};
