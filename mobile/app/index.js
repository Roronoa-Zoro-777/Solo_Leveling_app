import React, { useState } from 'react';
import { View, Text, FlatList, StyleSheet, SafeAreaView, StatusBar, TouchableOpacity } from 'react-native';
import { SHADOW_ARMY_DATA, filterUnlockedShadows, filterByShadowRank, SHADOW_RANKS } from '../data/shadowsLore';
import { ShadowCard } from '../components/ShadowCard';
import { SYSTEM_THEME } from '../theme/systemTheme';

export default function App() {
  const [army, setArmy] = useState(Object.values(SHADOW_ARMY_DATA));
  const [activeTab, setActiveTab] = useState('ALL');

  const handleExtraction = (id) => {
    console.log(`Arise command confirmed for ID: ${id}`);
    // In a real app with persistent storage, you'd update an Array or database here.
    // For this prototype, the state naturally manages it inside the component.
  };

  // Filter the list based on the active tab
  const getFilteredData = () => {
    if (activeTab === 'ALL') return army;
    if (activeTab === 'SHADOWS') return filterUnlockedShadows();
    if (activeTab === 'ENEMIES') return army.filter(item => !item.isShadow && item.originalRank !== 'National Level');
    return army;
  };

  const tabs = ['ALL', 'SHADOWS', 'ENEMIES'];

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor={SYSTEM_THEME.colors.background} />
      
      <View style={styles.header}>
        <Text style={styles.headerSubtitle}>◈ SYSTEM DATABASE ◈</Text>
        <Text style={styles.headerTitle}>Entity Registry</Text>
      </View>

      <View style={styles.tabContainer}>
        {tabs.map(tab => (
          <TouchableOpacity 
            key={tab} 
            style={[styles.tabButton, activeTab === tab && styles.tabButtonActive]}
            onPress={() => setActiveTab(tab)}
          >
            <Text style={[styles.tabText, activeTab === tab && styles.tabTextActive]}>
              {tab}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <FlatList
        data={getFilteredData()}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <ShadowCard data={item} onExtract={handleExtraction} />
        )}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: SYSTEM_THEME.colors.background,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 40,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: SYSTEM_THEME.colors.surfaceBorder,
    backgroundColor: SYSTEM_THEME.colors.surface,
  },
  headerSubtitle: {
    color: SYSTEM_THEME.colors.systemCyan,
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 2,
    marginBottom: 4,
  },
  headerTitle: {
    color: SYSTEM_THEME.colors.textMain,
    fontSize: 32,
    fontWeight: 'bold',
  },
  tabContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 16,
    gap: 12,
  },
  tabButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: SYSTEM_THEME.colors.surfaceBorder,
    backgroundColor: 'transparent',
  },
  tabButtonActive: {
    backgroundColor: 'rgba(124, 58, 237, 0.15)',
    borderColor: SYSTEM_THEME.colors.shadowPurple,
  },
  tabText: {
    color: SYSTEM_THEME.colors.textDim,
    fontSize: 12,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
  tabTextActive: {
    color: SYSTEM_THEME.colors.shadowGlow,
  },
  listContainer: {
    padding: 16,
    paddingBottom: 40,
  }
});
