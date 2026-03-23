import { StatusBar } from 'expo-status-bar';
import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Image,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { GREEN, NEUTRAL } from '../theme/colors';
import { useAuth } from '../context/AuthContext';
import {
  apiGetAllQuizzes,
  extractQuizId,
  fetchSubmissionStatusByQuizIds,
  getQuizListState,
} from '../api/quiz';
import BottomNav from '../components/BottomNav';

const QUIZ_ICON = require('../../assets/quize-icon.png');

export default function QuizListScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const { token, me } = useAuth();
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');
  /** @type {Record<string, { submitted: boolean; marks: number | null }>} */
  const [subByQuiz, setSubByQuiz] = useState({});

  const meKey = useMemo(
    () =>
      `${me?.phone || ''}|${normEmail(me?.email)}|${me?.uniqueId ?? me?._id ?? me?.id ?? ''}`,
    [me?.phone, me?.email, me?.uniqueId, me?._id, me?.id]
  );

  const load = useCallback(async () => {
    setError('');
    try {
      const data = await apiGetAllQuizzes(token);
      setList(Array.isArray(data) ? data : []);
    } catch (e) {
      setError(e?.message || 'Could not load quizzes.');
      setList([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [token]);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    if (loading || !list.length) return;
    let cancelled = false;
    (async () => {
      const ids = list.map((q) => extractQuizId(q)).filter(Boolean);
      try {
        const map = await fetchSubmissionStatusByQuizIds(ids, me, token);
        if (!cancelled) setSubByQuiz(map);
      } catch {
        if (!cancelled) setSubByQuiz({});
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [list, loading, meKey, token, me]);

  const onRefresh = () => {
    setRefreshing(true);
    load();
  };

  return (
    <View style={styles.screen}>
      <StatusBar style="light" />

      <View style={[styles.hero, { paddingTop: Math.max(insets.top, 6) + 4 }]}>
        <View style={styles.heroBubble} />
        <View style={styles.heroTopRow}>
          <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()} activeOpacity={0.75}>
            <Ionicons name="chevron-back" size={22} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.heroTitle} numberOfLines={1}>
            DMF QUIZE
          </Text>
          <View style={styles.heroTopSpacer} />
        </View>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={GREEN.main} />}
      >
        {loading ? (
          <View style={styles.centerBox}>
            <ActivityIndicator size="large" color={GREEN.main} />
            <Text style={styles.hint}>Loading quizzes…</Text>
          </View>
        ) : error ? (
          <View style={styles.errorCard}>
            <Ionicons name="cloud-offline-outline" size={32} color="#b91c1c" />
            <Text style={styles.errorText}>{error}</Text>
            <TouchableOpacity style={styles.retryBtn} onPress={load} activeOpacity={0.85}>
              <Text style={styles.retryText}>Try again</Text>
            </TouchableOpacity>
          </View>
        ) : list.length === 0 ? (
          <View style={styles.emptyCard}>
            <Ionicons name="document-text-outline" size={40} color={GREEN.main} />
            <Text style={styles.emptyTitle}>No quizzes yet</Text>
            <Text style={styles.emptySub}>Check back soon for new challenges.</Text>
          </View>
        ) : (
          list.map((q, qi) => {
            const id = extractQuizId(q);
            const { playable, statusLabel } = getQuizListState(q);
            const qCount = Array.isArray(q?.quizQuestions) ? q.quizQuestions.length : 0;
            const duration = q?.duration != null ? `${q.duration} min` : '—';
            const sub = id ? subByQuiz[id] : null;
            const submitted = !!sub?.submitted;
            const marks = sub?.marks;
            const canStart = playable && !submitted && !!id;

            return (
              <View key={id || `quiz-row-${qi}`} style={styles.card}>
                  <View style={styles.cardTop}>
                    <View style={styles.cardIconWrap}>
                      <Image source={QUIZ_ICON} style={styles.cardIconImg} resizeMode="contain" />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.cardTitle} numberOfLines={2}>
                        {q?.quizName || 'Untitled quiz'}
                      </Text>
                      <View style={styles.metaRow}>
                        <View style={styles.metaChip}>
                          <Ionicons name="help-circle-outline" size={12} color={GREEN.main} />
                          <Text style={styles.metaChipText}>{qCount} questions</Text>
                        </View>
                        <View style={styles.metaChip}>
                          <Ionicons name="time-outline" size={12} color={GREEN.main} />
                          <Text style={styles.metaChipText}>{duration}</Text>
                        </View>
                      </View>
                    </View>
                    <View
                      style={[
                        styles.statusPill,
                        submitted && styles.statusPillDone,
                        !playable && !submitted && styles.statusPillOff,
                      ]}
                    >
                      <Text
                        style={[
                          styles.statusPillText,
                          submitted && styles.statusPillTextDone,
                          !playable && !submitted && styles.statusPillTextOff,
                        ]}
                      >
                        {submitted ? 'Done' : statusLabel}
                      </Text>
                    </View>
                  </View>

                  {submitted && (
                    <View style={styles.scoreBanner}>
                      <View style={styles.scoreBannerIcon}>
                        <Ionicons name="trophy" size={16} color="#a16207" />
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text style={styles.scoreBannerBn}>আপনার মার্কস</Text>
                        <Text style={styles.scoreBannerEn}>Your score</Text>
                      </View>
                      <Text style={styles.scoreBannerMarks}>
                        {marks != null && Number.isFinite(marks) ? `${marks}` : '—'}
                      </Text>
                      <Text style={styles.scoreBannerUnit}>marks</Text>
                    </View>
                  )}

                  <View style={styles.cardActions}>
                    {submitted ? (
                      <View>
                        <View style={styles.submittedBadge}>
                          <Ionicons name="checkmark-circle" size={18} color={GREEN.dark} />
                          <View style={{ flex: 1 }}>
                            <Text style={styles.submittedTitleBn}>ইতিমধ্যে জমা দেওয়া</Text>
                            <Text style={styles.submittedTitleEn}>Already submitted</Text>
                          </View>
                        </View>
                        <TouchableOpacity
                          style={[styles.leaderboardFullBtn, { marginTop: 12 }]}
                          activeOpacity={0.85}
                          onPress={() => navigation.navigate('QuizLeaderboard', { quizId: id, quizName: q?.quizName })}
                        >
                          <Ionicons name="podium" size={17} color="#fff" />
                          <Text style={styles.leaderboardFullBtnText}>Leaderboard</Text>
                          <Ionicons name="chevron-forward" size={16} color="rgba(255,255,255,0.9)" />
                        </TouchableOpacity>
                      </View>
                    ) : (
                      <>
                        <TouchableOpacity
                          style={[styles.primaryBtn, !canStart && styles.primaryBtnDisabled]}
                          disabled={!canStart}
                          activeOpacity={0.85}
                          onPress={() =>
                            navigation.navigate('QuizPrep', {
                              quizId: id,
                              quizName: q?.quizName,
                              questionCount: qCount,
                              durationMin: Number(q?.duration),
                            })
                          }
                        >
                          <Ionicons name="play" size={16} color="#fff" />
                          <Text style={styles.primaryBtnText}>Start quiz</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                          style={styles.secondaryBtn}
                          activeOpacity={0.85}
                          onPress={() => navigation.navigate('QuizLeaderboard', { quizId: id, quizName: q?.quizName })}
                        >
                          <Ionicons name="podium-outline" size={16} color={GREEN.dark} />
                          <Text style={styles.secondaryBtnText}>Board</Text>
                        </TouchableOpacity>
                      </>
                    )}
                  </View>
              </View>
            );
          })
        )}
        <View style={{ height: 100 }} />
      </ScrollView>

      <BottomNav navigation={navigation} active="home" />
    </View>
  );
}

function normEmail(e) {
  return e == null ? '' : String(e).trim().toLowerCase();
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#e8faf0' },
  hero: {
    paddingBottom: 12,
    paddingHorizontal: 16,
    backgroundColor: GREEN.dark,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    overflow: 'hidden',
  },
  heroBubble: {
    position: 'absolute',
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: 'rgba(34,197,94,0.18)',
    top: -60,
    right: -40,
  },
  heroTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    position: 'relative',
    zIndex: 1,
  },
  heroTopSpacer: { width: 36 },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.14)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroTitle: {
    flex: 1,
    textAlign: 'center',
    fontSize: 17,
    fontWeight: '900',
    color: '#fff',
    letterSpacing: 0.8,
  },
  scroll: { flex: 1 },
  scrollContent: { paddingHorizontal: 16, paddingTop: 12 },
  centerBox: { paddingVertical: 48, alignItems: 'center' },
  hint: { marginTop: 12, color: NEUTRAL.subtext, fontWeight: '600' },
  errorCard: {
    backgroundColor: '#fef2f2',
    borderRadius: 20,
    padding: 22,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#fecaca',
  },
  errorText: { marginTop: 10, color: '#b91c1c', fontWeight: '700', textAlign: 'center' },
  retryBtn: {
    marginTop: 14,
    backgroundColor: GREEN.dark,
    paddingHorizontal: 22,
    paddingVertical: 12,
    borderRadius: 14,
  },
  retryText: { color: '#fff', fontWeight: '800' },
  emptyCard: {
    backgroundColor: '#fff',
    borderRadius: 22,
    padding: 32,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#d1fae5',
    shadowColor: '#166534',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.06,
    shadowRadius: 16,
    elevation: 3,
  },
  emptyTitle: { marginTop: 12, fontSize: 18, fontWeight: '900', color: GREEN.dark },
  emptySub: { marginTop: 6, color: NEUTRAL.subtext, fontWeight: '600', textAlign: 'center' },
  card: {
    marginBottom: 10,
    borderRadius: 14,
    backgroundColor: '#fff',
    shadowColor: '#0f172a',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.07,
    shadowRadius: 10,
    elevation: 3,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  cardTop: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, paddingVertical: 10 },
  cardIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#f0fdf4',
    borderWidth: 1,
    borderColor: '#bbf7d0',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  cardIconImg: { width: 26, height: 26 },
  cardTitle: { fontSize: 14, fontWeight: '900', color: '#0f172a', lineHeight: 19 },
  metaRow: { flexDirection: 'row', flexWrap: 'wrap', marginTop: 6 },
  metaChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0fdf4',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    marginRight: 6,
    marginBottom: 2,
    borderWidth: 1,
    borderColor: '#dcfce7',
  },
  metaChipText: { marginLeft: 4, fontSize: 10, fontWeight: '800', color: GREEN.dark },
  statusPill: {
    backgroundColor: '#bbf7d0',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  statusPillDone: { backgroundColor: '#d1fae5', borderWidth: 1, borderColor: '#6ee7b7' },
  statusPillOff: { backgroundColor: '#e2e8f0' },
  statusPillText: { fontSize: 9, fontWeight: '900', color: GREEN.dark },
  statusPillTextDone: { color: '#047857' },
  statusPillTextOff: { color: '#64748b' },
  scoreBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 10,
    marginBottom: 2,
    paddingVertical: 8,
    paddingHorizontal: 10,
    backgroundColor: '#fffbeb',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#fde68a',
  },
  scoreBannerIcon: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: '#fef3c7',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  scoreBannerBn: { fontSize: 11, fontWeight: '900', color: '#92400e' },
  scoreBannerEn: { fontSize: 9, fontWeight: '600', color: '#b45309', marginTop: 1 },
  scoreBannerMarks: { fontSize: 20, fontWeight: '900', color: '#a16207', marginRight: 3 },
  scoreBannerUnit: { fontSize: 10, fontWeight: '800', color: '#b45309', alignSelf: 'flex-end', paddingBottom: 2 },
  cardActions: {
    paddingHorizontal: 10,
    paddingBottom: 10,
    paddingTop: 4,
  },
  submittedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0fdf4',
    padding: 8,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#bbf7d0',
  },
  submittedTitleBn: { fontSize: 12, fontWeight: '900', color: GREEN.dark },
  submittedTitleEn: { fontSize: 10, fontWeight: '700', color: NEUTRAL.subtext, marginTop: 1 },
  leaderboardFullBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: GREEN.dark,
    paddingVertical: 10,
    borderRadius: 12,
    paddingHorizontal: 12,
  },
  leaderboardFullBtnText: { flex: 1, marginLeft: 8, color: '#fff', fontWeight: '900', fontSize: 13 },
  primaryBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: GREEN.main,
    paddingVertical: 10,
    borderRadius: 12,
    marginRight: 8,
    shadowColor: GREEN.main,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 2,
  },
  primaryBtnDisabled: { backgroundColor: '#94a3b8', shadowOpacity: 0 },
  primaryBtnText: { color: '#fff', fontWeight: '900', fontSize: 13, marginLeft: 6 },
  secondaryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
    borderWidth: 1.5,
    borderColor: '#86efac',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 12,
  },
  secondaryBtnText: { marginLeft: 4, fontWeight: '900', fontSize: 12, color: GREEN.dark },
});
