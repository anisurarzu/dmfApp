import { StatusBar } from 'expo-status-bar';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Dimensions,
  Image,
  LayoutAnimation,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  UIManager,
  View,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { GREEN } from '../theme/colors';
import { extractCourseId } from '../api/courses';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

const SCREEN_W = Dimensions.get('window').width;
const BANNER_W = SCREEN_W - 32;
/** টপ ব্যানার/স্লাইডার */
const BANNER_H = 168;
const SLIDE_INTERVAL_MS = 4200;

/** Demo slides — API ইমেজের সাথে মিলিয়ে কমপক্ষে ৩টি ব্যানার */
const DEMO_BANNER_URIS = [
  'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=900&q=80',
  'https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=900&q=80',
  'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=900&q=80',
];

function buildBannerUris(course) {
  const out = [];
  if (course?.image && String(course.image).trim()) {
    out.push(String(course.image).trim());
  }
  if (Array.isArray(course?.images)) {
    course.images.forEach((u) => {
      if (typeof u === 'string' && u.trim()) out.push(u.trim());
    });
  }
  const seen = new Set();
  const unique = [];
  for (const u of out) {
    if (!seen.has(u)) {
      seen.add(u);
      unique.push(u);
    }
  }
  for (const d of DEMO_BANNER_URIS) {
    if (unique.length >= 3) break;
    if (!seen.has(d)) {
      seen.add(d);
      unique.push(d);
    }
  }
  let i = 0;
  while (unique.length < 3) {
    unique.push(DEMO_BANNER_URIS[i % DEMO_BANNER_URIS.length]);
    i += 1;
  }
  return unique;
}

const T = {
  ink: '#0f172a',
  muted: '#64748b',
  line: '#e2e8f0',
  page: '#f4f9f6',
  softGreen: '#ecfdf5',
  softGreen2: '#d1fae5',
};

function formatDate(iso) {
  if (!iso || typeof iso !== 'string') return '';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  try {
    return d.toLocaleDateString('bn-BD', { day: 'numeric', month: 'short', year: 'numeric' });
  } catch {
    return iso;
  }
}

export default function CourseDetailScreen({ navigation, route }) {
  const insets = useSafeAreaInsets();
  const course = route?.params?.course;
  const [openModuleId, setOpenModuleId] = useState(null);

  const toggleModule = useCallback((id) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setOpenModuleId((prev) => (prev === id ? null : id));
  }, []);

  if (!course) {
    return (
      <View style={[styles.screen, styles.missing, { paddingTop: insets.top + 20 }]}>
        <StatusBar style="dark" />
        <View style={styles.missIconWrap}>
          <Ionicons name="document-text-outline" size={40} color={GREEN.main} />
        </View>
        <Text style={styles.missingText}>কোর্সের তথ্য পাওয়া যায়নি।</Text>
        <TouchableOpacity style={styles.backLink} onPress={() => navigation.goBack()} activeOpacity={0.9}>
          <Text style={styles.backLinkText}>ফিরে যান</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const title = course.title || '';
  const category = course.category || '';
  const description = course.description || '';
  const instructor = course.instructor || {};
  const modules = Array.isArray(course.modules) ? course.modules : [];
  const finalExam = Array.isArray(course.finalExam) ? course.finalExam : [];
  const lessonCount = modules.reduce((n, m) => n + (Array.isArray(m.lessons) ? m.lessons.length : 0), 0);

  const bannerUris = useMemo(() => buildBannerUris(course), [course]);
  const bannerRef = useRef(null);
  const [bannerIndex, setBannerIndex] = useState(0);

  const courseKey = extractCourseId(course) || course?.title || '';
  useEffect(() => {
    setBannerIndex(0);
    const fr = requestAnimationFrame(() => {
      bannerRef.current?.scrollTo({ x: 0, animated: false });
    });
    return () => cancelAnimationFrame(fr);
  }, [courseKey]);

  useEffect(() => {
    if (bannerUris.length <= 1) return undefined;
    const id = setInterval(() => {
      setBannerIndex((prev) => {
        const next = (prev + 1) % bannerUris.length;
        bannerRef.current?.scrollTo({ x: next * BANNER_W, animated: true });
        return next;
      });
    }, SLIDE_INTERVAL_MS);
    return () => clearInterval(id);
  }, [bannerUris.length]);

  const onBannerScroll = useCallback((e) => {
    const x = e.nativeEvent.contentOffset.x;
    const i = Math.round(x / BANNER_W);
    if (i >= 0 && i < bannerUris.length) setBannerIndex(i);
  }, [bannerUris.length]);

  return (
    <View style={styles.screen}>
      <StatusBar style="dark" />
      <LinearGradient colors={[T.softGreen, T.page]} style={[styles.headerBar, { paddingTop: insets.top + 8 }]}>
        <View style={styles.headerInner}>
          <TouchableOpacity style={styles.headerBack} onPress={() => navigation.goBack()} activeOpacity={0.88}>
            <Ionicons name="chevron-back" size={22} color={GREEN.dark} />
          </TouchableOpacity>
          <View style={styles.headerTitleBlock}>
            <Text style={styles.headerKicker}>কোর্স বিবরণ</Text>
          </View>
          <View style={styles.headerSide} />
        </View>
      </LinearGradient>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.scrollInner, { paddingBottom: insets.bottom + 100 }]}
      >
        <View style={styles.heroCard}>
          <ScrollView
            ref={bannerRef}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            decelerationRate="fast"
            snapToInterval={BANNER_W}
            snapToAlignment="center"
            onMomentumScrollEnd={onBannerScroll}
            onScrollEndDrag={onBannerScroll}
            scrollEventThrottle={16}
            nestedScrollEnabled
            style={styles.bannerScroll}
            contentContainerStyle={styles.bannerScrollContent}
          >
            {bannerUris.map((uri, idx) => (
              <View key={`${uri}-${idx}`} style={[styles.bannerSlide, { width: BANNER_W }]}>
                <Image source={{ uri }} style={styles.heroImg} resizeMode="cover" />
              </View>
            ))}
          </ScrollView>
          {category ? (
            <View style={styles.heroBadge}>
              <Text style={styles.heroBadgeText}>{category}</Text>
            </View>
          ) : null}
          {bannerUris.length > 1 ? (
            <View style={styles.bannerDots} pointerEvents="none">
              {bannerUris.map((_, i) => (
                <View key={i} style={[styles.bannerDot, i === bannerIndex && styles.bannerDotActive]} />
              ))}
            </View>
          ) : null}
        </View>

        <View style={styles.content}>
          {course.batchNumber ? (
            <View style={styles.batchPill}>
              <Ionicons name="layers-outline" size={16} color={GREEN.dark} />
              <Text style={styles.batchPillText}>ব্যাচ {course.batchNumber}</Text>
            </View>
          ) : null}

          <Text style={styles.title}>{title}</Text>

          <View style={styles.quickStats}>
            <QuickStat icon="calendar-outline" label="শুরু" value={formatDate(course.startDate) || '—'} />
            <QuickStat icon="flag-outline" label="শেষ" value={formatDate(course.endDate) || '—'} />
            <QuickStat icon="time-outline" label="মেয়াদ" value={course.duration || '—'} />
            <QuickStat
              icon="people-outline"
              label="আসন"
              value={course.availableSeats != null ? String(course.availableSeats) : '—'}
            />
          </View>

          <View style={styles.instructorCard}>
            <Text style={styles.sectionLabel}>ইন্সট্রাক্টর</Text>
            <View style={styles.instructorRow}>
              {instructor.image ? (
                <Image source={{ uri: instructor.image }} style={styles.instAvatar} />
              ) : (
                <LinearGradient colors={[T.softGreen, T.softGreen2]} style={[styles.instAvatar, styles.instAvatarPh]}>
                  <Ionicons name="person" size={28} color={GREEN.dark} />
                </LinearGradient>
              )}
              <View style={styles.instText}>
                <Text style={styles.instName}>{instructor.name || '—'}</Text>
                {instructor.qualification ? (
                  <Text style={styles.instQual}>{instructor.qualification}</Text>
                ) : null}
              </View>
            </View>
          </View>

          {(course.qualifications || course.certifications) && (
            <View style={styles.infoCard}>
              <View style={styles.infoCardHead}>
                <Ionicons name="information-circle" size={22} color={GREEN.dark} />
                <Text style={styles.infoCardTitle}>যোগ্যতা ও সার্টিফিকেট</Text>
              </View>
              {course.qualifications ? (
                <Text style={styles.infoLine}>
                  <Text style={styles.infoBold}>যোগ্যতা: </Text>
                  {course.qualifications}
                </Text>
              ) : null}
              {course.certifications ? (
                <Text style={[styles.infoLine, course.qualifications ? { marginTop: 10 } : null]}>
                  <Text style={styles.infoBold}>সার্টিফিকেট: </Text>
                  {course.certifications}
                </Text>
              ) : null}
            </View>
          )}

          <View style={styles.sectionHead}>
            <Ionicons name="reader-outline" size={22} color={GREEN.dark} />
            <Text style={styles.sectionTitle}>কোর্স সম্পর্কে</Text>
          </View>
          <Text style={styles.description}>{description}</Text>

          <View style={styles.sectionHead}>
            <Ionicons name="list-outline" size={22} color={GREEN.dark} />
            <Text style={styles.sectionTitle}>কারিকুলাম</Text>
          </View>
          <Text style={styles.sectionSub}>
            {modules.length}টি মডিউল · {lessonCount}টি পাঠ
          </Text>

          {modules.map((mod, idx) => {
            const mid = mod.moduleId || String(idx);
            const lessons = Array.isArray(mod.lessons) ? mod.lessons : [];
            const open = openModuleId === mid;
            return (
              <View key={mid} style={styles.moduleOuter}>
                <TouchableOpacity
                  style={styles.moduleHead}
                  onPress={() => toggleModule(mid)}
                  activeOpacity={0.88}
                >
                  <View style={styles.moduleAccent} />
                  <View style={styles.moduleHeadText}>
                    <Text style={styles.moduleIndex}>মডিউল {idx + 1}</Text>
                    <Text style={styles.moduleTitle} numberOfLines={2}>
                      {mod.title || 'শিরোনাম'}
                    </Text>
                    <Text style={styles.moduleMeta}>{lessons.length} পাঠ</Text>
                  </View>
                  <Ionicons name={open ? 'chevron-up' : 'chevron-down'} size={22} color={T.muted} />
                </TouchableOpacity>
                {open ? (
                  <View style={styles.moduleBody}>
                    {mod.description ? <Text style={styles.moduleDesc}>{mod.description}</Text> : null}
                    {lessons.map((les, j) => (
                      <View key={les.lessonId || j} style={styles.lessonRow}>
                        <View style={styles.lessonDot} />
                        <Text style={styles.lessonTitle} numberOfLines={3}>
                          {les.title || `পাঠ ${j + 1}`}
                        </Text>
                      </View>
                    ))}
                  </View>
                ) : null}
              </View>
            );
          })}

          {finalExam.length > 0 ? (
            <>
              <View style={styles.sectionHead}>
                <Ionicons name="clipboard-outline" size={22} color={GREEN.dark} />
                <Text style={styles.sectionTitle}>ফাইনাল পরীক্ষা</Text>
              </View>
              <View style={styles.examCard}>
                <LinearGradient colors={[T.softGreen, '#fff']} style={styles.examInner}>
                  <Ionicons name="trophy-outline" size={26} color={GREEN.dark} />
                  <View style={{ flex: 1 }}>
                    <Text style={styles.examTitle}>মূল্যায়ন</Text>
                    <Text style={styles.examSub}>
                      {finalExam.length}টি প্রশ্ন · কোর্স শেষে
                    </Text>
                  </View>
                </LinearGradient>
              </View>
            </>
          ) : null}
        </View>
      </ScrollView>

      <View style={[styles.ctaBar, { paddingBottom: Math.max(insets.bottom, 12) }]}>
        <TouchableOpacity activeOpacity={0.92} onPress={() => {}} style={styles.ctaTouchable}>
          <LinearGradient colors={[GREEN.dark, GREEN.main]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.ctaGradient}>
            <Text style={styles.ctaText}>এনরোল করুন</Text>
            <Ionicons name="arrow-forward-circle" size={24} color="#fff" />
          </LinearGradient>
        </TouchableOpacity>
        <Text style={styles.ctaHint}>শীঘ্রই রেজিস্ট্রেশন খুলবে</Text>
      </View>
    </View>
  );
}

function QuickStat({ icon, label, value }) {
  return (
    <View style={styles.qStat}>
      <View style={styles.qStatIcon}>
        <Ionicons name={icon} size={18} color={GREEN.dark} />
      </View>
      <Text style={styles.qStatLabel}>{label}</Text>
      <Text style={styles.qStatValue} numberOfLines={2}>
        {value}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: T.page },
  headerBar: {
    borderBottomWidth: 1,
    borderBottomColor: T.line,
  },
  headerInner: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingBottom: 12,
  },
  headerBack: {
    width: 42,
    height: 42,
    borderRadius: 14,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: T.line,
  },
  headerTitleBlock: { flex: 1, marginLeft: 10, marginRight: 8, justifyContent: 'center' },
  headerSide: { width: 42 },
  headerKicker: { fontSize: 15, fontWeight: '800', color: GREEN.dark, letterSpacing: -0.2 },
  scrollInner: { paddingTop: 10 },
  heroCard: {
    marginHorizontal: 16,
    borderRadius: 20,
    overflow: 'hidden',
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: T.line,
    shadowColor: '#0f172a',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.08,
    shadowRadius: 20,
    elevation: 6,
    position: 'relative',
  },
  bannerScroll: { width: BANNER_W },
  bannerScrollContent: { alignItems: 'stretch' },
  bannerSlide: { height: BANNER_H },
  heroImg: { width: '100%', height: BANNER_H, backgroundColor: T.softGreen },
  bannerDots: {
    position: 'absolute',
    bottom: 8,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  bannerDot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    marginHorizontal: 2,
    backgroundColor: 'rgba(255,255,255,0.45)',
  },
  bannerDotActive: {
    width: 14,
    backgroundColor: '#fff',
  },
  heroPh: { alignItems: 'center', justifyContent: 'center' },
  heroBadge: {
    position: 'absolute',
    left: 8,
    top: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    backgroundColor: 'rgba(255,255,255,0.95)',
    borderWidth: 1,
    borderColor: T.line,
  },
  heroBadgeText: { fontSize: 10, fontWeight: '800', color: GREEN.dark },
  content: { paddingHorizontal: 16, paddingTop: 12 },
  batchPill: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    backgroundColor: T.softGreen,
    borderWidth: 1,
    borderColor: '#bbf7d0',
    marginBottom: 8,
  },
  batchPillText: { fontSize: 13, fontWeight: '800', color: GREEN.dark },
  title: {
    fontSize: 21,
    fontWeight: '900',
    color: T.ink,
    letterSpacing: -0.4,
    lineHeight: 27,
    marginBottom: 2,
  },
  quickStats: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 10,
    gap: 10,
  },
  qStat: {
    width: '47%',
    flexGrow: 1,
    minWidth: '45%',
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 12,
    borderWidth: 1,
    borderColor: T.line,
  },
  qStatIcon: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: T.softGreen,
    alignItems: 'center',
    justifyContent: 'center',
  },
  qStatLabel: { marginTop: 8, fontSize: 11, fontWeight: '800', color: T.muted, textTransform: 'uppercase' },
  qStatValue: { marginTop: 4, fontSize: 14, fontWeight: '800', color: T.ink, lineHeight: 19 },
  instructorCard: {
    marginTop: 20,
    padding: 16,
    borderRadius: 16,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: T.line,
  },
  sectionLabel: { fontSize: 12, fontWeight: '800', color: T.muted, marginBottom: 12, letterSpacing: 0.3 },
  instructorRow: { flexDirection: 'row', alignItems: 'center' },
  instAvatar: { width: 64, height: 64, borderRadius: 32, marginRight: 14, backgroundColor: '#e2e8f0' },
  instAvatarPh: { alignItems: 'center', justifyContent: 'center' },
  instText: { flex: 1 },
  instName: { fontSize: 17, fontWeight: '800', color: T.ink },
  instQual: { marginTop: 6, fontSize: 14, fontWeight: '600', color: T.muted, lineHeight: 20 },
  infoCard: {
    marginTop: 16,
    padding: 16,
    borderRadius: 16,
    backgroundColor: T.softGreen,
    borderWidth: 1,
    borderColor: '#bbf7d0',
  },
  infoCardHead: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12 },
  infoCardTitle: { fontSize: 16, fontWeight: '800', color: GREEN.dark },
  infoLine: { fontSize: 14, fontWeight: '600', color: GREEN.dark, lineHeight: 22 },
  infoBold: { fontWeight: '800' },
  sectionHead: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 28,
    marginBottom: 8,
  },
  sectionTitle: { fontSize: 18, fontWeight: '900', color: T.ink },
  sectionSub: { fontSize: 13, fontWeight: '600', color: T.muted, marginBottom: 12 },
  description: { fontSize: 15, fontWeight: '500', color: '#334155', lineHeight: 24 },
  moduleOuter: {
    marginBottom: 12,
    borderRadius: 16,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: T.line,
    overflow: 'hidden',
  },
  moduleHead: { flexDirection: 'row', alignItems: 'center', paddingVertical: 14, paddingRight: 12 },
  moduleAccent: {
    width: 4,
    alignSelf: 'stretch',
    backgroundColor: GREEN.main,
    borderTopRightRadius: 4,
    borderBottomRightRadius: 4,
    marginRight: 12,
  },
  moduleHeadText: { flex: 1, paddingRight: 8 },
  moduleIndex: { fontSize: 11, fontWeight: '800', color: GREEN.main, letterSpacing: 0.4 },
  moduleTitle: { marginTop: 4, fontSize: 15, fontWeight: '800', color: T.ink, lineHeight: 21 },
  moduleMeta: { marginTop: 4, fontSize: 12, fontWeight: '600', color: T.muted },
  moduleBody: { paddingLeft: 20, paddingRight: 16, paddingBottom: 16, borderTopWidth: 1, borderTopColor: '#f1f5f9' },
  moduleDesc: { marginTop: 12, fontSize: 13, fontWeight: '500', color: T.muted, lineHeight: 20 },
  lessonRow: { flexDirection: 'row', alignItems: 'flex-start', marginTop: 10 },
  lessonDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: GREEN.main,
    marginTop: 7,
    marginRight: 10,
  },
  lessonTitle: { flex: 1, fontSize: 14, fontWeight: '600', color: T.ink, lineHeight: 21 },
  examCard: { borderRadius: 16, overflow: 'hidden', borderWidth: 1, borderColor: T.line },
  examInner: { flexDirection: 'row', alignItems: 'center', padding: 16, gap: 14 },
  examTitle: { fontSize: 16, fontWeight: '800', color: T.ink },
  examSub: { marginTop: 4, fontSize: 13, fontWeight: '600', color: T.muted },
  ctaBar: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: 16,
    paddingTop: 10,
    backgroundColor: 'rgba(255,255,255,0.96)',
    borderTopWidth: 1,
    borderTopColor: T.line,
  },
  ctaTouchable: { borderRadius: 16, overflow: 'hidden' },
  ctaGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    paddingVertical: 16,
    paddingHorizontal: 24,
  },
  ctaText: { fontSize: 17, fontWeight: '900', color: '#fff', letterSpacing: 0.2 },
  ctaHint: { textAlign: 'center', marginTop: 8, fontSize: 12, fontWeight: '600', color: T.muted },
  missing: { alignItems: 'center', justifyContent: 'center', paddingHorizontal: 24, backgroundColor: T.page },
  missIconWrap: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: T.line,
  },
  missingText: { marginTop: 16, fontSize: 15, fontWeight: '600', color: T.muted, textAlign: 'center' },
  backLink: { marginTop: 16, paddingVertical: 12, paddingHorizontal: 24 },
  backLinkText: { fontSize: 15, fontWeight: '800', color: GREEN.main },
});
