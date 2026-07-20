import React, { useState } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withTiming, 
  withSpring,
  interpolateColor,
  Easing 
} from 'react-native-reanimated';
import { Feather } from '@expo/vector-icons';
import { SYSTEM_THEME } from '../theme/systemTheme';

const StatBar = ({ label, value, color }) => (
  <View style={styles.statContainer}>
    <Text style={styles.statLabel}>{label}</Text>
    <View style={styles.statBarTrack}>
      <Animated.View 
        style={[
          styles.statBarFill, 
          { width: `${value}%`, backgroundColor: color }
        ]} 
      />
    </View>
    <Text style={styles.statValue}>{value}</Text>
  </View>
);

export const ShadowCard = ({ data, onExtract }) => {
  // Local state for the animation
  const [isUnlocked, setIsUnlocked] = useState(data.isShadow);
  
  // Reanimated values
  const extractionProgress = useSharedValue(isUnlocked ? 1 : 0);
  const scale = useSharedValue(1);

  // Trigger Arise Magic
  const handleArise = () => {
    if (isUnlocked) return;
    
    // Animate Card Interaction
    scale.value = withSpring(0.95, {}, () => {
      scale.value = withSpring(1.05, {}, () => {
         scale.value = withSpring(1);
      });
    });

    // Start Extraction
    extractionProgress.value = withTiming(1, { duration: 1500, easing: Easing.bezier(0.25, 0.1, 0.25, 1) });
    setIsUnlocked(true);
    
    // Fire callback to update global state/storage if needed
    if(onExtract) onExtract(data.id);
  };

  const animatedOverlayStyle = useAnimatedStyle(() => {
    return {
      opacity: 1 - extractionProgress.value,
    };
  });

  const animatedImageStyle = useAnimatedStyle(() => {
    return {
      opacity: 0.3 + (0.7 * extractionProgress.value),
    };
  });

  const animatedGlowStyle = useAnimatedStyle(() => {
    const borderColor = interpolateColor(
      extractionProgress.value,
      [0, 1],
      [SYSTEM_THEME.colors.surfaceBorder, SYSTEM_THEME.colors.shadowPurple]
    );
    
    return {
      borderColor,
      transform: [{ scale: scale.value }],
      shadowColor: SYSTEM_THEME.colors.shadowPurple,
      shadowOffset: { width: 0, height: 0 },
      shadowOpacity: extractionProgress.value * 1.5,
      shadowRadius: 20,
      elevation: extractionProgress.value * 10,
    };
  });

  return (
    <Pressable onPress={handleArise} disabled={isUnlocked}>
      <Animated.View style={[styles.cardContainer, animatedGlowStyle]}>
        
        {/* Image Container */}
        <View style={styles.imageContainer}>
          <Animated.Image 
            source={data.imageSource} 
            style={[styles.cardImage, animatedImageStyle]} 
            resizeMode="cover" 
          />
          
          {/* Locked State Overlay */}
          <Animated.View style={[styles.lockedOverlay, animatedOverlayStyle]}>
             <Feather name="lock" size={32} color={SYSTEM_THEME.colors.systemCyan} />
             <Text style={styles.lockedText}>LOCKED</Text>
             <Text style={styles.ariseCommandText}>TAP TO EXTRACT</Text>
          </Animated.View>

          {/* Rank Badge */}
          {isUnlocked && data.currentShadowRank && (
             <View style={styles.rankBadge}>
               <Text style={styles.rankBadgeText}>{data.currentShadowRank}</Text>
             </View>
          )}
          
          {/* Regular Rank Badge */}
          {isUnlocked && !data.currentShadowRank && data.originalRank && (
               <View style={styles.rankBadgeRegular}>
                 <Text style={styles.rankBadgeText}>{data.originalRank}-Rank</Text>
               </View>
            )}
        </View>

        {/* Content Section */}
        <View style={styles.contentContainer}>
          <View style={styles.headerRow}>
            <Text style={styles.cardName} numberOfLines={1}>{data.name}</Text>
            <View style={styles.levelBadge}>
              <Text style={styles.levelText}>LV.{data.level}</Text>
            </View>
          </View>

          <Text style={styles.description} numberOfLines={2}>
            {isUnlocked ? data.description : "????"}
          </Text>

          {/* Stats Section */}
          <View style={styles.statsWrapper}>
            <StatBar 
              label="STR" 
              value={isUnlocked ? data.stats.strength : 0} 
              color="#ef4444" 
            />
            <StatBar 
              label="AGI" 
              value={isUnlocked ? data.stats.agility : 0} 
              color="#3b82f6" 
            />
            <StatBar 
              label="SEN" 
              value={isUnlocked ? data.stats.sense : 0} 
              color="#a855f7" 
            />
          </View>
        </View>

      </Animated.View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  cardContainer: {
    backgroundColor: SYSTEM_THEME.colors.surface,
    borderWidth: 2,
    borderRadius: 16,
    width: '100%',
    overflow: 'hidden',
    marginVertical: 12,
  },
  imageContainer: {
    height: 220,
    width: '100%',
    backgroundColor: SYSTEM_THEME.colors.background,
    position: 'relative',
    borderBottomWidth: 1,
    borderBottomColor: SYSTEM_THEME.colors.surfaceBorder,
  },
  cardImage: {
    width: '100%',
    height: '100%',
  },
  lockedOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: SYSTEM_THEME.colors.lockedOverlay,
    justifyContent: 'center',
    alignItems: 'center',
  },
  lockedText: {
    color: SYSTEM_THEME.colors.systemCyan,
    fontSize: 20,
    fontWeight: '800',
    marginTop: 8,
    letterSpacing: 2,
  },
  ariseCommandText: {
    color: SYSTEM_THEME.colors.textDim,
    fontSize: 14,
    marginTop: 6,
    letterSpacing: 1,
    textTransform: 'uppercase',
    fontWeight: '600'
  },
  rankBadge: {
    position: 'absolute',
    top: 12,
    left: 12,
    backgroundColor: 'rgba(124, 58, 237, 0.8)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: SYSTEM_THEME.colors.shadowGlow,
  },
  rankBadgeRegular: {
    position: 'absolute',
    top: 12,
    left: 12,
    backgroundColor: 'rgba(6, 182, 212, 0.2)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: SYSTEM_THEME.colors.systemCyan,
  },
  rankBadgeText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: 'bold',
    textTransform: 'uppercase',
  },
  contentContainer: {
    padding: 18,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  cardName: {
    color: SYSTEM_THEME.colors.textMain,
    fontSize: 24,
    fontWeight: 'bold',
    flex: 1,
    marginRight: 10,
  },
  levelBadge: {
    backgroundColor: 'rgba(6, 182, 212, 0.15)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: 'rgba(6, 182, 212, 0.4)',
  },
  levelText: {
    color: SYSTEM_THEME.colors.systemCyan,
    fontSize: 13,
    fontWeight: 'bold',
  },
  description: {
    color: SYSTEM_THEME.colors.textDim,
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 20,
  },
  statsWrapper: {
    gap: 10,
  },
  statContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  statLabel: {
    color: SYSTEM_THEME.colors.systemCyan,
    fontSize: 12,
    fontWeight: 'bold',
    width: 32,
  },
  statBarTrack: {
    flex: 1,
    height: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 4,
    overflow: 'hidden',
  },
  statBarFill: {
    height: '100%',
    borderRadius: 4,
  },
  statValue: {
    color: SYSTEM_THEME.colors.textMain,
    fontSize: 12,
    fontWeight: 'bold',
    width: 28,
    textAlign: 'right',
  }
});
