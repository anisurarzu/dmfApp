import { StatusBar } from 'expo-status-bar';
import { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Animated,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { GREEN, NEUTRAL } from '../theme/colors';

const INTRO_DURATION_MS = 1300;

const UPCOMING_COMPETITIONS = [
  {
    key: 'scholarship',
    title: 'DMF Scholarship',
    tag: 'Featured',
    icon: 'school-outline',
    desc: 'Apply for scholarship support based on merit, need, and impact.',
  },
  {
    key: 'innovative_project',
    title: 'Innovative Project',
    tag: 'Innovation',
    icon: 'bulb-outline',
    desc: 'Submit creative project ideas that solve real community problems.',
  },
  {
    key: 'written_competition',
    title: 'Written Competition',
    tag: 'Academic',
    icon: 'create-outline',
    desc: 'Participate in writing and essay competitions with national-level exposure.',
  },
  {
    key: 'seerat_competition',
    title: 'Seerat Competition',
    tag: 'Islamic',
    icon: 'book-outline',
    desc: 'Showcase your knowledge of Seerat with guided preparation resources.',
  },
];

export default function ApplicationScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const [showIntro, setShowIntro] = useState(true);
  const introOpacity = useRef(new Animated.Value(1)).current;
  const introScale = useRef(new Animated.Value(0.94)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(introOpacity, {
        toValue: 0,
        duration: INTRO_DURATION_MS,
        delay: 700,
        useNativeDriver: true,
      }),
      Animated.spring(introScale, {
        toValue: 1.04,
        useNativeDriver: true,
        friction: 6,
        tension: 80,
      }),
    ]).start(() => setShowIntro(false));
  }, [introOpacity, introScale]);

  return (
    <View style={styles.screen}>
      <StatusBar style="light" />
      <LinearGradient
        colors={['#082f49', '#0c4a6e', '#0369a1']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[styles.top, { paddingTop: Math.max(insets.top, 12) + 4 }]}
      >
        <View style={styles.topRow}>
          <TouchableOpacity style={styles.backBtn} activeOpacity={0.75} onPress={() => navigation.goBack()}>
            <Ionicons name="chevron-back" size={22} color="#f9fafb" />
          </TouchableOpacity>
          <View style={styles.topCenter}>
            <Text style={styles.topTitle}>Application Center</Text>
            <Text style={styles.topSub}>Apply for programs and competitions</Text>
          </View>
          <View style={{ width: 40 }} />
        </View>
        <Text style={styles.heroKicker}>Upcoming competition</Text>
        <Text style={styles.heroTitle}>New opportunities are open</Text>
      </LinearGradient>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[styles.content, { paddingBottom: Math.max(insets.bottom, 14) + 24 }]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.sheet}>
          <View style={styles.sectionHead}>
            <Text style={styles.sectionTitle}>Upcoming Competition</Text>
            <View style={styles.livePill}>
              <View style={styles.liveDot} />
              <Text style={styles.liveText}>Now open</Text>
            </View>
          </View>

          {UPCOMING_COMPETITIONS.map((item) => (
            <View key={item.key} style={styles.card}>
              <View style={styles.iconWrap}>
                <Ionicons name={item.icon} size={20} color="#075985" />
              </View>
              <View style={{ flex: 1 }}>
                <View style={styles.cardTopRow}>
                  <Text style={styles.cardTitle}>{item.title}</Text>
                  <View style={styles.tag}>
                    <Text style={styles.tagText}>{item.tag}</Text>
                  </View>
                </View>
                <Text style={styles.cardDesc}>{item.desc}</Text>
                <TouchableOpacity style={styles.cta} activeOpacity={0.88} onPress={() => navigation.navigate('EducationAll')}>
                  <Text style={styles.ctaText}>Apply now</Text>
                  <Ionicons name="arrow-forward" size={14} color="#fff" />
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </View>
      </ScrollView>

      {showIntro && (
        <Animated.View
          pointerEvents="none"
          style={[styles.introOverlay, { opacity: introOpacity, transform: [{ scale: introScale }] }]}
        >
          <View style={styles.introCard}>
            <Ionicons name="sparkles" size={26} color="#38bdf8" />
            <Text style={styles.introTitle}>Welcome to Application Center</Text>
            <Text style={styles.introSub}>Loading upcoming competitions…</Text>
            <View style={styles.introLoadingRow}>
              <ActivityIndicator size="small" color="#38bdf8" />
              <Text style={styles.introLoadingText}>Preparing opportunities</Text>
            </View>
          </View>
        </Animated.View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: GREEN.bg },
  top: { paddingHorizontal: 18, paddingBottom: 18, borderBottomLeftRadius: 26, borderBottomRightRadius: 26 },
  topRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 14,
    backgroundColor: 'rgba(15,23,42,0.18)',
    borderWidth: 1,
    borderColor: 'rgba(148,163,184,0.5)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  topCenter: { flex: 1, alignItems: 'center' },
  topTitle: { color: '#f9fafb', fontSize: 18, fontWeight: '900' },
  topSub: { marginTop: 2, color: 'rgba(226,232,240,0.9)', fontSize: 11, fontWeight: '600' },
  heroKicker: { marginTop: 14, color: '#bae6fd', fontWeight: '800', fontSize: 11, textTransform: 'uppercase', letterSpacing: 1 },
  heroTitle: { marginTop: 5, color: '#f8fafc', fontWeight: '900', fontSize: 20 },
  scroll: { flex: 1 },
  content: { paddingHorizontal: 18, paddingTop: 12 },
  sheet: { backgroundColor: '#f8fafc', borderRadius: 22, padding: 14, borderWidth: 1, borderColor: '#e2e8f0' },
  sectionHead: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 },
  sectionTitle: { fontSize: 17, fontWeight: '900', color: '#0f172a' },
  livePill: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 999, backgroundColor: '#ecfeff', borderWidth: 1, borderColor: '#bae6fd' },
  liveDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#06b6d4', marginRight: 6 },
  liveText: { fontSize: 11, fontWeight: '800', color: '#0c4a6e' },
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#dbeafe',
    padding: 12,
    marginBottom: 10,
    flexDirection: 'row',
  },
  iconWrap: { width: 40, height: 40, borderRadius: 14, backgroundColor: '#e0f2fe', alignItems: 'center', justifyContent: 'center', marginRight: 10 },
  cardTopRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  cardTitle: { fontSize: 15, fontWeight: '900', color: '#0f172a', flex: 1, marginRight: 8 },
  tag: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 999, backgroundColor: '#eff6ff', borderWidth: 1, borderColor: '#bfdbfe' },
  tagText: { fontSize: 10, fontWeight: '800', color: '#1d4ed8' },
  cardDesc: { marginTop: 6, fontSize: 12, fontWeight: '600', lineHeight: 17, color: NEUTRAL.subtext },
  cta: { marginTop: 8, alignSelf: 'flex-start', flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 999, backgroundColor: '#0c4a6e' },
  ctaText: { color: '#fff', fontWeight: '800', fontSize: 12, marginRight: 6 },
  introOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(15,23,42,0.60)', alignItems: 'center', justifyContent: 'center', paddingHorizontal: 24 },
  introCard: {
    width: '100%',
    maxWidth: 340,
    borderRadius: 22,
    backgroundColor: '#020617',
    paddingHorizontal: 18,
    paddingVertical: 18,
    borderWidth: 1,
    borderColor: 'rgba(148,163,184,0.7)',
    alignItems: 'flex-start',
    ...(Platform.OS === 'android' ? { elevation: 10 } : {}),
  },
  introTitle: { marginTop: 8, fontSize: 18, fontWeight: '900', color: '#f9fafb' },
  introSub: { marginTop: 4, fontSize: 12, fontWeight: '600', color: 'rgba(226,232,240,0.9)' },
  introLoadingRow: { marginTop: 12, flexDirection: 'row', alignItems: 'center' },
  introLoadingText: { marginLeft: 8, fontSize: 11, fontWeight: '700', color: 'rgba(226,232,240,0.95)' },
});

