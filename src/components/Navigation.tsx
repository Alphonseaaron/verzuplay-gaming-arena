
import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, ChevronDown, User, Wallet, Bell } from 'lucide-react';
import Logo from './Logo';
import GlassMorphicContainer from './GlassMorphicContainer';

const Navigation = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();

  const navLinks = [
    { name: 'Games', path: '/games' },
    { name: 'Tournaments', path: '/tournaments' },
    { name: 'Leaderboard', path: '/leaderboard' },
    { name: 'About', path: '/about' },
  ];

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled ? 'py-2 bg-verzus-background/80 backdrop-blur-lg shadow-md' : 'py-4'
      }`}
    >
      <div className="container mx-auto px-4 md:px-6">
        <div className="flex items-center justify-between">
          <Logo />

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-1">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                to={link.path}
                className={`px-4 py-2 rounded-lg transition-all duration-300 ${
                  location.pathname === link.path
                    ? 'text-verzus-accent font-medium'
                    : 'text-verzus-text-primary hover:text-verzus-accent hover:bg-white/5'
                }`}
              >
                {link.name}
              </Link>
            ))}
          </nav>

          {/* Desktop Action Buttons */}
          <div className="hidden md:flex items-center space-x-2">
            <button className="p-2 rounded-lg text-verzus-text-secondary hover:text-verzus-accent hover:bg-white/5 transition-all duration-300 relative">
              <Bell size={20} />
              <span className="absolute top-0 right-0 w-2 h-2 bg-verzus-accent rounded-full"></span>
            </button>
            <button className="p-2 rounded-lg text-verzus-text-secondary hover:text-verzus-accent hover:bg-white/5 transition-all duration-300">
              <Wallet size={20} />
            </button>
            <button className="btn-ghost flex items-center gap-1">
              <User size={18} />
              <span>Sign In</span>
            </button>
            <button className="btn-primary">
              Register
            </button>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2 rounded-lg text-verzus-text-primary hover:text-verzus-accent transition-colors"
            onClick={toggleMobileMenu}
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <div
        className={`fixed inset-0 top-[60px] z-40 transform transition-transform duration-300 ease-in-out md:hidden ${
          mobileMenuOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <GlassMorphicContainer className="h-full p-6 flex flex-col space-y-6 overflow-y-auto rounded-none">
          <nav className="flex flex-col space-y-4">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                to={link.path}
                className={`px-4 py-3 rounded-lg transition-colors ${
                  location.pathname === link.path
                    ? 'bg-verzus-primary/10 text-verzus-accent font-medium'
                    : 'text-verzus-text-primary hover:bg-white/5'
                }`}
                onClick={() => setMobileMenuOpen(false)}
              >
                {link.name}
              </Link>
            ))}
          </nav>
          <div className="flex flex-col space-y-3 mt-auto">
            <button className="btn-ghost flex items-center justify-center gap-2">
              <User size={18} />
              <span>Sign In</span>
            </button>
            <button className="btn-primary">
              Register
            </button>
          </div>
        </GlassMorphicContainer>
      </div>
    </header>
  );
};

export default Navigation;
