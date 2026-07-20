'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShadowCard } from '@/components/ShadowCard';
import { SHADOW_ARMY_DATA, filterUnlockedShadows, ShadowCardData } from '@/lib/shadowsLore';
import Sidebar from '@/components/Sidebar';
import { useAuth } from '@/components/AuthProvider';
import { SystemLoading } from '@/components/SystemLoading';

type TabType = 'ALL' | 'SHADOWS' | 'ENEMIES';

export default function ArmyDatabasePage() {
  const [activeTab, setActiveTab] = useState<TabType>('ALL');
  const [army] = useState<ShadowCardData[]>(Object.values(SHADOW_ARMY_DATA));
  const { hunter, isLoading } = useAuth();

  if (isLoading || !hunter) return <SystemLoading />;

  const handleExtraction = (id: string) => {
    console.log(`Arise command confirmed for ID: ${id}`);
  };

  const getFilteredData = (): ShadowCardData[] => {
    let list: ShadowCardData[];
    if (activeTab === 'ALL') list = army;
    else if (activeTab === 'SHADOWS') list = filterUnlockedShadows();
    else if (activeTab === 'ENEMIES') list = army.filter(item => !item.isShadow && item.originalRank !== 'National Level');
    else list = army;

    // Sort: cards where hunter meets level requirement come first (unlocked first),
    // then locked cards ordered by their unlock level ascending
    const hunterLevel = hunter?.level ?? 0;
    return [...list].sort((a, b) => {
      const aUnlocked = hunterLevel >= a.unlockLevel;
      const bUnlocked = hunterLevel >= b.unlockLevel;
      if (aUnlocked && !bUnlocked) return -1;
      if (!aUnlocked && bUnlocked) return 1;
      // Both unlocked: sort by unlockLevel descending (highest unlocks first — most powerful at top)
      if (aUnlocked && bUnlocked) return b.unlockLevel - a.unlockLevel;
      // Both locked: sort by unlockLevel ascending (closest to unlock first)
      return a.unlockLevel - b.unlockLevel;
    });
  };

  const tabs: TabType[] = ['ALL', 'SHADOWS', 'ENEMIES'];


  return (
    <div className="flex h-screen bg-[#050508] text-white overflow-hidden">
      <Sidebar />

      <div className="main-content flex-1 flex flex-col h-screen overflow-hidden" style={{ transition: 'margin-left 0.35s cubic-bezier(0.4,0,0.2,1)' }}>
        {/* Header */}
        <header className="px-5 md:px-8 pt-6 md:pt-10 pb-6 border-b border-[#1e1e36] bg-[#11111a] shrink-0">
          <motion.p
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-[#06b6d4] text-[10px] md:text-xs font-extrabold tracking-[0.2em] mb-2 uppercase"
          >
            ◈ System Database ◈
          </motion.p>
          <motion.h1
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="text-2xl md:text-4xl font-bold tracking-wider"
            style={{ fontFamily: 'Cinzel, serif' }}
          >
            Shadow Collection
          </motion.h1>
          <p style={{ fontFamily: 'Orbitron, monospace', fontSize: 9, color: '#4a4a6a', letterSpacing: '0.15em', marginTop: 6 }} className="hidden md:block">
            {army.length} ENTITIES REGISTERED — DOUBLE-CLICK SIDEBAR TO COLLAPSE
          </p>
        </header>

        {/* Tabs */}
        <div className="px-5 md:px-8 py-5 flex gap-2 md:gap-3 shrink-0 overflow-x-auto no-scrollbar">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`
                px-4 md:px-5 py-2 rounded-full border text-[10px] md:text-sm font-bold tracking-widest transition-all duration-300 whitespace-nowrap
                ${activeTab === tab
                  ? 'bg-[#7c3aed]/15 border-[#7c3aed] text-[#a855f7] shadow-[0_0_15px_rgba(124,58,237,0.2)]'
                  : 'bg-transparent border-[#1e1e36] text-[#6b7280] hover:border-[#06b6d4]/50 hover:text-white'
                }
              `}
              style={{ fontFamily: 'Orbitron, monospace' }}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Card Grid */}
        <div className="flex-1 overflow-y-auto px-5 md:px-8 pb-12 custom-scrollbar">
          <AnimatePresence mode="popLayout">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              style={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: 16,
                justifyContent: 'center',
                alignItems: 'flex-start',
              }}
              className="md:justify-start"
            >
              {getFilteredData().map((item, index) => (
                <motion.div
                  key={item.id}
                  layout
                  initial={{ opacity: 0, scale: 0.85, y: 20 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.85, y: 10 }}
                  transition={{ duration: 0.35, delay: index * 0.04, type: 'spring', stiffness: 200 }}
                >
                  <ShadowCard data={item} onExtract={handleExtraction} />
                </motion.div>
              ))}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
