
import React from 'react';
import { Link } from 'react-router-dom';
import Logo from './Logo';
import { Facebook, Twitter, Instagram, Youtube, Mail } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-verzus-background-light border-t border-white/5 pt-16 pb-8">
      <div className="container mx-auto px-4 md:px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
          <div>
            <Logo className="mb-6" />
            <p className="text-verzus-text-secondary mb-6">
              VerzusPlay is a competitive gaming platform where players can compete in skill-based games with real-money stakes.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-verzus-text-secondary hover:text-verzus-accent transition-colors">
                <Facebook size={20} />
              </a>
              <a href="#" className="text-verzus-text-secondary hover:text-verzus-accent transition-colors">
                <Twitter size={20} />
              </a>
              <a href="#" className="text-verzus-text-secondary hover:text-verzus-accent transition-colors">
                <Instagram size={20} />
              </a>
              <a href="#" className="text-verzus-text-secondary hover:text-verzus-accent transition-colors">
                <Youtube size={20} />
              </a>
            </div>
          </div>
          
          <div>
            <h3 className="text-white font-bold mb-4">Games</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/games/category/board" className="text-verzus-text-secondary hover:text-verzus-accent transition-colors">
                  Board Games
                </Link>
              </li>
              <li>
                <Link to="/games/category/skill" className="text-verzus-text-secondary hover:text-verzus-accent transition-colors">
                  Skill Games
                </Link>
              </li>
              <li>
                <Link to="/games/category/casino" className="text-verzus-text-secondary hover:text-verzus-accent transition-colors">
                  Casino Games
                </Link>
              </li>
              <li>
                <Link to="/tournaments" className="text-verzus-text-secondary hover:text-verzus-accent transition-colors">
                  Tournaments
                </Link>
              </li>
              <li>
                <Link to="/leaderboard" className="text-verzus-text-secondary hover:text-verzus-accent transition-colors">
                  Leaderboard
                </Link>
              </li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-white font-bold mb-4">Support</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/help" className="text-verzus-text-secondary hover:text-verzus-accent transition-colors">
                  Help Center
                </Link>
              </li>
              <li>
                <Link to="/faq" className="text-verzus-text-secondary hover:text-verzus-accent transition-colors">
                  FAQ
                </Link>
              </li>
              <li>
                <Link to="/contact" className="text-verzus-text-secondary hover:text-verzus-accent transition-colors">
                  Contact Us
                </Link>
              </li>
              <li>
                <Link to="/responsible-gaming" className="text-verzus-text-secondary hover:text-verzus-accent transition-colors">
                  Responsible Gaming
                </Link>
              </li>
              <li>
                <Link to="/terms" className="text-verzus-text-secondary hover:text-verzus-accent transition-colors">
                  Terms of Service
                </Link>
              </li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-white font-bold mb-4">Newsletter</h3>
            <p className="text-verzus-text-secondary mb-4">Subscribe to get updates on new games and tournaments.</p>
            <div className="flex">
              <input
                type="email"
                placeholder="Your email"
                className="bg-verzus-background border border-white/10 text-verzus-text-primary px-4 py-2 rounded-l-lg focus:outline-none focus:ring-2 focus:ring-verzus-accent w-full"
              />
              <button className="bg-verzus-primary text-white px-4 py-2 rounded-r-lg hover:bg-verzus-primary/90 transition-colors">
                <Mail size={16} />
              </button>
            </div>
          </div>
        </div>
        
        <div className="border-t border-white/5 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-verzus-text-secondary text-sm mb-4 md:mb-0">
            &copy; {new Date().getFullYear()} VerzusPlay. All rights reserved.
          </p>
          <div className="flex space-x-6">
            <Link to="/privacy" className="text-verzus-text-secondary hover:text-verzus-accent transition-colors text-sm">
              Privacy Policy
            </Link>
            <Link to="/terms" className="text-verzus-text-secondary hover:text-verzus-accent transition-colors text-sm">
              Terms of Service
            </Link>
            <Link to="/cookies" className="text-verzus-text-secondary hover:text-verzus-accent transition-colors text-sm">
              Cookies Policy
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
