import { StatusBar } from 'expo-status-bar';
import { useEffect, useMemo, useRef, useState } from 'react';
import {
  Animated,
  Dimensions,
  Easing,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import Svg, { Circle, Path } from 'react-native-svg';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import BottomNav from '../components/BottomNav';

const { width: SCREEN_W } = Dimensions.get('window');

const RED = {
  dark: '#991b1b',
  main: '#dc2626',
};

const DONOR_TYPES = ['O-', 'O+', 'A-', 'A+', 'B-', 'B+', 'AB-', 'AB+'];
const POS = ['O+', 'A+', 'B+', 'AB+'];
const NEG = ['O-', 'A-', 'B-', 'AB-'];

/** One full donor cycle + progress animation (tube / bottle / icon) */
const CYCLE_MS = 11030;
/** Same as useEffect Animated.timing duration */
const ANIM_MS = CYCLE_MS - 600;
/**
 * Tube completes at this progress. Icon fill can start slightly earlier (overlap) so fill feels earlier.
 */
const PHASE_BLOOD_AT_ICON = 0.7;
/** Wall-clock: icon fill starts this many ms earlier than the previous overlap point (~0.56 of cycle) */
const ICON_FILL_EARLIER_BY_MS = 2000;
const PHASE_ICON_FILL_START = Math.max(0, 0.56 - ICON_FILL_EARLIER_BY_MS / ANIM_MS);

const SCROLL_H_PAD = 20;
const STAGE_MAX_W = Math.min(SCREEN_W - SCROLL_H_PAD * 2, 340);
const STAGE_H = 430;
const ICON_SIZE = 30;
const BAG_W = 60;
const BAG_H = 92;
const BOTTLE_TOP = 14;
const TUBE_REVEAL_DASH = 470;

const AnimatedPath = Animated.createAnimatedComponent(Path);

const BLOOD_DETAILS_BN = [
  {
    key: 'O-',
    title: 'O ঋণাত্মক (ইউনিভার্সাল দাতা — Rh−)',
    lines: [
      'Rh ঋণাত্মক সব গ্রুপে রক্ত দিতে পারেন; দাতা সংখ্যা কম বলে প্রতিটি দান বিশেষ মূল্যবান।',
      'নিয়মিত দানের আগে ভালো ঘুম, হালকা খাবার ও পর্যাপ্ত পানি নিন।',
    ],
  },
  {
    key: 'O+',
    title: 'O ধনাত্মক',
    lines: [
      'O ও AB ধরণের Rh ধনাত্মক গ্রুপে রক্ত দিতে পারেন।',
      'পুরুষ প্রতি ৩ মাস পর; নারীদের ক্ষেত্রে গাইনি বিশেষজ্ঞের পরামর্শ মেনে ব্যবধান রাখুন।',
    ],
  },
  {
    key: 'A-',
    title: 'A ঋণাত্মক',
    lines: [
      'A ও AB ঋণাত্মক গ্রুপে দান করতে পারেন।',
      'দানের আগে হিমোগ্লোবিন ও রক্তচাপ স্বাভাবিক আছে কিনা জেনে নিন।',
    ],
  },
  {
    key: 'A+',
    title: 'A ধনাত্মক',
    lines: [
      'A ও AB ধনাত্মক গ্রুপে রক্ত দিতে পারেন।',
      'অসুস্থতা, জ্বর বা এন্টিবায়োটিক চলাকালীন দান করা উচিত নয়।',
    ],
  },
  {
    key: 'B-',
    title: 'B ঋণাত্মক',
    lines: [
      'B ও AB ঋণাত্মক গ্রুপে দান করতে পারেন।',
      'সংক্রমণমুক্ত ও সুস্থ অবস্থায়ই হাসপাতাল/ব্যাংকের নিয়ম মেনে দান করুন।',
    ],
  },
  {
    key: 'B+',
    title: 'B ধনাত্মক',
    lines: [
      'B ও AB ধনাত্মক গ্রুপে রক্ত দিতে পারেন।',
      'দানের দিন হালকা খাবার খেয়ে আসুন; খালি পেটে ভারী কাজ এড়িয়ে চলুন।',
    ],
  },
  {
    key: 'AB-',
    title: 'AB ঋণাত্মক',
    lines: [
      'শুধু AB ঋণাত্মক গ্রুপে দান; দাতা কম—প্রতিটি ইউনিট জীবন বাঁচাতে সাহায্য করে।',
      'নিয়মিত স্বাস্থ্য পরীক্ষা ও সুস্থ জীবনধারা দীর্ঘমেয়াদি দানের জন্য গুরুত্বপূর্ণ।',
    ],
  },
  {
    key: 'AB+',
    title: 'AB ধনাত্মক',
    lines: [
      'রিসিপিয়েন্ট হিসেবে Rh+ রক্তের বিস্তৃত সুবিধা; দাতা হিসেবে শুধু AB+ গ্রুপে দান।',
      'চিকিৎসকের পরামর্শ ছাড়া ওষুধ বদলাবেন না; দানের আগে সত্যিকারের তথ্য দিন।',
    ],
  },
];

const BLOOD_DETAILS_BY_KEY = Object.fromEntries(BLOOD_DETAILS_BN.map((x) => [x.key, x]));

function parseBlood(s) {
  const t = String(s || '').trim().toUpperCase();
  return { abo: t.slice(0, -1), rh: t.slice(-1) };
}

function canDonate(d, r) {
  const D = parseBlood(d);
  const R = parseBlood(r);
  const abo =
    D.abo === 'O' ||
    (D.abo === 'A' && (R.abo === 'A' || R.abo === 'AB')) ||
    (D.abo === 'B' && (R.abo === 'B' || R.abo === 'AB')) ||
    (D.abo === 'AB' && R.abo === 'AB');
  const rh = D.rh === '-' || (D.rh === '+' && R.rh === '+');
  return abo && rh;
}

/** Approximate quadratic Bezier length (same curve as tube Path: M p0 Q p1, p2). */
function approxQuadBezierLength(p0, p1, p2, segments = 24) {
  let len = 0;
  let px = p0.x;
  let py = p0.y;
  for (let i = 1; i <= segments; i++) {
    const t = i / segments;
    const omt = 1 - t;
    const x = omt * omt * p0.x + 2 * omt * t * p1.x + t * t * p2.x;
    const y = omt * omt * p0.y + 2 * omt * t * p1.y + t * t * p2.y;
    len += Math.hypot(x - px, y - py);
    px = x;
    py = y;
  }
  return len;
}

export default function BloodDonationScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const [index, setIndex] = useState(0);
  const donor = DONOR_TYPES[index];

  const progress = useRef(new Animated.Value(0)).current;
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    const t = setInterval(() => {
      if (!mountedRef.current) return;
      setIndex((p) => (p + 1) % DONOR_TYPES.length);
    }, CYCLE_MS);
    return () => {
      mountedRef.current = false;
      clearInterval(t);
    };
  }, []);

  useEffect(() => {
    progress.stopAnimation();
    progress.setValue(0);
    const run = Animated.timing(progress, {
      toValue: 1,
      duration: ANIM_MS,
      easing: Easing.linear,
      useNativeDriver: false,
    });
    run.start();
    return () => progress.stopAnimation();
  }, [donor, progress]);

  const recipients = useMemo(() => [...POS, ...NEG].filter((r) => canDonate(donor, r)), [donor]);
  const currentBloodTip = BLOOD_DETAILS_BY_KEY[donor] || BLOOD_DETAILS_BN[0];

  const W = STAGE_MAX_W;
  const centerX = W / 2;
  const start = { x: centerX, y: BOTTLE_TOP + BAG_H };
  const ctrlY = 208;
  const edge = 54;
  const targets = useMemo(
    () =>
      [...POS, ...NEG].map((g, i) => ({
        key: g,
        side: i < 4 ? 'left' : 'right',
        x: i < 4 ? edge : W - edge,
        y: 168 + (i % 4) * 62,
      })),
    [W]
  );

  const bottleFillHeight = useMemo(
    () =>
      progress.interpolate({
        inputRange: [0, 1],
        outputRange: [BAG_H, 0],
        extrapolate: 'clamp',
      }),
    [progress]
  );

  const tubeDashOffset = useMemo(
    () =>
      progress.interpolate({
        inputRange: [0, PHASE_BLOOD_AT_ICON, 1],
        outputRange: [TUBE_REVEAL_DASH, 0, 0],
        extrapolate: 'clamp',
      }),
    [progress]
  );

  const humanFillByKey = useMemo(() => {
    const startPt = { x: centerX, y: BOTTLE_TOP + BAG_H };
    const ctrl = { x: centerX, y: ctrlY };
    const span = PHASE_BLOOD_AT_ICON - PHASE_ICON_FILL_START;

    const withLen = targets.map((t) => ({
      key: t.key,
      len: approxQuadBezierLength(startPt, ctrl, { x: t.x, y: t.y }),
    }));

    const activeEntries = withLen.filter((x) => recipients.includes(x.key));
    const sorted = [...activeEntries].sort((a, b) => a.len - b.len);
    const minL = sorted[0]?.len ?? 0;
    const maxL = sorted[sorted.length - 1]?.len ?? 1;

    const fillStartByKey = {};
    for (const e of withLen) {
      if (!recipients.includes(e.key)) {
        fillStartByKey[e.key] = null;
        continue;
      }
      const tNorm = maxL > minL ? (e.len - minL) / (maxL - minL) : 0;
      fillStartByKey[e.key] = PHASE_ICON_FILL_START + tNorm * span;
    }

    const zeroHeight = progress.interpolate({
      inputRange: [0, 1],
      outputRange: [0, 0],
    });

    const map = {};
    for (const t of targets) {
      const fs = fillStartByKey[t.key];
      if (fs == null) {
        map[t.key] = zeroHeight;
      } else {
        map[t.key] = progress.interpolate({
          inputRange: [0, fs, 1],
          outputRange: [0, 0, ICON_SIZE],
          extrapolate: 'clamp',
        });
      }
    }
    return map;
  }, [progress, recipients, targets, centerX, ctrlY]);

  return (
    <View style={styles.screen}>
      <StatusBar style="light" />

      <LinearGradient
        colors={[RED.dark, RED.main]}
        style={{ paddingTop: insets.top + 10, paddingHorizontal: 20, paddingBottom: 18 }}
      >
        <View style={styles.headerRow}>
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => navigation?.goBack?.()}
            style={styles.backBtn}
          >
            <Ionicons name="chevron-back" size={22} color="#fff" />
          </TouchableOpacity>
          <View style={{ flex: 1 }}>
            <Text style={styles.headerTitle}>Blood Donation Guide</Text>
            <Text style={styles.headerSub}>Compatible donors & recipients</Text>
          </View>
        </View>
      </LinearGradient>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: 110 + insets.bottom }]}
        showsVerticalScrollIndicator={false}
      >
        <View style={[styles.stageOuter, { width: STAGE_MAX_W }]}>
          <Svg width={W} height={STAGE_H} style={[StyleSheet.absoluteFill, styles.svgLayer]}>
            {targets.map((t) => {
              const d = `M ${start.x} ${start.y} Q ${centerX} ${ctrlY}, ${t.x} ${t.y}`;
              return (
                <Path
                  key={`tube-base-${t.key}`}
                  d={d}
                  stroke="rgba(148,163,184,0.32)"
                  strokeWidth={4}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  fill="none"
                  opacity={0.4}
                />
              );
            })}
            {targets.map((t) => {
              const active = recipients.includes(t.key);
              if (!active) return null;
              const d = `M ${start.x} ${start.y} Q ${centerX} ${ctrlY}, ${t.x} ${t.y}`;
              return (
                <AnimatedPath
                  key={`tube-fill-${t.key}`}
                  d={d}
                  stroke={RED.main}
                  strokeWidth={4}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  fill="none"
                  strokeDasharray={`${TUBE_REVEAL_DASH}`}
                  strokeDashoffset={tubeDashOffset}
                  opacity={0.95}
                />
              );
            })}
            <Circle cx={start.x} cy={start.y} r={5} fill={RED.main} opacity={0.95} />
          </Svg>

          <View style={[styles.bottleWrap, { left: centerX - BAG_W / 2, top: BOTTLE_TOP }]}>
            <View style={styles.bag}>
              <Animated.View style={[styles.bottleFill, { height: bottleFillHeight }]} />
              <View style={styles.bottleLabelWrap} pointerEvents="none">
                <Text style={styles.bottleDonorText}>{donor}</Text>
              </View>
            </View>
          </View>

          {targets.map((t) => {
            const active = recipients.includes(t.key);
            return (
              <View
                key={`rec-${t.key}`}
                style={[
                  styles.recipient,
                  {
                    left: t.x - 52 / 2,
                    top: t.y - ICON_SIZE / 2 - 4,
                    width: 52,
                  },
                ]}
              >
                <View style={[styles.personShell, active && styles.personShellActive]}>
                  <Animated.View
                    style={[
                      styles.personBlood,
                      { height: humanFillByKey[t.key], opacity: active ? 1 : 0 },
                    ]}
                  />
                  <View style={styles.personIconLayer} pointerEvents="none">
                    <Ionicons
                      name="person"
                      size={16}
                      color={active ? '#ffffff' : 'rgba(100,116,139,0.85)'}
                    />
                  </View>
                </View>
                <Text
                  style={[styles.groupLabel, active ? styles.groupOn : styles.groupOff]}
                  numberOfLines={1}
                >
                  {t.key}
                </Text>
              </View>
            );
          })}
        </View>

        <View style={[styles.tipsSection, { maxWidth: STAGE_MAX_W, width: '100%' }]}>
          <View style={styles.tipsHeaderRow}>
            <View style={styles.tipsHeaderAccent} />
            <View style={{ flex: 1 }}>
              <Text style={styles.tipsSectionTitle}>
                রক্তের গ্রুপ — সংক্ষিপ্ত তথ্য ও পরামর্শ
              </Text>
              <Text style={styles.tipsSectionSub}>
                উপরের ছবিতে লাল টিউব ও লাল আইকনে যে গ্রুপগুলো সক্রিয়, সেই গ্রুপে এই দাতা রক্ত দিতে পারে। নিচের
                টিপস উপরের ব্যাগের গ্রুপ বদলের সঙ্গে সঙ্গে আপডেট হবে।
              </Text>
            </View>
          </View>

          <View style={styles.tipCard} key={currentBloodTip.key}>
            <Text style={styles.tipNowLabel}>
              এখনকার দাতা: <Text style={styles.tipNowValue}>{donor}</Text>
            </Text>
            <View style={styles.tipCardTop}>
              <View style={styles.tipBadge}>
                <Text style={styles.tipBadgeText}>{currentBloodTip.key}</Text>
              </View>
              <Text style={styles.tipCardTitle}>{currentBloodTip.title}</Text>
            </View>
            {currentBloodTip.lines.map((line, i) => (
              <Text key={i} style={styles.tipLine}>
                {line}
              </Text>
            ))}
          </View>

          <View style={styles.disclaimerCard}>
            <Ionicons name="information-circle-outline" size={18} color={RED.main} style={styles.disclaimerIcon} />
            <Text style={styles.disclaimerText}>
              চিকিৎসা সংক্রান্ত চূড়ান্ত সিদ্ধান্ত যোগ্য চিকিৎসক বা ব্লাড ব্যাংকের পরামর্শে নিন। এই অ্যাপের
              তথ্য শিক্ষণীয় ও সচেতনতার জন্য।
            </Text>
          </View>
        </View>
      </ScrollView>

      <BottomNav navigation={navigation} active="home" />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#ffffff' },
  scroll: { flex: 1 },
  headerRow: { flexDirection: 'row', alignItems: 'center' },
  backBtn: {
    width: 44,
    height: 44,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.16)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  headerTitle: { color: '#fff', fontSize: 20, fontWeight: '900' },
  headerSub: { color: 'rgba(255,255,255,0.85)', fontWeight: '700', marginTop: 2, fontSize: 12 },

  scrollContent: {
    paddingHorizontal: SCROLL_H_PAD,
    paddingTop: 16,
    alignItems: 'center',
  },
  tipsSection: {
    marginTop: 22,
    paddingHorizontal: 0,
  },
  tipsHeaderRow: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 16 },
  tipsHeaderAccent: {
    width: 4,
    borderRadius: 2,
    backgroundColor: RED.main,
    marginRight: 12,
    marginTop: 4,
    minHeight: 48,
  },
  tipsSectionTitle: {
    fontSize: 19,
    fontWeight: '900',
    color: '#0f172a',
    letterSpacing: -0.3,
    lineHeight: 26,
  },
  tipsSectionSub: {
    marginTop: 8,
    fontSize: 13.5,
    fontWeight: '600',
    color: '#64748b',
    lineHeight: 21,
  },
  tipNowLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#94a3b8',
    marginBottom: 12,
  },
  tipNowValue: {
    fontSize: 13,
    fontWeight: '900',
    color: RED.main,
  },
  tipCard: {
    width: '100%',
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(254,202,202,0.9)',
    shadowColor: '#7f1d1d',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 2,
  },
  tipCardTop: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 10 },
  tipBadge: {
    backgroundColor: 'rgba(220,38,38,0.12)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
    marginRight: 10,
  },
  tipBadgeText: {
    fontSize: 14,
    fontWeight: '900',
    color: RED.dark,
    letterSpacing: 0.5,
  },
  tipCardTitle: {
    flex: 1,
    fontSize: 15,
    fontWeight: '800',
    color: '#1e293b',
    lineHeight: 22,
  },
  tipLine: {
    fontSize: 14,
    fontWeight: '500',
    color: '#475569',
    lineHeight: 23,
    marginTop: 8,
  },
  disclaimerCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginTop: 8,
    marginBottom: 8,
    padding: 14,
    borderRadius: 14,
    backgroundColor: 'rgba(254,242,242,0.85)',
    borderWidth: 1,
    borderColor: 'rgba(252,165,165,0.5)',
  },
  disclaimerIcon: { marginRight: 10, marginTop: 2 },
  disclaimerText: {
    flex: 1,
    fontSize: 12.5,
    fontWeight: '600',
    color: '#7f1d1d',
    lineHeight: 19,
  },
  stageOuter: {
    height: STAGE_H,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: 'rgba(226,232,240,1)',
    backgroundColor: '#ffffff',
    overflow: 'hidden',
    alignSelf: 'center',
  },
  svgLayer: { zIndex: 0 },

  bottleWrap: {
    position: 'absolute',
    alignItems: 'center',
    zIndex: 2,
    elevation: 3,
  },
  bag: {
    width: BAG_W,
    height: BAG_H,
    borderWidth: 2,
    borderColor: '#dc2626',
    borderRadius: 14,
    overflow: 'hidden',
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(254,242,242,0.9)',
  },
  bottleFill: {
    width: '100%',
    backgroundColor: '#dc2626',
  },
  bottleLabelWrap: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2,
  },
  bottleDonorText: {
    fontSize: 20,
    fontWeight: '900',
    color: '#ffffff',
    letterSpacing: 0.5,
    textShadowColor: 'rgba(0,0,0,0.45)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },

  recipient: {
    position: 'absolute',
    flexDirection: 'column',
    alignItems: 'center',
    zIndex: 3,
  },
  personShell: {
    width: ICON_SIZE,
    height: ICON_SIZE,
    borderRadius: ICON_SIZE / 2,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(148,163,184,0.45)',
    backgroundColor: 'rgba(248,250,252,1)',
    justifyContent: 'flex-end',
  },
  personShellActive: {
    borderColor: 'rgba(220,38,38,0.45)',
  },
  personBlood: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    width: '100%',
    backgroundColor: '#dc2626',
  },
  personIconLayer: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2,
  },
  groupLabel: {
    marginTop: 6,
    fontSize: 12,
    fontWeight: '900',
    letterSpacing: 0.3,
  },
  groupOn: { color: RED.dark },
  groupOff: { color: 'rgba(100,116,139,0.75)' },
});
