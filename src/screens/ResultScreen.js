import { StatusBar } from 'expo-status-bar';
import { useMemo, useState } from 'react';
import { ActivityIndicator, Share, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { apiSearchResult } from '../api/result';
import { GREEN, NEUTRAL } from '../theme/colors';
import BottomNav from '../components/BottomNav';

function pick(v, fallback = '-') {
  if (v == null) return fallback;
  const s = String(v).trim();
  return s ? s : fallback;
}

function parseMarks(v) {
  if (v == null) return null;
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
}

function isClass3To5(instituteClass) {
  const s = String(instituteClass ?? '').trim().toLowerCase();
  const asNum = parseInt(s, 10);
  const c = Number.isFinite(asNum) ? String(asNum) : s;
  return c === '3' || c === '4' || c === '5' || c === 'three' || c === 'four' || c === 'five';
}

function getThresholds(instituteClass) {
  const totalMarks = isClass3To5(instituteClass) ? 45 : 100;
  const passThreshold = totalMarks * 0.4;
  const got70Threshold = totalMarks * (isClass3To5(instituteClass) ? 0.7 : 0.6);
  const vivaThreshold = totalMarks * 0.75;
  return { totalMarks, passThreshold, got70Threshold, vivaThreshold };
}

function toShareText(doc) {
  if (!doc) return '';
  const { totalMarks, passThreshold, got70Threshold, vivaThreshold } = getThresholds(doc?.instituteClass);
  const marks = parseMarks(doc.correctAnswer);
  const wrong = marks == null ? null : Math.max(0, totalMarks - marks);
  const percent = marks == null ? null : Math.round((marks / totalMarks) * 10000) / 100;
  const pass = marks != null && marks >= passThreshold;
  const got70 = marks != null && marks >= got70Threshold;
  const viva = marks != null && marks >= vivaThreshold;
  const lines = [
    'Darul Muttaquine Scholarship Result',
    '----------------------',
    `Roll: ${pick(doc.scholarshipRollNumber)}`,
    `Name: ${pick(doc.name)}`,
    `Institute: ${pick(doc.institute)}`,
    `Class: ${pick(doc.instituteClass)}`,
    `Total marks: ${totalMarks}`,
    `Obtained: ${marks != null ? marks : pick(doc.correctAnswer)}`,
    wrong != null ? `Wrong: ${wrong}` : null,
    percent != null ? `Percent: ${percent}%` : null,
    `Pass: ${pass ? 'Yes' : 'No'}`,
    `High score: ${got70 ? 'Yes' : 'No'}`,
    `Viva eligible: ${viva ? 'Yes' : 'No'}`,
    doc.vibaMarks != null ? `Viba Marks: ${pick(doc.vibaMarks)}` : null,
    doc.courseFund != null ? `Course Fund: ${pick(doc.courseFund)}` : null,
  ].filter(Boolean);
  return lines.join('\n');
}

export default function ResultScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const [roll, setRoll] = useState('');
  const [isBusy, setIsBusy] = useState(false);
  const [error, setError] = useState('');
  const [doc, setDoc] = useState(null);

  const canDownload = !!doc;

  const headerSubtitle = useMemo(() => {
    if (!doc) return 'Search by scholarship roll number to view results.';
    return `Showing result for roll ${pick(doc.scholarshipRollNumber)}`;
  }, [doc]);

  const onSearch = async () => {
    setError('');
    const scholarshipRollNumber = (roll || '').trim();
    if (!scholarshipRollNumber) {
      setError('Please enter scholarship roll number.');
      return;
    }
    setIsBusy(true);
    try {
      const res = await apiSearchResult({ scholarshipRollNumber });
      setDoc(res?.data || null);
      if (!res?.data) setError('Result not found.');
    } catch (e) {
      const msg =
        e?.data?.message ||
        e?.message ||
        'Failed to fetch result. Please try again.';
      setError(String(msg));
      setDoc(null);
    } finally {
      setIsBusy(false);
    }
  };

  const onDownload = async () => {
    if (!doc) return;
    const text = toShareText(doc);
    try {
      await Share.share({ message: text });
    } catch {
      // ignore
    }
  };

  return (
    <View style={styles.screen}>
      <StatusBar style="light" />

      <View style={styles.top}>
        <View style={styles.topBgBubble} />
        <View style={[styles.topInner, { paddingTop: Math.max(insets.top, 8) + 8 }]}>
          <View style={styles.topRow}>
            <TouchableOpacity style={styles.iconBtn} activeOpacity={0.7} onPress={() => navigation.goBack()}>
              <Ionicons name="chevron-back" size={22} color="#fff" />
            </TouchableOpacity>
            <Text style={styles.topTitle}>Results</Text>
            <View style={{ width: 44 }} />
          </View>

          <Text style={styles.heroTitle}>Scholarship Result</Text>
          <Text style={styles.heroSub}>{headerSubtitle}</Text>
        </View>
      </View>

      <View style={styles.sheet}>
        <View style={styles.actionsRow}>
          <TouchableOpacity style={styles.actionCard} activeOpacity={0.85} onPress={onSearch} disabled={isBusy}>
            <View style={styles.actionIcon}>
              <Ionicons name="eye-outline" size={18} color={GREEN.dark} />
            </View>
            <Text style={styles.actionTitle}>View Result</Text>
            <Text style={styles.actionSub}>Roll দিয়ে দেখুন</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionCard} activeOpacity={0.85} onPress={onSearch} disabled={isBusy}>
            <View style={styles.actionIcon}>
              <Ionicons name="search-outline" size={18} color={GREEN.dark} />
            </View>
            <Text style={styles.actionTitle}>Search Result</Text>
            <Text style={styles.actionSub}>দ্রুত খুঁজুন</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionCard, !canDownload && { opacity: 0.5 }]}
            activeOpacity={0.85}
            onPress={onDownload}
            disabled={!canDownload || isBusy}
          >
            <View style={styles.actionIcon}>
              <Ionicons name="download-outline" size={18} color={GREEN.dark} />
            </View>
            <Text style={styles.actionTitle}>Download</Text>
            <Text style={styles.actionSub}>Share/Export</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.searchBox}>
          <Ionicons name="barcode-outline" size={20} color={GREEN.dark} />
          <TextInput
            style={styles.searchInput}
            placeholder="শিক্ষাবৃত্তি রোল নম্বর লিখুন"
            placeholderTextColor={NEUTRAL.subtext}
            value={roll}
            onChangeText={setRoll}
            editable={!isBusy}
          />
          <TouchableOpacity style={styles.searchBtn} activeOpacity={0.85} onPress={onSearch} disabled={isBusy}>
            {isBusy ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Ionicons name="search" size={18} color="#fff" />
            )}
          </TouchableOpacity>
        </View>

        {!!error && <Text style={styles.errorText}>{error}</Text>}

        {!!doc && (() => {
          const { totalMarks } = getThresholds(doc?.instituteClass);
          const marks = parseMarks(doc?.correctAnswer);
          const wrong = marks == null ? null : Math.max(0, totalMarks - marks);
          const percent = marks == null ? null : Math.round((marks / totalMarks) * 10000) / 100;
          const progress = percent == null ? 0 : Math.max(0, Math.min(100, percent));

          return (
            <View style={styles.resultCard}>
              <View style={styles.scoreCard}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.scoreLabel}>Obtained marks</Text>
                  <View style={styles.scoreRow}>
                    <Text style={styles.scoreBig}>{marks != null ? String(marks) : '-'}</Text>
                    <Text style={styles.scoreOutOf}>/ {totalMarks}</Text>
                  </View>
                  <Text style={styles.scoreMeta}>
                    {wrong != null ? `Wrong: ${wrong}` : 'Wrong: -'}{percent != null ? `  •  ${percent}%` : ''}
                  </Text>
                </View>
                <View style={styles.scoreIcon}>
                  <Ionicons name="trophy-outline" size={22} color={GREEN.dark} />
                </View>
              </View>

              <View style={styles.progressTrack}>
                <View style={[styles.progressFill, { width: `${progress}%` }]} />
              </View>

              <View style={styles.kvRow}>
                <Text style={styles.kLabel}>Name</Text>
                <Text style={styles.kValue}>{pick(doc?.name || doc?.studentName || doc?.fullName)}</Text>
              </View>
              <View style={styles.kvRow}>
                <Text style={styles.kLabel}>Institute</Text>
                <Text style={styles.kValue}>{pick(doc?.institute)}</Text>
              </View>
              <View style={styles.kvRow}>
                <Text style={styles.kLabel}>Class</Text>
                <Text style={styles.kValue}>{pick(doc?.instituteClass)}</Text>
              </View>
              <View style={styles.kvRow}>
                <Text style={styles.kLabel}>Roll</Text>
                <Text style={styles.kValue}>{pick(doc?.scholarshipRollNumber)}</Text>
              </View>

              <TouchableOpacity style={styles.shareBtn} activeOpacity={0.85} onPress={onDownload}>
                <Ionicons name="share-outline" size={18} color="#fff" />
                <Text style={styles.shareText}>Download Result</Text>
              </TouchableOpacity>
            </View>
          );
        })()}
        <View style={{ height: 18 }} />
      </View>
      <BottomNav navigation={navigation} active="results" />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: GREEN.bg },
  top: {
    height: 220,
    backgroundColor: GREEN.dark,
    overflow: 'hidden',
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
  },
  topBgBubble: {
    position: 'absolute',
    width: 280,
    height: 280,
    borderRadius: 140,
    backgroundColor: 'rgba(34,197,94,0.28)',
    top: -120,
    right: -90,
  },
  topInner: { flex: 1, paddingHorizontal: 20 },
  topRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  iconBtn: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.16)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.22)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  topTitle: { color: '#fff', fontWeight: '900', fontSize: 18 },
  heroTitle: { marginTop: 16, fontSize: 22, fontWeight: '900', color: '#fff' },
  heroSub: { marginTop: 8, fontSize: 13, lineHeight: 18, fontWeight: '700', color: 'rgba(234,255,240,0.9)', maxWidth: 340 },

  sheet: {
    flex: 1,
    marginTop: -18,
    backgroundColor: '#fff',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingTop: 18,
    paddingHorizontal: 20,
  },
  actionsRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 14, marginTop: 4 },
  actionCard: {
    width: '31.5%',
    borderRadius: 18,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: GREEN.pale,
    padding: 12,
  },
  actionIcon: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: GREEN.pale,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  actionTitle: { fontSize: 12, fontWeight: '900', color: GREEN.dark },
  actionSub: { fontSize: 11, fontWeight: '700', color: NEUTRAL.subtext, marginTop: 2 },

  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: GREEN.bg,
    borderRadius: 18,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: GREEN.pale,
  },
  searchInput: { flex: 1, marginLeft: 10, fontSize: 15, color: GREEN.dark, paddingVertical: 0 },
  searchBtn: {
    width: 40,
    height: 40,
    borderRadius: 14,
    backgroundColor: GREEN.dark,
    alignItems: 'center',
    justifyContent: 'center',
  },
  errorText: { marginTop: 10, color: '#b91c1c', fontWeight: '800', fontSize: 12 },

  resultCard: {
    marginTop: 14,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: GREEN.pale,
    backgroundColor: '#fff',
    padding: 14,
  },
  scoreCard: {
    borderRadius: 18,
    borderWidth: 1,
    borderColor: GREEN.pale,
    backgroundColor: GREEN.bg,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  scoreLabel: { fontSize: 12, fontWeight: '900', color: GREEN.dark, opacity: 0.9 },
  scoreRow: { flexDirection: 'row', alignItems: 'flex-end', marginTop: 6 },
  scoreBig: { fontSize: 32, fontWeight: '900', color: GREEN.dark, lineHeight: 34 },
  scoreOutOf: { fontSize: 14, fontWeight: '900', color: NEUTRAL.subtext, marginLeft: 8, marginBottom: 4 },
  scoreMeta: { marginTop: 6, fontSize: 12, fontWeight: '800', color: NEUTRAL.subtext },
  scoreIcon: {
    width: 44,
    height: 44,
    borderRadius: 16,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: GREEN.pale,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 12,
  },
  progressTrack: {
    height: 10,
    borderRadius: 999,
    backgroundColor: '#e2e8f0',
    overflow: 'hidden',
    marginBottom: 10,
  },
  progressFill: { height: '100%', backgroundColor: GREEN.main, borderRadius: 999 },
  kvRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: '#f1f5f9' },
  kLabel: { fontSize: 12, fontWeight: '800', color: NEUTRAL.subtext },
  kValue: { fontSize: 12, fontWeight: '900', color: '#0f172a', maxWidth: '62%', textAlign: 'right' },
  shareBtn: {
    marginTop: 14,
    height: 46,
    borderRadius: 16,
    backgroundColor: GREEN.dark,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  shareText: { color: '#fff', fontWeight: '900', marginLeft: 10 },
});

