import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { apiGetQuizById } from '../api/quiz';
import { useAuth } from '../context/AuthContext';
import { GREEN, NEUTRAL } from '../theme/colors';

function RuleLine({ children, danger, icon }) {
  return (
    <View style={[styles.ruleRow, danger && styles.ruleRowDanger]}>
      {icon ? <Text style={styles.ruleIcon}>{icon}</Text> : <View style={styles.ruleBullet} />}
      <Text style={[styles.ruleText, danger && styles.ruleTextDanger]}>{children}</Text>
    </View>
  );
}

export default function QuizPrepScreen({ navigation, route }) {
  const insets = useSafeAreaInsets();
  const { token } = useAuth();
  const { quizId, quizName: nameParam, questionCount, durationMin } = route.params || {};

  const [resolvedName, setResolvedName] = useState(nameParam || '');
  const [resolvedCount, setResolvedCount] = useState(questionCount);
  const [resolvedDur, setResolvedDur] = useState(durationMin);
  const [loadingMeta, setLoadingMeta] = useState(false);

  useEffect(() => {
    let cancelled = false;
    if (!quizId) return undefined;
    const hasCount = Number.isFinite(Number(questionCount)) && Number(questionCount) > 0;
    const hasDur = Number.isFinite(Number(durationMin)) && Number(durationMin) > 0;
    const hasName = !!(nameParam && String(nameParam).trim());
    if (hasCount && hasDur && hasName) return undefined;

    (async () => {
      setLoadingMeta(true);
      try {
        const data = await apiGetQuizById(quizId, token);
        if (cancelled) return;
        if (data?.quizName) setResolvedName((n) => (n && String(n).trim() ? n : data.quizName));
        const qc = Array.isArray(data?.quizQuestions) ? data.quizQuestions.length : 0;
        if (qc > 0) setResolvedCount(qc);
        const d = Number(data?.duration);
        if (Number.isFinite(d) && d > 0) setResolvedDur(d);
      } catch {
        /* keep route params */
      } finally {
        if (!cancelled) setLoadingMeta(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [quizId, token, questionCount, durationMin, nameParam]);

  const qCount = Number(resolvedCount);
  const hasCount = Number.isFinite(qCount) && qCount >= 0;
  const dur = Number(resolvedDur);
  const hasDur = Number.isFinite(dur) && dur > 0;
  const whole = hasDur ? Math.floor(dur) : 0;
  const frac = hasDur ? Math.round((dur % 1) * 100) : 0;
  const timeLabel = hasDur
    ? `${String(whole).padStart(2, '0')}.${String(frac).padStart(2, '0')}`
    : '—';

  const onStart = () => {
    if (!quizId) return;
    navigation.replace('QuizPlay', { quizId, quizName: resolvedName || nameParam });
  };

  return (
    <View style={styles.screen}>
      <StatusBar style="dark" />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[styles.scrollContent, { paddingTop: Math.max(insets.top, 10) + 8, paddingBottom: 120 }]}
        showsVerticalScrollIndicator={false}
      >
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()} activeOpacity={0.75}>
          <Ionicons name="chevron-back" size={22} color={GREEN.dark} />
        </TouchableOpacity>

        <Text style={styles.titleBn}>কুইজটি শুরু করতে প্রস্তুত?</Text>
        <Text style={styles.titleEn}>Ready to start the quiz?</Text>

        {loadingMeta && (
          <View style={styles.metaLoading}>
            <ActivityIndicator size="small" color={GREEN.main} />
          </View>
        )}

        {!!resolvedName && (
          <Text style={styles.quizName} numberOfLines={2}>
            {resolvedName}
          </Text>
        )}

        <View style={styles.card}>
          <Ionicons name="help-circle-outline" size={22} color={GREEN.main} style={styles.cardIcon} />
          <View style={{ flex: 1 }}>
            <Text style={styles.cardLabelBn}>মোট প্রশ্ন</Text>
            <Text style={styles.cardValue}>{hasCount ? qCount : '—'}</Text>
            <Text style={styles.cardHintEn}>Total questions</Text>
          </View>
        </View>

        <View style={styles.card}>
          <Ionicons name="time-outline" size={22} color={GREEN.main} style={styles.cardIcon} />
          <View style={{ flex: 1 }}>
            <Text style={styles.cardLabelBn}>সময়সীমা</Text>
            <Text style={styles.cardValue}>{hasDur ? `${timeLabel} মিনিট` : '—'}</Text>
            <Text style={styles.cardHintEn}>Time limit (minutes)</Text>
          </View>
        </View>

        <View style={styles.rulesCard}>
          <Text style={styles.rulesTitleBn}>নিয়ম</Text>
          <Text style={styles.rulesTitleEn}>Guidelines</Text>

          <RuleLine>এই কুইজে আপনি শুধুমাত্র একবার অংশগ্রহণ করতে পারবেন। / You can join this quiz only once.</RuleLine>
          <RuleLine>সময় শেষ হলে উত্তর স্বয়ংক্রিয়ভাবে জমা হবে। / Answers submit automatically when time runs out.</RuleLine>
          <RuleLine>অ্যাপ বন্ধ করলে বা পিছনে গেলে আপনার অগ্রগতি হারিয়ে যেতে পারে—সময়মতো জমা দিন। / Leaving the quiz may lose progress—submit on time.</RuleLine>
          <RuleLine>অ্যাপ রিফ্রেশ বা লগআউট করলে অগ্রগতি মুছে যেতে পারে। / Refreshing or logging out may clear progress.</RuleLine>
          <RuleLine danger icon="⚠️">
            অন্য অ্যাপে যাওয়া বা বিভ্রান্তিকর আচরণ আপনার চেষ্টাকে অবৈধ ধরা হতে পারে। / Switching away may be treated as ending your attempt.
          </RuleLine>
          <RuleLine danger icon="🚫">
            স্ক্রিনশট বা রেকর্ডিং নীতিমালা লঙ্ঘন হতে পারে। / Screenshots or recordings may violate policy.
          </RuleLine>
        </View>
      </ScrollView>

      <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom, 16) }]}>
        <TouchableOpacity style={styles.startBtn} onPress={onStart} activeOpacity={0.88} disabled={!quizId}>
          <Ionicons name="document-text-outline" size={22} color="#fff" style={styles.startIcon} />
          <View style={styles.startBtnTextWrap}>
            <Text style={styles.startBtnBn}>কুইজ শুরু করুন</Text>
            <Text style={styles.startBtnEn}>Start quiz</Text>
          </View>
          <Ionicons name="arrow-forward" size={20} color="rgba(255,255,255,0.9)" />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#e8faf0' },
  scroll: { flex: 1 },
  scrollContent: { paddingHorizontal: 20 },
  backBtn: {
    width: 42,
    height: 42,
    borderRadius: 14,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#bbf7d0',
  },
  titleBn: {
    fontSize: 22,
    fontWeight: '900',
    color: GREEN.dark,
    textAlign: 'center',
    lineHeight: 30,
  },
  titleEn: {
    marginTop: 6,
    fontSize: 15,
    fontWeight: '700',
    color: NEUTRAL.subtext,
    textAlign: 'center',
  },
  quizName: {
    marginTop: 14,
    fontSize: 15,
    fontWeight: '800',
    color: GREEN.main,
    textAlign: 'center',
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 18,
    padding: 16,
    marginTop: 14,
    borderWidth: 1,
    borderColor: '#d1fae5',
    shadowColor: '#166534',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 2,
  },
  cardIcon: { marginRight: 14 },
  cardLabelBn: { fontSize: 13, fontWeight: '800', color: NEUTRAL.subtext },
  cardValue: { fontSize: 20, fontWeight: '900', color: NEUTRAL.text, marginTop: 4 },
  cardHintEn: { fontSize: 12, fontWeight: '600', color: '#94a3b8', marginTop: 2 },
  rulesCard: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 18,
    marginTop: 18,
    borderWidth: 1,
    borderColor: '#d1fae5',
  },
  rulesTitleBn: { fontSize: 18, fontWeight: '900', color: GREEN.dark },
  rulesTitleEn: { fontSize: 13, fontWeight: '700', color: GREEN.main, marginTop: 2, marginBottom: 14 },
  ruleRow: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 12 },
  ruleRowDanger: { backgroundColor: '#fff1f2', marginHorizontal: -6, paddingHorizontal: 6, paddingVertical: 8, borderRadius: 12 },
  ruleBullet: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: GREEN.main,
    marginTop: 6,
    marginRight: 10,
  },
  ruleIcon: { fontSize: 16, marginRight: 8, marginTop: 2 },
  ruleText: { flex: 1, fontSize: 13, fontWeight: '600', color: NEUTRAL.text, lineHeight: 20 },
  ruleTextDanger: { color: '#b91c1c', fontWeight: '700' },
  footer: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: 20,
    paddingTop: 12,
    backgroundColor: 'rgba(232,250,240,0.96)',
    borderTopWidth: 1,
    borderTopColor: '#bbf7d0',
  },
  metaLoading: { alignItems: 'center', marginTop: 8 },
  startBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#0f766e',
    paddingVertical: 16,
    paddingHorizontal: 22,
    borderRadius: 16,
  },
  startIcon: { marginRight: 12 },
  startBtnTextWrap: { flex: 1 },
  startBtnBn: { color: '#fff', fontSize: 17, fontWeight: '900' },
  startBtnEn: { color: 'rgba(255,255,255,0.88)', fontSize: 12, fontWeight: '700', marginTop: 2 },
});
