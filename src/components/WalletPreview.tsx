
import React from 'react';
import GlassMorphicContainer from './GlassMorphicContainer';
import { Wallet as WalletIcon, ArrowUpRight, TrendingUp, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const WalletPreview = () => {
  return (
    <GlassMorphicContainer className="p-6 overflow-hidden relative">
      <div className="absolute top-0 right-0 w-32 h-32 bg-verzus-accent/20 rounded-full blur-3xl -mr-16 -mt-16"></div>
      
      <div className="flex items-center mb-6">
        <div className="w-10 h-10 rounded-full bg-verzus-accent/10 flex items-center justify-center mr-3">
          <WalletIcon className="text-verzus-accent" size={20} />
        </div>
        <div>
          <h3 className="text-lg font-bold text-white">Your Wallet</h3>
          <p className="text-xs text-verzus-text-secondary">Unified balance for all games</p>
        </div>
      </div>
      
      <div className="mb-6">
        <p className="text-sm text-verzus-text-secondary mb-2">Available Balance</p>
        <div className="flex items-baseline">
          <span className="text-3xl font-bold text-white">$0.00</span>
          <span className="text-xs text-verzus-text-secondary ml-2">USD</span>
        </div>
      </div>
      
      <div className="flex gap-3 mb-6">
        <button className="btn-primary flex-1 flex items-center justify-center">
          <ArrowUpRight size={16} className="mr-2" />
          Deposit
        </button>
        <Link to="/wallet" className="btn-outline flex-1 flex items-center justify-center">
          View Wallet
        </Link>
      </div>
      
      <div className="pt-4 border-t border-white/10">
        <Link to="/wallet/transactions" className="flex items-center justify-between group">
          <div className="flex items-center">
            <TrendingUp size={16} className="text-verzus-text-secondary mr-2" />
            <span className="text-sm text-verzus-text-secondary">Recent Transactions</span>
          </div>
          <ChevronRight size={16} className="text-verzus-text-secondary group-hover:text-verzus-accent group-hover:translate-x-1 transition-all duration-300" />
        </Link>
      </div>
    </GlassMorphicContainer>
  );
};

export default WalletPreview;
