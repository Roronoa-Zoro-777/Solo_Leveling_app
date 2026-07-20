'use client';

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from './AuthProvider';

export function SystemLoading() {
  const { loginAsGuest, resetSession, error } = useAuth();
  const [showRecovery, setShowRecovery] = useState(false);

  // Show recovery options after 5 seconds of loading, or immediately if there is a known error
  useEffect(() => {
    if (error) {
      setShowRecovery(true);
      return;
    }
    const timer = setTimeout(() => {
      setShowRecovery(true);
    }, 5000);
    return () => clearTimeout(timer);
  }, [error]);

  return (
    <div className="flex h-screen w-full items-center justify-center bg-[#050508] relative overflow-hidden">
      {/* Background Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-purple-600/10 blur-[120px] rounded-full" />
      
      <div className="z-10 text-center px-4">
        <motion.div
          animate={{ scale: [1, 1.1, 1], opacity: [0.3, 0.6, 0.3] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="mb-6 text-purple-500 text-6xl"
        >
          {error ? '⚠' : '🌑'}
        </motion.div>
        
        <h2 className="text-xl font-bold tracking-[0.2em] text-white mb-2" style={{ fontFamily: 'Orbitron, monospace' }}>
          {error ? 'SYSTEM ERROR' : 'SYSTEM LOADING'}
        </h2>
        
        {!error && (
          <div className="w-48 h-1 bg-[#1e1e36] mx-auto rounded-full overflow-hidden">
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: '100%' }}
              transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
              className="w-full h-full bg-gradient-to-r from-transparent via-[#06b6d4] to-transparent"
            />
          </div>
        )}

        {error && (
          <p className="text-red-400 text-sm max-w-sm mx-auto mb-6 font-medium leading-relaxed" style={{ fontFamily: 'Rajdhani, sans-serif' }}>
            {error}
          </p>
        )}

        {showRecovery && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-6 p-6 rounded-xl border border-red-900/30 bg-red-900/5 max-w-sm mx-auto"
          >
            <p className="text-xs text-red-100 font-bold mb-4 tracking-widest uppercase opacity-80">
              ◈ System Recovery Protocol ◈
            </p>
            <div className="flex flex-col gap-3">
              <button 
                onClick={loginAsGuest}
                className="px-4 py-3 bg-purple-600/20 border border-purple-500/50 text-purple-200 text-xs font-bold rounded hover:bg-purple-600/30 transition-all"
                style={{ fontFamily: 'Orbitron, monospace' }}
              >
                OVERRIDE: ENTER AS GUEST
              </button>
              <button 
                onClick={resetSession}
                className="px-4 py-2 bg-red-600/20 border border-red-500/50 text-red-200 text-xs font-bold rounded hover:bg-red-600/30 transition-all"
                style={{ fontFamily: 'Orbitron, monospace' }}
              >
                RESET SYSTEM (LOGOUT)
              </button>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
