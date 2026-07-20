'use client';
import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { ShadowCardData } from '@/lib/shadowsLore';
import { useAuth } from '@/components/AuthProvider';

interface ShadowCardProps {
  data: ShadowCardData;
  onExtract?: (id: string) => void;
}

export const ShadowCard: React.FC<ShadowCardProps> = ({ data, onExtract }) => {
  const { hunter, user } = useAuth();
  const [isAnimating, setIsAnimating] = useState(false);

  // A card is unlocked if:
  // 1. Hunter level is HIGH ENOUGH (auto-unlock), OR
  // 2. Hunter previously clicked "Arise" and it was saved in Firestore
  const levelUnlocked = hunter ? hunter.level >= data.unlockLevel : false;
  const isUnlocked = levelUnlocked || (hunter?.unlockedShadowIds?.includes(data.id) ?? false);
  const canAfford = levelUnlocked; // can trigger Arise only when level is met

  const handleArise = async () => {
    if (isUnlocked || isAnimating || !canAfford || !hunter || !user) return;
    const { doc, updateDoc, arrayUnion } = await import('firebase/firestore');
    const { db } = await import('@/lib/firebase');

    setIsAnimating(true);
    try {
      await updateDoc(doc(db, 'hunters', user.uid), {
        unlockedShadowIds: arrayUnion(data.id)
      });
      setTimeout(() => {
        setIsAnimating(false);
        onExtract?.(data.id);
      }, 2200);
    } catch (err) {
      console.error('Extraction failed:', err);
      setIsAnimating(false);
    }
  };

  return (
    <div
      onClick={handleArise}
      className="relative select-none"
      style={{
        width: 220,
        minWidth: 220,
        cursor: !isUnlocked && canAfford ? 'pointer' : 'default',
      }}
    >
      <motion.div
        whileHover={!isUnlocked && canAfford ? { scale: 1.03, y: -4 } : {}}
        whileTap={!isUnlocked && canAfford ? { scale: 0.97 } : {}}
        animate={isAnimating ? { scale: [1, 1.04, 1], boxShadow: ['0 0 20px #a855f7', '0 0 60px #c084fc', '0 0 20px #a855f7'] } : {}}
        transition={{ duration: isAnimating ? 2.2 : 0.25, repeat: isAnimating ? 1 : 0 }}
        style={{
          borderRadius: 14,
          border: isUnlocked ? '3px solid #06b6d4' : '3px solid #2d2040',
          boxShadow: isUnlocked
            ? '0 0 28px rgba(6,182,212,0.55), 0 0 60px rgba(6,182,212,0.15), inset 0 0 20px rgba(6,182,212,0.08)'
            : '0 0 12px rgba(80,0,130,0.4), inset 0 0 10px rgba(0,0,0,0.8)',
          background: isUnlocked
            ? 'linear-gradient(160deg, #070d18 0%, #0a1520 50%, #070d18 100%)'
            : 'linear-gradient(160deg, #0a0613 0%, #07040e 50%, #0a0613 100%)',
          overflow: 'hidden',
          position: 'relative',
        }}
      >
        {/* Decorative inner border */}
        <div style={{
          position: 'absolute', inset: 6, borderRadius: 10,
          border: isUnlocked ? '1px solid rgba(6,182,212,0.25)' : '1px solid rgba(120,60,180,0.15)',
          pointerEvents: 'none', zIndex: 1,
        }} />

        {/* ── HEADER BANNER ── */}
        <div style={{
          background: isUnlocked
            ? 'linear-gradient(90deg, #0369a1, #0891b2, #06b6d4, #0891b2, #0369a1)'
            : 'linear-gradient(90deg, #1a0a2e, #2d1a4a, #1a0a2e)',
          borderBottom: isUnlocked ? '2px solid #06b6d4' : '2px solid #3b1060',
          padding: '8px 10px',
          textAlign: 'center',
          position: 'relative',
          zIndex: 2,
        }}>
          <span style={{ position: 'absolute', left: 8, top: 4, color: isUnlocked ? '#06b6d4' : '#6b21a8', fontSize: 10, opacity: 0.7 }}>◈</span>
          <span style={{ position: 'absolute', right: 8, top: 4, color: isUnlocked ? '#06b6d4' : '#6b21a8', fontSize: 10, opacity: 0.7 }}>◈</span>
          <span style={{
            fontFamily: 'Cinzel, serif',
            fontWeight: 900,
            fontSize: isUnlocked ? 11 : 14,
            letterSpacing: '0.15em',
            color: isUnlocked ? '#ffffff' : '#9060b0',
            textShadow: isUnlocked ? '0 0 12px rgba(6,182,212,0.9), 0 0 25px rgba(255,255,255,0.4)' : 'none',
          }}>
            {isUnlocked ? data.name.toUpperCase() : '???'}
          </span>
          {isUnlocked && (
            <div style={{ fontFamily: 'Orbitron, monospace', fontSize: 8, color: '#06b6d4', letterSpacing: '0.3em', marginTop: 1 }}>
              UNLOCKED
            </div>
          )}
        </div>

        {/* ── IMAGE AREA ── */}
        <div style={{
          position: 'relative',
          height: 230,
          overflow: 'hidden',
          background: isUnlocked
            ? 'radial-gradient(ellipse at center, #0a1f35 0%, #050d18 100%)'
            : 'radial-gradient(ellipse at center, #17093a 0%, #07040e 100%)',
        }}>
          {/* Runic side columns */}
          {(['left', 'right'] as const).map((side) => (
            <div key={side} style={{
              position: 'absolute', [side]: 0, top: 0, bottom: 0, width: 14,
              background: isUnlocked
                ? 'linear-gradient(180deg, #0369a1 0%, #06b6d4 50%, #0369a1 100%)'
                : 'linear-gradient(180deg, #4a1080 0%, #2d1060 50%, #4a1080 100%)',
              display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'space-around',
              zIndex: 2, padding: '8px 0',
            }}>
              {['ᚱ','ᚢ','ᚾ','ᛁ','ᚲ'].map((r, i) => (
                <span key={i} style={{ fontSize: 9, color: isUnlocked ? 'rgba(6,182,212,0.7)' : 'rgba(180,80,255,0.5)', lineHeight: 1.2 }}>{r}</span>
              ))}
            </div>
          ))}

          {/* Character image */}
          <motion.div
            animate={{
              filter: isUnlocked
                ? 'brightness(1.05) contrast(1.1) saturate(1.1)'
                : 'brightness(0.25) contrast(1.6) grayscale(0.9)',
            }}
            transition={{ duration: 1.5 }}
            style={{ position: 'absolute', inset: '0 14px', overflow: 'hidden' }}
          >
            <Image
              src={data.imageSource}
              alt={data.name}
              fill
              className="object-cover object-top"
              sizes="220px"
              priority={isUnlocked}
            />
            <div style={{
              position: 'absolute', bottom: 0, left: 0, right: 0, height: 60,
              background: 'linear-gradient(to top, #070d18 0%, transparent 100%)',
            }} />
          </motion.div>

          {/* Unlocked: animated glow edges */}
          {isUnlocked && (
            <motion.div
              animate={{ opacity: [0.4, 0.8, 0.4] }}
              transition={{ duration: 2, repeat: Infinity }}
              style={{
                position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 3,
                boxShadow: 'inset 0 0 30px rgba(6,182,212,0.3)',
                borderRadius: 2,
              }}
            />
          )}

          {/* Unlocked: floating particles */}
          {isUnlocked && [...Array(7)].map((_, i) => (
            <motion.div
              key={i}
              animate={{ y: [0, -50], opacity: [0, 0.9, 0], scale: [0.6, 1, 0.4] }}
              transition={{ duration: 1.5 + i * 0.3, repeat: Infinity, delay: i * 0.4, ease: 'easeOut' }}
              style={{
                position: 'absolute',
                left: `${15 + i * 12}%`, bottom: '10%',
                width: i % 2 === 0 ? 5 : 3, height: i % 2 === 0 ? 5 : 3,
                borderRadius: '50%', background: '#06b6d4',
                boxShadow: '0 0 6px #06b6d4', zIndex: 4,
              }}
            />
          ))}

          {/* Arise animation overlay */}
          <AnimatePresence>
            {isAnimating && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                style={{
                  position: 'absolute', inset: 0, zIndex: 10,
                  background: 'radial-gradient(ellipse at center bottom, rgba(120,0,200,0.95) 0%, rgba(0,0,0,0.97) 70%)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column',
                }}
              >
                {[...Array(5)].map((_, i) => (
                  <motion.div
                    key={i}
                    initial={{ y: 80, opacity: 0, scale: 0.3, x: (i - 2) * 20 }}
                    animate={{ y: -60, opacity: [0, 0.6, 0], scale: [0.3, 1.4, 0.5], x: (i - 2) * 30 }}
                    transition={{ duration: 1.8, delay: i * 0.15, ease: 'easeOut' }}
                    style={{
                      position: 'absolute', bottom: 20,
                      width: 20, height: 40, borderRadius: '50%',
                      background: 'radial-gradient(ellipse, rgba(168,85,247,0.5) 0%, transparent 70%)',
                      filter: 'blur(6px)',
                    }}
                  />
                ))}
                <motion.span
                  initial={{ scale: 0.2, opacity: 0, letterSpacing: '1em' }}
                  animate={{ scale: 1.1, opacity: 1, letterSpacing: '0.3em' }}
                  style={{
                    fontFamily: 'Cinzel, serif', fontWeight: 900, fontSize: 28,
                    color: 'transparent', zIndex: 5,
                    background: 'linear-gradient(180deg, #fff 0%, #c084fc 40%, #7c3aed 100%)',
                    WebkitBackgroundClip: 'text', backgroundClip: 'text',
                    filter: 'drop-shadow(0 0 20px rgba(168,85,247,0.9))',
                    letterSpacing: '0.3em',
                  }}
                >
                  ARISE
                </motion.span>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* ── STATS / LOCKED FOOTER ── */}
        <div style={{
          background: isUnlocked
            ? 'linear-gradient(180deg, #050d18 0%, #070d18 100%)'
            : 'linear-gradient(180deg, #07040e 0%, #0a0613 100%)',
          borderTop: isUnlocked ? '2px solid rgba(6,182,212,0.4)' : '2px solid rgba(100,40,160,0.4)',
          padding: '12px 14px',
          position: 'relative', zIndex: 2,
        }}>
          {isUnlocked ? (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-around', alignItems: 'stretch' }}>
                {/* Level */}
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1, borderRight: '1px solid rgba(6,182,212,0.2)', paddingRight: 6 }}>
                  <div style={{ marginBottom: 4 }}><span style={{ fontSize: 16 }}>⚔️</span></div>
                  <div style={{ fontFamily: 'Orbitron, monospace', fontSize: 9, color: '#06b6d4', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 2 }}>Level</div>
                  <div style={{ fontFamily: 'Cinzel, serif', fontWeight: 900, fontSize: 22, color: '#ffffff', lineHeight: 1 }}>{data.level}</div>
                </div>
                {/* Attack */}
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1, borderRight: '1px solid rgba(6,182,212,0.2)', padding: '0 6px' }}>
                  <div style={{ marginBottom: 4 }}><span style={{ fontSize: 16 }}>💀</span></div>
                  <div style={{ fontFamily: 'Orbitron, monospace', fontSize: 9, color: '#06b6d4', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 2 }}>Attack</div>
                  <div style={{ fontFamily: 'Cinzel, serif', fontWeight: 900, fontSize: 22, color: '#ffffff', lineHeight: 1 }}>{data.stats.strength}</div>
                </div>
                {/* Defense */}
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1, paddingLeft: 6 }}>
                  <div style={{ marginBottom: 4 }}><span style={{ fontSize: 16 }}>🛡️</span></div>
                  <div style={{ fontFamily: 'Orbitron, monospace', fontSize: 9, color: '#06b6d4', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 2 }}>Defense</div>
                  <div style={{ fontFamily: 'Cinzel, serif', fontWeight: 900, fontSize: 22, color: '#ffffff', lineHeight: 1 }}>{data.stats.vitality}</div>
                </div>
              </div>
            </motion.div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: 8 }}>
              <div style={{
                width: 44, height: 44,
                background: 'linear-gradient(135deg, #1a0a2e, #2d1050)',
                border: `2px solid ${canAfford ? 'rgba(168,85,247,0.6)' : 'rgba(100,50,150,0.4)'}`,
                borderRadius: '50%',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: canAfford ? '0 0 15px rgba(168,85,247,0.5)' : 'none',
              }}>
                <span style={{ fontSize: 20 }}>🔒</span>
              </div>
              <div style={{
                background: 'rgba(0,0,0,0.6)',
                border: '1px solid rgba(100,50,150,0.3)',
                borderRadius: 8, padding: '8px 10px', width: '100%',
              }}>
                <p style={{
                  fontFamily: 'Orbitron, monospace', fontSize: 8.5, fontWeight: 700,
                  letterSpacing: '0.08em', textTransform: 'uppercase',
                  color: canAfford ? '#a855f7' : '#9060b0',
                  lineHeight: 1.5,
                }}>
                  {canAfford
                    ? `ARISE AVAILABLE\nClick to Extract`
                    : `REACH LEVEL ${data.unlockLevel}\nTO UNLOCK THIS SHADOW.`}
                </p>
              </div>
              {canAfford && (
                <motion.div
                  animate={{ opacity: [0.5, 1, 0.5] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                  style={{ fontFamily: 'Orbitron, monospace', fontSize: 8, color: '#c084fc', letterSpacing: '0.2em', textTransform: 'uppercase' }}
                >
                  ▲ TAP TO EXTRACT ▲
                </motion.div>
              )}
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
};
