import { StaticImageData } from 'next/image';

import imgBeru from '@/assets/Solo_Leveling_Anime_Episode_18_Img_1.webp';
import imgIgris from '@/assets/Igris22.webp';
import imgIron from '@/assets/Iron_3.webp';
import imgTank from '@/assets/Tank_Anime2.webp';
import imgTusk from '@/assets/Tusk0.webp';
import imgKaisel from '@/assets/Kaisel1.webp';
import imgJima from '@/assets/Jima1.webp';
import imgKamish from '@/assets/Kamish3.webp';
import imgBellion from '@/assets/Bellion1.webp';
import imgBaekYoonho from '@/assets/Baek-baekgu.webp';
import imgCerberus from '@/assets/Cerberus1.webp';
import imgVulcan from '@/assets/Vulcan1.webp';
import imgAmmut from '@/assets/Ammut1.webp';
import imgBaruka from '@/assets/Baruka2.webp';
import imgJinwoo from '@/assets/Jinwoo4.webp';
import imgStatueOfGod from '@/assets/Statue_of_God_Smile_Anime_Episode_1.webp';
import imgShadowBaekgu from '@/assets/Shadow_BAEKGU.webp';
import imgSuhoNaga from '@/assets/Suho_naga_shadow_shape.webp';
import imgIceBears from '@/assets/Ice_Bears_Anime.webp';
import imgIceElves from '@/assets/Ice_Elves_Anime.webp';
import imgIceGolems from '@/assets/Ice_Golems2.webp';
import imgDungeonJackals from '@/assets/Dungeon_Jackals_Anime.webp';
import imgCentipede from '@/assets/Centipede_Anime.webp';
import imgSystemQuest from '@/assets/Anime_Episode_11_Picture_5.webp';
import imgSystemPenalty from '@/assets/system_penalty.webp';
import imgSystemAlert from '@/assets/system_alert.webp';
import imgIgrisEncounter from '@/assets/Igris_Anime3.webp';
import imgIronEncounter from '@/assets/Iron_Anime2.webp';
import imgCerberusEncounter from '@/assets/Anime_Episode_7_Sung_Jinwoo_vs_Cerberus.webp';
import imgEpisode13 from '@/assets/Solo_Leveling_Anime_Episode_13_Img_4.webp';
import imgEpisode14_2 from '@/assets/Solo_Leveling_Anime_Episode_14_Img_2.webp';
import imgEpisode14_4 from '@/assets/Solo_Leveling_Anime_Episode_14_Img_4.webp';
import imgEpisode15 from '@/assets/Solo_Leveling_Anime_Episode_15_Img_1.webp';
import imgEpisode20 from '@/assets/Solo_Leveling_Anime_Episode_20_Img_1.webp';
import imgEpisode23 from '@/assets/Solo_Leveling_Anime_Episode_23_Img_1.webp';
import imgTest from '@/assets/This_is_a_test.webp';

export const RANKS = {
  E: 'E',
  D: 'D',
  C: 'C',
  B: 'B',
  A: 'A',
  S: 'S',
  NATIONAL: 'National Level',
} as const;

export const SHADOW_RANKS = {
  INFANTRY: 'Infantry',
  ELITE: 'Elite',
  KNIGHT: 'Knight',
  ELITE_KNIGHT: 'Elite Knight',
  COMMANDER: 'Commander',
  MARSHAL: 'Marshal',
  GRAND_MARSHAL: 'Grand Marshal',
} as const;

export interface Stats {
  strength: number;
  agility: number;
  sense: number;
  vitality: number;
  intelligence: number;
}

export interface ShadowCardData {
  id: string;
  name: string;
  description: string;
  originalRank: string;
  currentShadowRank: string | null;
  isShadow: boolean;
  stats: Stats;
  level: number;
  cost: number; // Cost in XP/Points to unlock
  unlockLevel: number; // Hunter level required to unlock this card
  imageSource: StaticImageData;
}

export const SHADOW_ARMY_DATA: Record<string, ShadowCardData> = {
  "beru": {
    id: "beru",
    name: "Beru",
    description: "The Ant King. A magical beast created to be the ultimate predator. Possesses overwhelming speed and power, along with the ability to heal.",
    originalRank: RANKS.S,
    currentShadowRank: SHADOW_RANKS.MARSHAL,
    isShadow: true,
    stats: { strength: 95, agility: 99, sense: 90, vitality: 85, intelligence: 80 },
    level: 70,
    cost: 1050,
    unlockLevel: 150,
    imageSource: imgBeru
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
    cost: 975,
    unlockLevel: 140,
    imageSource: imgIgris
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
    cost: 600,
    unlockLevel: 80,
    imageSource: imgIron
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
    cost: 525,
    unlockLevel: 70,
    imageSource: imgTank
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
    cost: 825,
    unlockLevel: 110,
    imageSource: imgTusk
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
    cost: 675,
    unlockLevel: 90,
    imageSource: imgKaisel
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
    cost: 630,
    unlockLevel: 85,
    imageSource: imgJima
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
    cost: 1425,
    unlockLevel: 175,
    imageSource: imgKamish
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
    cost: 1350,
    unlockLevel: 180,
    imageSource: imgBellion
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
    cost: 750,
    unlockLevel: 100,
    imageSource: imgBaekYoonho
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
    cost: 675,
    unlockLevel: 90,
    imageSource: imgCerberus
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
    cost: 900,
    unlockLevel: 120,
    imageSource: imgVulcan
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
    cost: 720,
    unlockLevel: 95,
    imageSource: imgAmmut
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
    cost: 675,
    unlockLevel: 90,
    imageSource: imgBaruka
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
    cost: 1500,
    unlockLevel: 200,
    imageSource: imgJinwoo
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
    cost: 1200,
    unlockLevel: 160,
    imageSource: imgStatueOfGod
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
    cost: 375,
    unlockLevel: 50,
    imageSource: imgShadowBaekgu
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
    cost: 420,
    unlockLevel: 55,
    imageSource: imgSuhoNaga
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
    cost: 375,
    unlockLevel: 50,
    imageSource: imgIceBears
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
    cost: 330,
    unlockLevel: 45,
    imageSource: imgIceElves
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
    cost: 450,
    unlockLevel: 60,
    imageSource: imgIceGolems
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
    cost: 75,
    unlockLevel: 5,
    imageSource: imgDungeonJackals
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
    cost: 420,
    unlockLevel: 55,
    imageSource: imgCentipede
  },
  "system_quest": {
    id: "system_quest",
    name: "System Quest",
    description: "A mandatory quest issued by the System. Failure results in severe penalties.",
    originalRank: RANKS.E,
    currentShadowRank: null,
    isShadow: false,
    stats: { strength: 0, agility: 0, sense: 0, vitality: 0, intelligence: 0 },
    level: 0,
    cost: 0,
    unlockLevel: 5,
    imageSource: imgSystemQuest
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
    cost: 0,
    unlockLevel: 10,
    imageSource: imgSystemPenalty
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
    cost: 0,
    unlockLevel: 15,
    imageSource: imgSystemAlert
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
    cost: 600,
    unlockLevel: 80,
    imageSource: imgIgrisEncounter
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
    cost: 600,
    unlockLevel: 80,
    imageSource: imgIronEncounter
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
    cost: 675,
    unlockLevel: 90,
    imageSource: imgCerberusEncounter
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
    cost: 0,
    unlockLevel: 25,
    imageSource: imgEpisode13
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
    cost: 0,
    unlockLevel: 30,
    imageSource: imgEpisode14_2
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
    cost: 0,
    unlockLevel: 35,
    imageSource: imgEpisode14_4
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
    cost: 0,
    unlockLevel: 40,
    imageSource: imgEpisode15
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
    cost: 0,
    unlockLevel: 65,
    imageSource: imgEpisode20
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
    cost: 0,
    unlockLevel: 75,
    imageSource: imgEpisode23
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
    cost: 15,
    unlockLevel: 5,
    imageSource: imgTest
  }
};

export const filterByRank = (rank: string) => {
  return Object.values(SHADOW_ARMY_DATA).filter(card => card.originalRank === rank);
};

export const filterByShadowRank = (shadowRank: string) => {
  return Object.values(SHADOW_ARMY_DATA).filter(card => card.currentShadowRank === shadowRank);
};

export const filterUnlockedShadows = () => {
  return Object.values(SHADOW_ARMY_DATA).filter(card => card.isShadow);
};
