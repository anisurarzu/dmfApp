import { StatusBar } from 'expo-status-bar';
import { useMemo, useState } from 'react';
import {
  Dimensions,
  FlatList,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BOOKS } from '../constants/books';

const TEAL = {
  deep: '#0f766e',
  main: '#14b8a6',
  light: '#5eead4',
  pale: '#ccfbf1',
  page: '#f0fdfa',
  ink: '#0f172a',
  muted: '#64748b',
};

const { width: SCREEN_W } = Dimensions.get('window');
const H_PAD = 16;
const COLS = 3;
const GAP = 10;
const CELL_W = Math.floor((SCREEN_W - H_PAD * 2 - GAP * (COLS - 1)) / COLS);
const COVER_H = Math.round(CELL_W * 1.38);

export default function BooksListScreen({ navigation }) {
  const insets = useSafeAreaInsets();

  const categories = useMemo(() => {
    const s = new Set();
    BOOKS.forEach((b) => {
      if (b.category) s.add(String(b.category).trim());
    });
    return Array.from(s).sort();
  }, []);

  const [selectedCategory, setSelectedCategory] = useState(null);

  const filtered = useMemo(() => {
    if (!selectedCategory) return BOOKS;
    return BOOKS.filter((b) => String(b.category || '').trim() === selectedCategory);
  }, [selectedCategory]);

  const renderBook = ({ item }) => (
    <TouchableOpacity
      style={[styles.cell, { width: CELL_W }]}
      activeOpacity={0.9}
      onPress={() => navigation.navigate('BookDetail', { bookId: item.id })}
    >
      <View style={styles.coverWrap}>
        <Image source={item.cover} style={styles.cover} resizeMode="cover" />
        <LinearGradient colors={['transparent', 'rgba(15,23,42,0.55)']} style={styles.coverFade} />
      </View>
      <Text style={styles.cellTitle} numberOfLines={2}>
        {item.title}
      </Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.screen}>
      <StatusBar style="dark" />
      <LinearGradient
        colors={[TEAL.pale, '#fff', TEAL.page]}
        locations={[0, 0.4, 1]}
        style={[styles.header, { paddingTop: Math.max(insets.top, 8) }]}
      >
        <View style={styles.headerRow}>
          <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()} activeOpacity={0.88}>
            <Ionicons name="chevron-back" size={22} color={TEAL.deep} />
          </TouchableOpacity>
          <View style={styles.headerText}>
            <Text style={styles.headerTitle}>বইসমূহ</Text>
            <Text style={styles.headerSub}>ক্যাটাগরি বেছে নিন · বইতে ট্যাপ করুন</Text>
          </View>
          <View style={styles.headerSpacer} />
        </View>

        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={[{ key: 'all', label: 'সব' }, ...categories.map((c) => ({ key: c, label: c }))]}
          keyExtractor={(x) => x.key}
          contentContainerStyle={styles.chipRow}
          renderItem={({ item }) => {
            const active = item.key === 'all' ? selectedCategory == null : selectedCategory === item.key;
            return (
              <TouchableOpacity
                style={[styles.chip, active && styles.chipActive]}
                onPress={() => setSelectedCategory(item.key === 'all' ? null : item.key)}
                activeOpacity={0.85}
              >
                <Text style={[styles.chipText, active && styles.chipTextActive]} numberOfLines={1}>
                  {item.label}
                </Text>
              </TouchableOpacity>
            );
          }}
        />
      </LinearGradient>

      <FlatList
        data={filtered}
        keyExtractor={(b) => b.id}
        numColumns={COLS}
        renderItem={renderBook}
        columnWrapperStyle={styles.row}
        contentContainerStyle={[styles.gridContent, { paddingBottom: insets.bottom + 24 }]}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Ionicons name="book-outline" size={40} color={TEAL.main} />
            <Text style={styles.emptyText}>এই ক্যাটাগরিতে কোনো বই নেই</Text>
          </View>
        }
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: TEAL.page },
  header: {
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(20,184,166,0.2)',
  },
  headerRow: { flexDirection: 'row', alignItems: 'flex-start', paddingHorizontal: H_PAD, paddingBottom: 4 },
  backBtn: {
    width: 42,
    height: 42,
    borderRadius: 14,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: TEAL.light,
    marginTop: 2,
  },
  headerText: { flex: 1, marginLeft: 12 },
  headerSpacer: { width: 42 },
  headerTitle: { fontSize: 22, fontWeight: '900', color: TEAL.deep, letterSpacing: -0.4 },
  headerSub: { marginTop: 4, fontSize: 12, fontWeight: '600', color: TEAL.muted, lineHeight: 16 },
  chipRow: { paddingHorizontal: H_PAD, paddingTop: 12, paddingBottom: 4 },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 999,
    backgroundColor: '#fff',
    marginRight: 8,
    borderWidth: 1,
    borderColor: TEAL.light,
  },
  chipActive: { backgroundColor: TEAL.main, borderColor: TEAL.main },
  chipText: { fontSize: 12, fontWeight: '700', color: TEAL.deep },
  chipTextActive: { color: '#fff' },
  gridContent: { paddingHorizontal: H_PAD, paddingTop: 16 },
  row: {
    marginBottom: GAP,
    justifyContent: 'flex-start',
    gap: GAP,
  },
  cell: {
    marginBottom: GAP,
    alignItems: 'center',
  },
  coverWrap: {
    width: CELL_W,
    height: COVER_H,
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: '#e2e8f0',
    borderWidth: 1,
    borderColor: 'rgba(20,184,166,0.25)',
    shadowColor: '#0f172a',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  cover: { width: '100%', height: '100%' },
  coverFade: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: COVER_H * 0.35,
  },
  cellTitle: {
    marginTop: 6,
    fontSize: 10,
    fontWeight: '800',
    color: TEAL.ink,
    lineHeight: 13,
    minHeight: 26,
    letterSpacing: -0.1,
    textAlign: 'center',
    width: '100%',
  },
  empty: { alignItems: 'center', paddingVertical: 48 },
  emptyText: { marginTop: 10, fontSize: 14, fontWeight: '600', color: TEAL.muted },
});
