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

const SKILL_AREAS = [
  {
    key: 'computer',
    title: 'Computer Skills',
    badge: 'Digital',
    description: 'Basic to advanced computer literacy, office apps, and online tools.',
    icon: 'laptop-outline',
    level: 'Beginner to Advanced',
  },
  {
    key: 'driving',
    title: 'Driving Skills',
    badge: 'Field',
    description: 'Practical driving skills and road safety awareness with mentors.',
    icon: 'car-outline',
    level: 'Beginner',
  },
  {
    key: 'language',
    title: 'Language Skills',
    badge: 'Communication',
    description: 'Spoken English & Arabic basics for work and study.',
    icon: 'chatbubbles-outline',
    level: 'Beginner',
  },
  {
    key: 'career_soft',
    title: 'Career & Soft Skills',
    badge: 'Growth',
    description: 'CV writing, interview prep, teamwork, and professional habits.',
    icon: 'briefcase-outline',
    level: 'All levels',
  },
];

export default function SkillsScreen({ navigation }) {
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
    ]).start(() => {
      setShowIntro(false);
    });
  }, [introOpacity, introScale]);

  return (
    <View style={styles.screen}>
      <StatusBar style="light" />
      <LinearGradient
        colors={['#022c22', '#064e3b', '#047857']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[styles.top, { paddingTop: Math.max(insets.top, 12) + 4 }]}
      >
        <View style={styles.topRow}>
          <TouchableOpacity style={styles.backBtn} activeOpacity={0.75} onPress={() => navigation.goBack()}>
            <Ionicons name="chevron-back" size={22} color="#f9fafb" />
          </TouchableOpacity>
          <View style={styles.topCenter}>
            <Text style={styles.topTitle}>DMF Skill Center</Text>
            <Text style={styles.topSub}>Learn practical skills for your future</Text>
          </View>
          <View style={{ width: 40 }} />
        </View>

        <View style={styles.topHero}>
          <View style={styles.topHeroLeft}>
            <Text style={styles.heroKicker}>Skill development</Text>
            <Text style={styles.heroTitle}>Upgrade your skills with DMF</Text>
            <Text style={styles.heroBody}>
              Build real-world skills in computer, driving, language and more—step by step, at your pace.
            </Text>
          </View>
          <View style={styles.topHeroRight}>
            <View style={styles.heroBadgeCard}>
              <Ionicons name="ribbon-outline" size={20} color={GREEN.dark} />
              <Text style={styles.heroBadgeTitle}>DMF Skills</Text>
              <Text style={styles.heroBadgeSub}>Learning that moves you forward.</Text>
            </View>
          </View>
        </View>
      </LinearGradient>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[styles.content, { paddingBottom: Math.max(insets.bottom, 14) + 24 }]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.sheet}>
          <View style={styles.sectionHead}>
            <View>
              <Text style={styles.sectionTitle}>Available skill tracks</Text>
              <Text style={styles.sectionSub}>DMF Skill Development Center</Text>
            </View>
            <View style={styles.sectionPill}>
              <View style={styles.sectionPillDot} />
              <Text style={styles.sectionPillText}>Open for enrollment</Text>
            </View>
          </View>

          {SKILL_AREAS.map((skill, index) => (
            <View
              key={skill.key}
              style={[styles.card, index === SKILL_AREAS.length - 1 && { marginBottom: 4 }]}
            >
              <View style={styles.cardTop}>
                <View style={styles.cardIcon}>
                  <Ionicons name={skill.icon} size={20} color={GREEN.dark} />
                </View>
                <View style={{ flex: 1 }}>
                  <View style={styles.cardTitleRow}>
                    <Text style={styles.cardTitle}>{skill.title}</Text>
                    <View style={styles.badge}>
                      <Text style={styles.badgeText}>{skill.badge}</Text>
                    </View>
                  </View>
                  <Text style={styles.cardDesc}>{skill.description}</Text>
                  <Text style={styles.cardMeta}>Level: {skill.level}</Text>
                </View>
              </View>

              <View style={styles.cardFooter}>
                <View style={styles.progressPill}>
                  <View style={styles.progressTrack}>
                    <View style={styles.progressFill} />
                  </View>
                  <Text style={styles.progressLabel}>Seats limited · Apply early</Text>
                </View>
                <TouchableOpacity
                  style={styles.ctaBtn}
                  activeOpacity={0.88}
                  onPress={() => {
                    // For now go to EducationAll — can later deep-link to specific skill program detail.
                    navigation.navigate('EducationAll');
                  }}
                >
                  <Text style={styles.ctaBtnText}>View details</Text>
                  <Ionicons name="chevron-forward" size={16} color="#fff" />
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </View>
      </ScrollView>

      {showIntro && (
        <Animated.View
          pointerEvents="none"
          style={[
            styles.introOverlay,
            {
              opacity: introOpacity,
              transform: [{ scale: introScale }],
            },
          ]}
        >
          <View style={styles.introCard}>
            <View style={styles.introIconWrap}>
              <Ionicons name="sparkles" size={26} color="#f97316" />
            </View>
            <Text style={styles.introTitle}>Welcome to DMF Skills</Text>
            <Text style={styles.introSub}>Loading your learning paths…</Text>
            <View style={styles.introLoadingRow}>
              <ActivityIndicator size="small" color="#22c55e" />
              <Text style={styles.introLoadingText}>Preparing skill tracks</Text>
            </View>
          </View>
        </Animated.View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: GREEN.bg },
  top: {
    paddingHorizontal: 18,
    paddingBottom: 18,
    borderBottomLeftRadius: 26,
    borderBottomRightRadius: 26,
    ...(Platform.OS === 'android' ? { elevation: 6 } : { shadowColor: '#000', shadowOpacity: 0.16, shadowOffset: { width: 0, height: 6 }, shadowRadius: 14 }),
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
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
  topCenter: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  topTitle: {
    color: '#f9fafb',
    fontSize: 18,
    fontWeight: '900',
    letterSpacing: 0.2,
  },
  topSub: {
    marginTop: 2,
    color: 'rgba(226,232,240,0.9)',
    fontSize: 11,
    fontWeight: '600',
  },
  topHero: {
    marginTop: 18,
    flexDirection: 'row',
  },
  topHeroLeft: { flex: 2, paddingRight: 10 },
  topHeroRight: { flex: 1, alignItems: 'flex-end', justifyContent: 'flex-start' },
  heroKicker: {
    color: '#bbf7d0',
    fontSize: 11,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  heroTitle: {
    marginTop: 6,
    color: '#f9fafb',
    fontSize: 20,
    fontWeight: '900',
    letterSpacing: -0.2,
  },
  heroBody: {
    marginTop: 6,
    color: 'rgba(226,232,240,0.92)',
    fontSize: 12,
    fontWeight: '600',
    lineHeight: 17,
  },
  heroBadgeCard: {
    minWidth: 120,
    paddingHorizontal: 10,
    paddingVertical: 10,
    borderRadius: 18,
    backgroundColor: '#ecfdf3',
    borderWidth: 1,
    borderColor: '#bbf7d0',
    alignItems: 'flex-start',
  },
  heroBadgeTitle: {
    marginTop: 6,
    fontSize: 13,
    fontWeight: '900',
    color: GREEN.dark,
  },
  heroBadgeSub: {
    marginTop: 4,
    fontSize: 11,
    fontWeight: '600',
    color: NEUTRAL.subtext,
  },
  scroll: { flex: 1 },
  content: { paddingHorizontal: 18, paddingTop: 12 },
  sheet: {
    backgroundColor: '#f9fafb',
    borderRadius: 22,
    paddingHorizontal: 14,
    paddingVertical: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  sectionHead: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  sectionTitle: { fontSize: 17, fontWeight: '900', color: '#0f172a' },
  sectionSub: { marginTop: 2, fontSize: 12, fontWeight: '600', color: NEUTRAL.subtext },
  sectionPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: '#ecfdf3',
    borderWidth: 1,
    borderColor: '#bbf7d0',
  },
  sectionPillDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#22c55e',
    marginRight: 6,
  },
  sectionPillText: { fontSize: 11, fontWeight: '800', color: GREEN.dark },
  card: {
    borderRadius: 18,
    backgroundColor: '#ffffff',
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    shadowColor: '#0f172a',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    ...(Platform.OS === 'android' ? { elevation: 2 } : {}),
  },
  cardTop: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  cardIcon: {
    width: 40,
    height: 40,
    borderRadius: 16,
    backgroundColor: '#ecfdf3',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  cardTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: '900',
    color: '#0f172a',
    flex: 1,
    marginRight: 8,
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 999,
    backgroundColor: '#eff6ff',
    borderWidth: 1,
    borderColor: '#bfdbfe',
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#1d4ed8',
  },
  cardDesc: {
    marginTop: 6,
    fontSize: 12,
    fontWeight: '600',
    color: NEUTRAL.subtext,
    lineHeight: 17,
  },
  cardMeta: {
    marginTop: 6,
    fontSize: 11,
    fontWeight: '700',
    color: GREEN.dark,
  },
  cardFooter: {
    marginTop: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  progressPill: { flex: 1, marginRight: 10 },
  progressTrack: {
    height: 6,
    borderRadius: 3,
    backgroundColor: '#e2e8f0',
    overflow: 'hidden',
  },
  progressFill: {
    width: '65%',
    height: 6,
    borderRadius: 3,
    backgroundColor: GREEN.main,
  },
  progressLabel: {
    marginTop: 4,
    fontSize: 11,
    fontWeight: '700',
    color: '#64748b',
  },
  ctaBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 999,
    backgroundColor: GREEN.dark,
  },
  ctaBtnText: {
    marginRight: 6,
    fontSize: 12,
    fontWeight: '800',
    color: '#ffffff',
  },
  introOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(15,23,42,0.60)',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  introCard: {
    width: '100%',
    maxWidth: 340,
    borderRadius: 22,
    backgroundColor: '#020617',
    paddingHorizontal: 18,
    paddingVertical: 18,
    borderWidth: 1,
    borderColor: 'rgba(148,163,184,0.7)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.35,
    shadowRadius: 26,
    ...(Platform.OS === 'android' ? { elevation: 10 } : {}),
  },
  introIconWrap: {
    width: 42,
    height: 42,
    borderRadius: 16,
    backgroundColor: 'rgba(22,163,74,0.16)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  introTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: '#f9fafb',
  },
  introSub: {
    marginTop: 4,
    fontSize: 12,
    fontWeight: '600',
    color: 'rgba(226,232,240,0.9)',
  },
  introLoadingRow: {
    marginTop: 12,
    flexDirection: 'row',
    alignItems: 'center',
  },
  introLoadingText: {
    marginLeft: 8,
    fontSize: 11,
    fontWeight: '700',
    color: 'rgba(226,232,240,0.95)',
  },
});

