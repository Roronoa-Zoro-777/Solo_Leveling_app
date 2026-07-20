# React Native Shadow Army Module

## Overview
This document outlines the architecture for a dynamic React Native (Expo) component system that displays "Shadow Army" / "Player" cards. The module dynamically loads local images from an `/assets/sl/` folder and applies gamified lore and glow effects (System Blue/Purple) based on the asset. 

## Data Model

The data integration uses a static JSON object for fast look-up. Keys correspond to the source image filenames (excluding the extension) stored in `assets/sl/`.

```javascript
// data/shadowsLore.js

export const RANKS = {
  E: 'E',
  D: 'D',
  C: 'C',
  B: 'B',
  A: 'A',
  S: 'S',
  NATIONAL: 'National Level',
};

export const SHADOW_RANKS = {
  INFANTRY: 'Infantry',
  ELITE: 'Elite',
  KNIGHT: 'Knight',
  ELITE_KNIGHT: 'Elite Knight',
  COMMANDER: 'Commander',
  MARSHAL: 'Marshal',
  GRAND_MARSHAL: 'Grand Marshal',
};

export const SHADOW_ARMY_DATA = {
  "beru": {
    id: "beru",
    name: "Beru",
    description: "The Ant King. A magical beast created to be the ultimate predator. Possesses overwhelming speed and power, along with the ability to heal.",
    originalRank: RANKS.S,
    currentShadowRank: SHADOW_RANKS.MARSHAL,
    isShadow: true,
    stats: { strength: 95, agility: 99, sense: 90, vitality: 85, intelligence: 80 },
    level: 70,
    imageSource: require('../assets sl/Anime_Episode_18_Img_1.webp') 
  },
  "igris": {
    id: "igris",
    name: "Igris",
    description: "The Blood-Red Commander. A fiercely loyal knight of the highest order. Masters swordsmanship to absolute perfection.",
    originalRank: RANKS.S,
    currentShadowRank: SHADOW_RANKS.COMMANDER,
    isShadow: true,
    stats: { strength: 92, agility: 90, sense: 85, vitality: 88, intelligence: 75 },
    level: 65,
    imageSource: require('../assets sl/Igris22.webp')
  },
  "iron": {
    id: "iron",
    name: "Iron",
    description: "Formerly an A-Rank Tanker. Brash, aggressive, and nearly impenetrable. He uses massive shields to crush enemies.",
    originalRank: RANKS.A,
    currentShadowRank: SHADOW_RANKS.ELITE_KNIGHT,
    isShadow: true,
    stats: { strength: 80, agility: 40, sense: 30, vitality: 95, intelligence: 20 },
    level: 40,
    imageSource: require('../assets sl/Iron_3.webp')
  },
  "tank": {
    id: "tank",
    name: "Tank",
    description: "A mutated Ice Bear leader. Acts as a vanguard and mount. Possesses tremendous physical strength and thick hide.",
    originalRank: RANKS.A,
    currentShadowRank: SHADOW_RANKS.KNIGHT,
    isShadow: true,
    stats: { strength: 85, agility: 50, sense: 40, vitality: 90, intelligence: 15 },
    level: 35,
    imageSource: require('../assets sl/Tank_Anime2.webp')
  },
  "tusk": {
    id: "tusk",
    name: "Tusk",
    description: "A High Orc Shaman with immense magical power. Specializes in destructive fire magic and gravity manipulation.",
    originalRank: RANKS.A,
    currentShadowRank: SHADOW_RANKS.ELITE_KNIGHT,
    isShadow: true,
    stats: { strength: 40, agility: 30, sense: 80, vitality: 60, intelligence: 95 },
    level: 55,
    imageSource: require('../assets sl/Tusk0.webp')
  },
  "kaisel": {
    id: "kaisel",
    name: "Kaisel",
    description: "A Wyvern previously ridden by the Demon King Baran. Used primarily for high-speed aerial transportation.",
    originalRank: RANKS.A,
    currentShadowRank: SHADOW_RANKS.KNIGHT,
    isShadow: true,
    stats: { strength: 70, agility: 95, sense: 60, vitality: 75, intelligence: 30 },
    level: 45,
    imageSource: require('../assets sl/Kaisel1.webp')
  },
  "jima": {
    id: "jima",
    name: "Jima",
    description: "A Naga Boss monster. Wields a giant trident and is highly capable in aquatic environments.",
    originalRank: RANKS.A,
    currentShadowRank: SHADOW_RANKS.KNIGHT,
    isShadow: true,
    stats: { strength: 82, agility: 75, sense: 60, vitality: 80, intelligence: 40 },
    level: 42,
    imageSource: require('../assets sl/Jima1.webp')
  },
  "kamish": {
    id: "kamish",
    name: "Kamish",
    description: "Humanity's greatest disaster. An ancient dragon of immense scale and magical capacity.",
    originalRank: RANKS.NATIONAL,
    currentShadowRank: null,
    isShadow: false,
    stats: { strength: 99, agility: 90, sense: 95, vitality: 99, intelligence: 90 },
    level: 95,
    imageSource: require('../assets sl/Kamish3.webp')
  },
  "bellion": {
    id: "bellion",
    name: "Bellion",
    description: "The Grand Marshal of the Shadow Army. Born from the World Tree, he wields a massive centipede-like sword.",
    originalRank: RANKS.NATIONAL,
    currentShadowRank: SHADOW_RANKS.GRAND_MARSHAL,
    isShadow: true,
    stats: { strength: 99, agility: 95, sense: 90, vitality: 99, intelligence: 85 },
    level: 90,
    imageSource: require('../assets sl/Bellion1.webp')
  },
  "baek_yoonho": {
    id: "baek_yoonho",
    name: "Baek Yoonho",
    description: "An S-Rank Hunter and Guild Master. Has the ability to transform into a massive white magical beast.",
    originalRank: RANKS.S,
    currentShadowRank: null,
    isShadow: false,
    stats: { strength: 88, agility: 80, sense: 85, vitality: 85, intelligence: 60 },
    level: 50,
    imageSource: require('../assets sl/Baek-baekgu.webp')
  },
  "cerberus": {
    id: "cerberus",
    name: "Cerberus",
    description: "The Gatekeeper of Hell. A three-headed hound of incredible ferocity bound to the Demon Castle.",
    originalRank: RANKS.S,
    currentShadowRank: null,
    isShadow: false,
    stats: { strength: 85, agility: 88, sense: 75, vitality: 80, intelligence: 30 },
    level: 45,
    imageSource: require('../assets sl/Cerberus1.webp')
  },
  "vulcan": {
    id: "vulcan",
    name: "Vulcan",
    description: "The King of Demons. A massive demon wielding a giant club, radiating intense heat.",
    originalRank: RANKS.S,
    currentShadowRank: null,
    isShadow: false,
    stats: { strength: 90, agility: 40, sense: 50, vitality: 95, intelligence: 60 },
    level: 60,
    imageSource: require('../assets sl/Vulcan1.webp')
  },
  "ammut": {
    id: "ammut",
    name: "Ammut",
    description: "A demonic creature resembling a massive crocodile/hippo hybrid with immense jaw strength.",
    originalRank: RANKS.A,
    currentShadowRank: null,
    isShadow: false,
    stats: { strength: 85, agility: 30, sense: 45, vitality: 88, intelligence: 20 },
    level: 48,
    imageSource: require('../assets sl/Ammut1.webp')
  },
  "baruka": {
    id: "baruka",
    name: "Baruka",
    description: "Boss of the Red Gate. A highly intelligent and incredibly fast Ice Elf.",
    originalRank: RANKS.A,
    currentShadowRank: null,
    isShadow: false,
    stats: { strength: 75, agility: 92, sense: 85, vitality: 60, intelligence: 70 },
    level: 45,
    imageSource: require('../assets sl/Baruka2.webp')
  },
  "jinwoo": {
    id: "jinwoo",
    name: "Sung Jinwoo",
    description: "The Shadow Monarch. Reawakened player possessing limitless growth potential.",
    originalRank: RANKS.NATIONAL,
    currentShadowRank: null,
    isShadow: false,
    stats: { strength: 99, agility: 99, sense: 99, vitality: 99, intelligence: 99 },
    level: 100,
    imageSource: require('../assets sl/Jinwoo4.webp')
  },
  "statue_of_god": {
    id: "statue_of_god",
    name: "Statue of God",
    description: "The Architect's puppet in the Double Dungeon. Known for its terrifying, murderous smile.",
    originalRank: RANKS.S,
    currentShadowRank: null,
    isShadow: false,
    stats: { strength: 95, agility: 85, sense: 90, vitality: 99, intelligence: 80 },
    level: 80,
    imageSource: require('../assets sl/Statue_of_God_Smile_Anime_Episode_1.webp')
  },
  "shadow_baekgu": {
    id: "shadow_baekgu",
    name: "Baekgu (Shadow)",
    description: "A loyal shadow beast.",
    originalRank: RANKS.B,
    currentShadowRank: SHADOW_RANKS.INFANTRY,
    isShadow: true,
    stats: { strength: 60, agility: 65, sense: 70, vitality: 50, intelligence: 30 },
    level: 25,
    imageSource: require('../assets sl/Shadow_BAEKGU.webp')
  },
  "suho_naga": {
    id: "suho_naga",
    name: "Naga Shadow",
    description: "A serpentine shadow soldier.",
    originalRank: RANKS.B,
    currentShadowRank: SHADOW_RANKS.INFANTRY,
    isShadow: true,
    stats: { strength: 55, agility: 75, sense: 65, vitality: 60, intelligence: 30 },
    level: 28,
    imageSource: require('../assets sl/Suho_naga_shadow_shape.webp')
  },
  "ice_bears": {
    id: "ice_bears",
    name: "Ice Bear",
    description: "Massive ursine magical beasts natively found in snowy fields.",
    originalRank: RANKS.C,
    currentShadowRank: null,
    isShadow: false,
    stats: { strength: 70, agility: 30, sense: 40, vitality: 80, intelligence: 10 },
    level: 25,
    imageSource: require('../assets sl/Ice_Bears_Anime.webp')
  },
  "ice_elves": {
    id: "ice_elves",
    name: "Ice Elf",
    description: "Hyenas of the snowy fields. Coordinated hunters armed with frozen weapons.",
    originalRank: RANKS.C,
    currentShadowRank: null,
    isShadow: false,
    stats: { strength: 40, agility: 75, sense: 60, vitality: 35, intelligence: 50 },
    level: 22,
    imageSource: require('../assets sl/Ice_Elves_Anime.webp')
  },
  "ice_golems": {
    id: "ice_golems",
    name: "Ice Golem",
    description: "Animated constructs made entirely of impenetrable magical ice.",
    originalRank: RANKS.B,
    currentShadowRank: null,
    isShadow: false,
    stats: { strength: 80, agility: 15, sense: 10, vitality: 90, intelligence: 5 },
    level: 30,
    imageSource: require('../assets sl/Ice_Golems2.webp')
  },
  "dungeon_jackals": {
    id: "dungeon_jackals",
    name: "Dungeon Jackal",
    description: "Low-level beast type monsters commonly found in E and D-Rank gates.",
    originalRank: RANKS.E,
    currentShadowRank: null,
    isShadow: false,
    stats: { strength: 20, agility: 40, sense: 30, vitality: 15, intelligence: 10 },
    level: 5,
    imageSource: require('../assets sl/Dungeon_Jackals_Anime.webp')
  },
  "centipede": {
    id: "centipede",
    name: "Poison-Fanged Giant Centipede",
    description: "A massive insectoid boss found in the Penalty Zone. Possesses highly corrosive venom.",
    originalRank: RANKS.C,
    currentShadowRank: null,
    isShadow: false,
    stats: { strength: 60, agility: 50, sense: 40, vitality: 70, intelligence: 10 },
    level: 28,
    imageSource: require('../assets sl/Centipede_Anime.webp')
  },
  // Miscellaneous / System Notifications
  "system_quest": {
    id: "system_quest",
    name: "System Quest",
    description: "A mandatory quest issued by the System. Failure results in severe penalties.",
    originalRank: RANKS.E,
    currentShadowRank: null,
    isShadow: false,
    stats: { strength: 0, agility: 0, sense: 0, vitality: 0, intelligence: 0 },
    level: 0,
    imageSource: require('../assets sl/Anime_Episode_11_Picture_5.webp')
  },
  "system_penalty": {
    id: "system_penalty",
    name: "Penalty Zone",
    description: "Survive for 4 hours. Initialed upon failing a Daily Quest.",
    originalRank: RANKS.E,
    currentShadowRank: null,
    isShadow: false,
    stats: { strength: 0, agility: 0, sense: 0, vitality: 0, intelligence: 0 },
    level: 0,
    imageSource: require('../assets sl/3F%3F6.webp')
  },
  "system_alert": {
    id: "system_alert",
    name: "System Alert",
    description: "You have leveled up.",
    originalRank: RANKS.E,
    currentShadowRank: null,
    isShadow: false,
    stats: { strength: 0, agility: 0, sense: 0, vitality: 0, intelligence: 0 },
    level: 0,
    imageSource: require('../assets sl/%3F6.webp')
  },
  "igris_encounter": {
    id: "igris_encounter",
    name: "Blood-Red Commander Igris",
    description: "The guardian of the empty throne in the Job Change Quest.",
    originalRank: RANKS.A,
    currentShadowRank: null,
    isShadow: false,
    stats: { strength: 80, agility: 85, sense: 70, vitality: 75, intelligence: 60 },
    level: 40,
    imageSource: require('../assets sl/Igris_Anime3.webp')
  },
  "iron_encounter": {
    id: "iron_encounter",
    name: "Kim Chul",
    description: "An arrogant A-Rank Tanker of the White Tiger Guild.",
    originalRank: RANKS.A,
    currentShadowRank: null,
    isShadow: false,
    stats: { strength: 80, agility: 40, sense: 30, vitality: 95, intelligence: 20 },
    level: 40,
    imageSource: require('../assets sl/Iron_Anime2.webp')
  },
  "cerberus_encounter": {
    id: "cerberus_encounter",
    name: "Gatekeeper of Hell",
    description: "Guarding the entrance to the Demon Castle.",
    originalRank: RANKS.S,
    currentShadowRank: null,
    isShadow: false,
    stats: { strength: 85, agility: 88, sense: 75, vitality: 80, intelligence: 30 },
    level: 45,
    imageSource: require('../assets sl/Anime_Episode_7_Sung_Jinwoo_vs_Cerberus.webp')
  },
  "episode_13_img_4": {
    id: "episode_13_img_4",
    name: "Red Gate Event",
    description: "Hunters trapped inside a snowy Red Gate.",
    originalRank: RANKS.B,
    currentShadowRank: null,
    isShadow: false,
    stats: { strength: 0, agility: 0, sense: 0, vitality: 0, intelligence: 0 },
    level: 0,
    imageSource: require('../assets sl/Solo_Leveling_Anime_Episode_13_Img_4.webp')
  },
  "episode_14_img_2": {
    id: "episode_14_img_2",
    name: "Demon Castle Key",
    description: "An item required to enter the instance dungeon.",
    originalRank: RANKS.S,
    currentShadowRank: null,
    isShadow: false,
    stats: { strength: 0, agility: 0, sense: 0, vitality: 0, intelligence: 0 },
    level: 0,
    imageSource: require('../assets sl/Solo_Leveling_Anime_Episode_14_Img_2.webp')
  },
  "episode_14_img_4": {
    id: "episode_14_img_4",
    name: "Demon Soul",
    description: "Collected to craft the Elixir of Life.",
    originalRank: RANKS.A,
    currentShadowRank: null,
    isShadow: false,
    stats: { strength: 0, agility: 0, sense: 0, vitality: 0, intelligence: 0 },
    level: 0,
    imageSource: require('../assets sl/Solo_Leveling_Anime_Episode_14_Img_4.webp')
  },
  "episode_15_img_1": {
    id: "episode_15_img_1",
    name: "High Orc Capture",
    description: "The Hunters Guild assault on a High Orc A-rank gate.",
    originalRank: RANKS.A,
    currentShadowRank: null,
    isShadow: false,
    stats: { strength: 0, agility: 0, sense: 0, vitality: 0, intelligence: 0 },
    level: 0,
    imageSource: require('../assets sl/Solo_Leveling_Anime_Episode_15_Img_1.webp')
  },
  "episode_20_img_1": {
    id: "episode_20_img_1",
    name: "System Awakening",
    description: "The player accessing new system capabilities.",
    originalRank: RANKS.NATIONAL,
    currentShadowRank: null,
    isShadow: false,
    stats: { strength: 0, agility: 0, sense: 0, vitality: 0, intelligence: 0 },
    level: 0,
    imageSource: require('../assets sl/Solo_Leveling_Anime_Episode_20_Img_1.webp')
  },
  "episode_23_img_1": {
    id: "episode_23_img_1",
    name: "Jeju Island Raid",
    description: "The S-Rank massive assault on the Ant colony.",
    originalRank: RANKS.S,
    currentShadowRank: null,
    isShadow: false,
    stats: { strength: 0, agility: 0, sense: 0, vitality: 0, intelligence: 0 },
    level: 0,
    imageSource: require('../assets sl/Solo_Leveling_Anime_Episode_23_Img_1.webp')
  },
  "test": {
    id: "test",
    name: "System Test",
    description: "Initializing Shadow Army UI protocol.",
    originalRank: RANKS.E,
    currentShadowRank: null,
    isShadow: false,
    stats: { strength: 1, agility: 1, sense: 1, vitality: 1, intelligence: 1 },
    level: 1,
    imageSource: require('../assets sl/This_is_a_test.webp')
  }
};

/**
 * Helper to filter shadows by Original Hunter/Beast Rank 
 */
export const filterByRank = (rank) => {
  return Object.values(SHADOW_ARMY_DATA).filter(card => card.originalRank === rank);
};

/**
 * Helper to filter shadows by Shadow Rank
 */
export const filterByShadowRank = (shadowRank) => {
  return Object.values(SHADOW_ARMY_DATA).filter(card => card.currentShadowRank === shadowRank);
};

/**
 * Filter by Extraction Status / Shadow State
 */
export const filterUnlockedShadows = () => {
    return Object.values(SHADOW_ARMY_DATA).filter(card => card.isShadow);
}
```

## UI/UX Design System (System UI)

### Theme Constants
```javascript
// theme/systemTheme.js
export const SYSTEM_THEME = {
  colors: {
    background: '#050508', // Deep Void Black
    surface: '#11111a',    // Dark raised surface
    surfaceBorder: '#1e1e36',
    systemBlue: '#0A84FF', // Neon System UI Blue
    systemCyan: '#06b6d4', 
    shadowPurple: '#7c3aed', // Arise Magic Purple
    shadowGlow: '#a855f7',
    textMain: '#e8e8f5',
    textDim: '#6b7280',
    lockedOverlay: 'rgba(5, 5, 8, 0.85)',
  },
  typography: {
    fontFamilyPrimary: 'Orbitron',   // Requires font loading in Expo
    fontFamilySecondary: 'Rajdhani', // Requires font loading in Expo
  }
};
```

## React Native Implementation

To ensure smooth "Arise" animations, we'll use `react-native-reanimated` instead of the basic animated API for high-performance fluid 60fps animations.

```javascript
// components/ShadowCard.js
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Image, Pressable } from 'react-native';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withTiming, 
  withSpring,
  interpolateColor,
  Easing 
} from 'react-native-reanimated';
import { Feather } from '@expo/vector-icons'; // Assuming Expo setup
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
      shadowOpacity: extractionProgress.value * 0.8,
      shadowRadius: 15,
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
          {isUnlocked && (
             <View style={styles.rankBadge}>
               <Text style={styles.rankBadgeText}>{data.currentShadowRank}</Text>
             </View>
          )}
        </View>

        {/* Content Section */}
        <View style={styles.contentContainer}>
          <View style={styles.headerRow}>
            <Text style={styles.cardName}>{data.name}</Text>
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
    marginVertical: 10,
  },
  imageContainer: {
    height: 200,
    width: '100%',
    backgroundColor: SYSTEM_THEME.colors.background,
    position: 'relative',
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
    fontFamily: 'Orbitron',
    fontSize: 18,
    fontWeight: '700',
    marginTop: 8,
    letterSpacing: 2,
  },
  ariseCommandText: {
    color: SYSTEM_THEME.colors.textDim,
    fontFamily: 'Rajdhani',
    fontSize: 12,
    marginTop: 4,
    letterSpacing: 1,
  },
  rankBadge: {
    position: 'absolute',
    top: 12,
    left: 12,
    backgroundColor: 'rgba(124, 58, 237, 0.8)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: SYSTEM_THEME.colors.shadowGlow,
  },
  rankBadgeText: {
    color: '#fff',
    fontFamily: 'Orbitron',
    fontSize: 10,
    fontWeight: 'bold',
    textTransform: 'uppercase',
  },
  contentContainer: {
    padding: 16,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  cardName: {
    color: SYSTEM_THEME.colors.textMain,
    fontFamily: 'Cinzel',
    fontSize: 22,
    fontWeight: 'bold',
  },
  levelBadge: {
    backgroundColor: 'rgba(6, 182, 212, 0.15)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: 'rgba(6, 182, 212, 0.3)',
  },
  levelText: {
    color: SYSTEM_THEME.colors.systemCyan,
    fontFamily: 'Orbitron',
    fontSize: 12,
    fontWeight: 'bold',
  },
  description: {
    color: SYSTEM_THEME.colors.textDim,
    fontFamily: 'Rajdhani',
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 16,
  },
  statsWrapper: {
    gap: 8,
  },
  statContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  statLabel: {
    color: SYSTEM_THEME.colors.systemCyan,
    fontFamily: 'Orbitron',
    fontSize: 10,
    width: 30,
  },
  statBarTrack: {
    flex: 1,
    height: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 3,
    overflow: 'hidden',
  },
  statBarFill: {
    height: '100%',
    borderRadius: 3,
  },
  statValue: {
    color: SYSTEM_THEME.colors.textMain,
    fontFamily: 'Orbitron',
    fontSize: 12,
    width: 25,
    textAlign: 'right',
  }
});
```

## Using the Module (Example List)

```javascript
// App.js or Screen
import React, { useState } from 'react';
import { View, FlatList, StyleSheet } from 'react-native';
import { SHADOW_ARMY_DATA, filterByShadowRank } from './data/shadowsLore';
import { ShadowCard } from './components/ShadowCard';
import { SYSTEM_THEME } from './theme/systemTheme';

export default function ArmyScreen() {
  const [army, setArmy] = useState(Object.values(SHADOW_ARMY_DATA));

  const handleExtraction = (id) => {
    // E.g. save to AsyncStorage or Context
    console.log(`Arise command confirmed for ID: ${id}`);
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={army}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <ShadowCard data={item} onExtract={handleExtraction} />
        )}
        contentContainerStyle={{ padding: 16 }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: SYSTEM_THEME.colors.background,
  }
});
```
