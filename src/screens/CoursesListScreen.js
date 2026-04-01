import { StatusBar } from 'expo-status-bar';
import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Dimensions,
  FlatList,
  Image,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { GREEN } from '../theme/colors';
import { useAuth } from '../context/AuthContext';
import { extractCourseId, fetchAllCourses } from '../api/courses';

function courseErrorMessage(err, fallback) {
  const m = err?.data?.message ?? err?.message;
  if (typeof m === 'string' && m.trim()) return m.trim();
  return fallback;
}

function formatCourseDateShort(iso) {
  if (!iso || typeof iso !== 'string') return '';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  try {
    return d.toLocaleDateString('bn-BD', { day: 'numeric', month: 'short' });
  } catch {
    return '';
  }
}

const { width: SCREEN_W } = Dimensions.get('window');
const H_PAD = 16;
const COL_GAP = 12;
/** Two cards per row */
const CARD_W = Math.floor((SCREEN_W - H_PAD * 2 - COL_GAP) / 2);
const THUMB_H = Math.round(CARD_W * 0.58);

const C = {
  page: '#f4f9f6',
  white: '#ffffff',
  ink: '#0f172a',
  muted: '#64748b',
  line: '#e2e8f0',
  chipBg: '#ecfdf5',
  chipBorder: '#bbf7d0',
};

export default function CoursesListScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const { token } = useAuth();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  const categories = useMemo(() => {
    const set = new Set();
    courses.forEach((c) => {
      if (c?.category) set.add(String(c.category).trim());
    });
    return Array.from(set).sort();
  }, [courses]);

  const [selectedCategory, setSelectedCategory] = useState(null);

  const filteredCourses = useMemo(() => {
    if (!selectedCategory) return courses;
    return courses.filter((c) => String(c?.category || '').trim() === selectedCategory);
  }, [courses, selectedCategory]);

  const load = useCallback(async () => {
    setError('');
    try {
      const list = await fetchAllCourses(token);
      setCourses(Array.isArray(list) ? list : []);
    } catch (e) {
      setCourses([]);
      setError(courseErrorMessage(e, 'কোর্স লোড করা যায়নি। আবার চেষ্টা করুন।'));
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [token]);

  useEffect(() => {
    setLoading(true);
    load();
  }, [load]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    load();
  }, [load]);

  const renderItem = useCallback(
    ({ item }) => (
      <CourseCard item={item} onPress={() => navigation.navigate('CourseDetail', { course: item })} />
    ),
    [navigation]
  );

  return (
    <View style={styles.screen}>
      <StatusBar style="dark" />
      <LinearGradient
        colors={['#ecfdf5', '#f8fafc', C.page]}
        locations={[0, 0.45, 1]}
        style={[styles.topWash, { paddingTop: Math.max(insets.top, 8) }]}
      >
        <View style={styles.headerRow}>
          <TouchableOpacity
            style={styles.backBtn}
            onPress={() => navigation.goBack()}
            activeOpacity={0.85}
            accessibilityRole="button"
            accessibilityLabel="Back"
          >
            <Ionicons name="chevron-back" size={22} color={GREEN.dark} />
          </TouchableOpacity>
          <View style={styles.headerTextBlock}>
            <Text style={styles.headerTitle}>কোর্সসমূহ</Text>
            <Text style={styles.headerSub}>শিখুন নিজের গতিতে — গুণগত মানসম্পন্ন কনটেন্ট</Text>
          </View>
          <View style={styles.headerSpacer} />
        </View>

        {categories.length > 0 ? (
          <FlatList
            horizontal
            showsHorizontalScrollIndicator={false}
            data={[{ key: 'all', label: 'সব' }, ...categories.map((c) => ({ key: c, label: c }))]}
            keyExtractor={(x) => x.key}
            contentContainerStyle={styles.chipListContent}
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
        ) : null}
      </LinearGradient>

      {loading ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={GREEN.main} />
          <Text style={styles.loadingText}>কোর্স লোড হচ্ছে…</Text>
        </View>
      ) : error ? (
        <View style={styles.centered}>
          <View style={styles.errorIconWrap}>
            <Ionicons name="cloud-offline-outline" size={40} color={GREEN.main} />
          </View>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity
            style={styles.retryBtn}
            onPress={() => {
              setLoading(true);
              load();
            }}
            activeOpacity={0.9}
          >
            <Text style={styles.retryBtnText}>আবার চেষ্টা করুন</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={filteredCourses}
          keyExtractor={(item) => extractCourseId(item) || item.title}
          numColumns={2}
          renderItem={renderItem}
          columnWrapperStyle={styles.columnWrap}
          contentContainerStyle={[styles.listContent, { paddingBottom: insets.bottom + 28 }]}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={GREEN.main} colors={[GREEN.main]} />
          }
          ListEmptyComponent={
            <View style={styles.empty}>
              <View style={styles.emptyIconWrap}>
                <Ionicons name="school-outline" size={44} color={GREEN.main} />
              </View>
              <Text style={styles.emptyTitle}>এখনও কোনো কোর্স নেই</Text>
              <Text style={styles.emptySub}>শীঘ্রই নতুন কোর্স যুক্ত হবে।</Text>
            </View>
          }
        />
      )}
    </View>
  );
}

function CourseCard({ item, onPress }) {
  const title = item?.title || 'শিরোনাম ছাড়া';
  const category = item?.category || '';
  const instructorName = item?.instructor?.name || '';
  const instructorImg = item?.instructor?.image;
  const cover = item?.image;
  const duration = item?.duration || '';
  const seats = item?.availableSeats;
  const startStr = formatCourseDateShort(item?.startDate);
  const endStr = formatCourseDateShort(item?.endDate);

  return (
    <TouchableOpacity style={styles.card} activeOpacity={0.92} onPress={onPress}>
      <View style={styles.thumbWrap}>
        {cover ? (
          <Image source={{ uri: cover }} style={styles.thumb} resizeMode="cover" />
        ) : (
          <LinearGradient colors={['#ecfdf5', '#d1fae5']} style={[styles.thumb, styles.thumbPlaceholder]}>
            <Ionicons name="image-outline" size={32} color={GREEN.main} />
          </LinearGradient>
        )}
        {category ? (
          <View style={styles.badge}>
            <Text style={styles.badgeText} numberOfLines={1}>
              {category}
            </Text>
          </View>
        ) : null}
      </View>
      <View style={styles.cardBody}>
        <Text style={styles.cardTitle} numberOfLines={2}>
          {title}
        </Text>
        {startStr || endStr ? (
          <View style={styles.dateStrip}>
            <Text style={styles.dateLine} numberOfLines={1}>
              <Text style={styles.dateLbl}>শুরু </Text>
              <Text style={styles.dateVal}>{startStr || '—'}</Text>
              <Text style={styles.dateDot}> · </Text>
              <Text style={styles.dateLbl}>শেষ </Text>
              <Text style={styles.dateVal}>{endStr || '—'}</Text>
            </Text>
          </View>
        ) : null}
        <View style={styles.instructorRow}>
          {instructorImg ? (
            <Image source={{ uri: instructorImg }} style={styles.instructorAvatar} />
          ) : (
            <View style={[styles.instructorAvatar, styles.avatarPh]}>
              <Ionicons name="person" size={12} color={C.muted} />
            </View>
          )}
          <Text style={styles.instructorName} numberOfLines={1}>
            {instructorName || 'ইন্সট্রাক্টর'}
          </Text>
        </View>
        <View style={styles.metaRow}>
          <Ionicons name="time-outline" size={13} color={GREEN.dark} />
          <Text style={styles.metaText} numberOfLines={1}>
            {duration || '—'}
          </Text>
        </View>
        {seats != null ? (
          <View style={styles.seatPill}>
            <Ionicons name="people-outline" size={12} color={GREEN.dark} />
            <Text style={styles.seatPillText}>{seats} আসন</Text>
          </View>
        ) : null}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: C.page },
  topWash: {
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: C.chipBorder,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: H_PAD,
    paddingBottom: 4,
  },
  backBtn: {
    width: 42,
    height: 42,
    borderRadius: 14,
    backgroundColor: C.white,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: C.chipBorder,
    shadowColor: '#0f172a',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  headerTextBlock: { flex: 1, marginLeft: 12, marginRight: 8 },
  headerSpacer: { width: 42 },
  headerTitle: {
    fontSize: 22,
    fontWeight: '900',
    color: GREEN.dark,
    letterSpacing: -0.4,
  },
  headerSub: {
    marginTop: 4,
    fontSize: 12,
    fontWeight: '600',
    color: C.muted,
    lineHeight: 17,
  },
  chipListContent: { paddingHorizontal: H_PAD, paddingTop: 12, gap: 0 },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 999,
    backgroundColor: C.white,
    marginRight: 8,
    borderWidth: 1,
    borderColor: C.chipBorder,
  },
  chipActive: {
    backgroundColor: GREEN.main,
    borderColor: GREEN.main,
  },
  chipText: { fontSize: 12, fontWeight: '700', color: GREEN.dark },
  chipTextActive: { color: '#fff' },
  columnWrap: {
    paddingHorizontal: H_PAD,
    justifyContent: 'space-between',
    marginBottom: COL_GAP,
  },
  listContent: { paddingTop: COL_GAP },
  card: {
    width: CARD_W,
    backgroundColor: C.white,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: C.line,
    overflow: 'hidden',
    shadowColor: '#0f172a',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.07,
    shadowRadius: 12,
    elevation: 4,
  },
  thumbWrap: { position: 'relative' },
  thumb: { width: '100%', height: THUMB_H, backgroundColor: C.chipBg },
  thumbPlaceholder: { alignItems: 'center', justifyContent: 'center' },
  badge: {
    position: 'absolute',
    left: 8,
    top: 8,
    maxWidth: CARD_W - 24,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    backgroundColor: 'rgba(255,255,255,0.95)',
    borderWidth: 1,
    borderColor: C.chipBorder,
  },
  badgeText: { fontSize: 10, fontWeight: '800', color: GREEN.dark },
  cardBody: { padding: 10 },
  cardTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: C.ink,
    lineHeight: 17,
  },
  dateStrip: {
    alignSelf: 'stretch',
    marginTop: 4,
    backgroundColor: GREEN.dark,
    borderRadius: 6,
    paddingVertical: 3,
    paddingHorizontal: 6,
  },
  dateLine: { fontSize: 9, lineHeight: 12 },
  dateLbl: { fontSize: 8, fontWeight: '700', color: 'rgba(255,255,255,0.82)' },
  dateVal: { fontSize: 9, fontWeight: '800', color: '#ffffff' },
  dateDot: { fontSize: 9, fontWeight: '700', color: 'rgba(255,255,255,0.55)' },
  instructorRow: { flexDirection: 'row', alignItems: 'center', marginTop: 6 },
  instructorAvatar: {
    width: 22,
    height: 22,
    borderRadius: 11,
    marginRight: 6,
    backgroundColor: '#e2e8f0',
  },
  avatarPh: { alignItems: 'center', justifyContent: 'center' },
  instructorName: { flex: 1, fontSize: 11, fontWeight: '600', color: C.muted },
  metaRow: { flexDirection: 'row', alignItems: 'center', marginTop: 6, gap: 4 },
  metaText: { flex: 1, fontSize: 11, fontWeight: '600', color: GREEN.dark },
  seatPill: {
    marginTop: 8,
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    backgroundColor: C.chipBg,
  },
  seatPillText: { fontSize: 10, fontWeight: '700', color: GREEN.dark },
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 },
  loadingText: { marginTop: 12, fontSize: 14, fontWeight: '600', color: C.muted },
  errorIconWrap: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: C.chipBg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  errorText: {
    marginTop: 14,
    textAlign: 'center',
    fontSize: 14,
    fontWeight: '600',
    color: C.ink,
    lineHeight: 20,
    paddingHorizontal: 12,
  },
  retryBtn: {
    marginTop: 18,
    paddingHorizontal: 22,
    paddingVertical: 12,
    borderRadius: 14,
    backgroundColor: GREEN.main,
    shadowColor: GREEN.dark,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 3,
  },
  retryBtnText: { fontSize: 14, fontWeight: '800', color: '#fff' },
  empty: { alignItems: 'center', paddingVertical: 56, paddingHorizontal: 24 },
  emptyIconWrap: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: C.white,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: C.chipBorder,
  },
  emptyTitle: { marginTop: 16, fontSize: 17, fontWeight: '800', color: C.ink },
  emptySub: { marginTop: 6, fontSize: 13, fontWeight: '600', color: C.muted, textAlign: 'center' },
});
