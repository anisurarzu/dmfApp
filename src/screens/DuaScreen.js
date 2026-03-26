import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { GREEN, NEUTRAL } from '../theme/colors';
import BottomNav from '../components/BottomNav';

const ITEMS = [
  { key: 'salat', label: 'Salat-Prayer', icon: 'person' },
  { key: 'daily', label: 'Daily Life', icon: 'calendar-outline' },
  { key: 'sawm', label: 'Sawm', icon: 'moon-outline' },
  { key: 'zikr', label: 'Morning-Evening Zikr', icon: 'sunny-outline' },
  { key: 'quran', label: 'From the Quran', icon: 'book-outline' },
  { key: 'misc', label: 'Miscellaneous', icon: 'ellipsis-horizontal' },
];

export default function DuaScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  return (
    <View style={styles.screen}>
      {/* Green hero on top */}
      <View style={[styles.top, { height: Math.max(118, Math.max(insets.top, 8) + 72) }]}>
        <View style={styles.topBgBubble} />
        <View style={[styles.topInner, { paddingTop: Math.max(insets.top, 8) + 6 }]}>
          <View style={styles.headerRow}>
            <Text style={styles.headerTitle}>Dua</Text>
            <TouchableOpacity activeOpacity={0.7} style={styles.headerIconBtn}>
              <Ionicons name="search-outline" size={20} color="#ffffff" />
            </TouchableOpacity>
          </View>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.sheet}>
          <View style={styles.grid}>
            {ITEMS.map((item) => (
              <TouchableOpacity key={item.key} style={styles.tile} activeOpacity={0.8}>
                <View style={styles.tileCircle}>
                  <Ionicons name={item.icon} size={26} color={GREEN.main} />
                </View>
                <Text style={styles.tileLabel}>{item.label}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <View style={styles.collectionHeader}>
            <Text style={styles.collectionTitle}>My Dua Collections</Text>
          </View>
        </View>
      </ScrollView>

      <BottomNav navigation={navigation} active="home" />
    </View>
  );
}

const styles = StyleSheet.create({
  // Green background like dashboard; white only below hero
  screen: { flex: 1, backgroundColor: GREEN.bg },
  top: {
    minHeight: 118,
    backgroundColor: GREEN.dark,
    overflow: 'hidden',
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
  },
  topBgBubble: {
    position: 'absolute',
    width: 220,
    height: 220,
    borderRadius: 110,
    backgroundColor: 'rgba(34,197,94,0.28)',
    top: -120,
    left: -60,
  },
  topInner: { flex: 1, paddingHorizontal: 20 },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerIconBtn: {
    width: 40,
    height: 40,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.16)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#ffffff',
  },
  content: {
    paddingBottom: 90,
  },
  sheet: {
    marginTop: -20,
    paddingTop: 24,
    paddingHorizontal: 20,
    paddingBottom: 24,
    backgroundColor: NEUTRAL.white,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    rowGap: 26,
    marginBottom: 28,
  },
  tile: {
    width: '46%',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 18,
    paddingVertical: 14,
  },
  tileCircle: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: GREEN.pale,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  tileLabel: {
    textAlign: 'center',
    fontSize: 12,
    fontWeight: '700',
    color: GREEN.dark,
  },
  collectionHeader: {
    borderTopWidth: 1,
    borderTopColor: NEUTRAL.border,
    paddingTop: 18,
  },
  collectionTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: GREEN.dark,
  },
});

