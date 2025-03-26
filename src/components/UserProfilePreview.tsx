
import React from 'react';
import GlassMorphicContainer from './GlassMorphicContainer';
import { Link } from 'react-router-dom';
import { User, Trophy, CheckCircle, ChevronRight, Shield } from 'lucide-react';

const UserProfilePreview = () => {
  return (
    <GlassMorphicContainer className="p-6 overflow-hidden">
      <div className="flex items-center mb-6">
        <div className="w-12 h-12 rounded-full bg-verzus-primary/10 flex items-center justify-center mr-3 border-2 border-verzus-primary">
          <User className="text-verzus-primary" size={24} />
        </div>
        <div>
          <div className="flex items-center">
            <h3 className="text-lg font-bold text-white">Guest User</h3>
            <CheckCircle size={14} className="text-verzus-accent ml-1" />
          </div>
          <p className="text-xs text-verzus-text-secondary">Create an account to start playing</p>
        </div>
      </div>
      
      <div className="space-y-4 mb-6">
        <div className="flex justify-between items-center">
          <div className="flex items-center">
            <Trophy size={16} className="text-verzus-text-secondary mr-2" />
            <span className="text-sm">Games Played</span>
          </div>
          <span className="text-sm font-bold">0</span>
        </div>
        
        <div className="flex justify-between items-center">
          <div className="flex items-center">
            <Shield size={16} className="text-verzus-text-secondary mr-2" />
            <span className="text-sm">Rank</span>
          </div>
          <span className="text-sm font-bold">Unranked</span>
        </div>
      </div>
      
      <div className="flex gap-3 mb-6">
        <button className="btn-primary flex-1">
          Sign Up
        </button>
        <button className="btn-outline flex-1">
          Sign In
        </button>
      </div>
      
      <div className="pt-4 border-t border-white/10">
        <Link to="/demo" className="flex items-center justify-between group">
          <span className="text-sm text-verzus-text-secondary">Try Demo Mode</span>
          <ChevronRight size={16} className="text-verzus-text-secondary group-hover:text-verzus-accent group-hover:translate-x-1 transition-all duration-300" />
        </Link>
      </div>
    </GlassMorphicContainer>
  );
};

export default UserProfilePreview;
