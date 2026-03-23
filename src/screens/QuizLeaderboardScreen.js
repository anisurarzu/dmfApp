import { StatusBar } from 'expo-status-bar';
import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Image,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { GREEN, NEUTRAL } from '../theme/colors';
import { useAuth } from '../context/AuthContext';
import { apiGetQuizResults, quizResultMatchesUser } from '../api/quiz';
import BottomNav from '../components/BottomNav';

function rankStyle(rank) {
  if (rank === 1) return { bg: '#fffbeb', border: '#facc15', icon: 'trophy', c: '#a16207', ring: '#fde047' };
  if (rank === 2) return { bg: '#f8fafc', border: '#94a3b8', icon: 'medal-outline', c: '#475569', ring: '#cbd5e1' };
  if (rank === 3) return { bg: '#fff7ed', border: '#fb923c', icon: 'medal-outline', c: '#c2410c', ring: '#fdba74' };
  return { bg: '#ffffff', border: '#e2e8f0', icon: null, c: GREEN.dark, ring: '#dcfce7' };
}

export default function QuizLeaderboardScreen({ navigation, route }) {
  const { quizId, quizName } = route.params || {};
  const insets = useSafeAreaInsets();
  const { token, me } = useAuth();
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    if (!quizId) {
      setError('Missing quiz.');
      setLoading(false);
      return;
    }
    setError('');
    try {
      const data = await apiGetQuizResults(quizId, token);
      const list = Array.isArray(data) ? [...data] : [];
      list.sort((a, b) => {
        const ma = Number(a?.totalMarks) || 0;
        const mb = Number(b?.totalMarks) || 0;
        if (mb !== ma) return mb - ma;
        const ta = Number(a?.answerTime) || 999999;
        const tb = Number(b?.answerTime) || 999999;
        return ta - tb;
      });
      setRows(list);
    } catch (e) {
      setError(e?.message || 'Could not load leaderboard.');
      setRows([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [quizId, token]);

  useEffect(() => {
    load();
  }, [load]);

  const sorted = useMemo(() => rows, [rows]);

  const myRankInfo = useMemo(() => {
    const idx = sorted.findIndex((r) => quizResultMatchesUser(r, me));
    if (idx < 0) return null;
    return {
      rank: idx + 1,
      marks: sorted[idx]?.totalMarks != null ? Number(sorted[idx].totalMarks) : null,
    };
  }, [sorted, me]);

  const renderItem = ({ item, index }) => {
    const rank = index + 1;
    const rs = rankStyle(rank);
    const timeSec = item?.answerTime != null ? Number(item.answerTime) : null;
    const timeLabel =
      timeSec != null && Number.isFinite(timeSec)
        ? `${Math.floor(timeSec / 60)}m ${timeSec % 60}s`
        : '—';
    const isMe = quizResultMatchesUser(item, me);

    return (
      <View
        style={[
          styles.row,
          { backgroundColor: rs.bg, borderColor: isMe ? GREEN.main : rs.border },
          isMe && styles.rowMe,
        ]}
      >
        <View style={[styles.rankRing, { borderColor: rs.ring }]}>
          <Text style={[styles.rankNum, { color: rs.c }]}>{rank}</Text>
          {rs.icon ? <Ionicons name={rs.icon} size={13} color={rs.c} style={{ marginTop: 1 }} /> : null}
        </View>
        {item?.image ? (
          <Image source={{ uri: item.image }} style={styles.avatar} />
        ) : (
          <View style={[styles.avatarPh, isMe && styles.avatarPhMe]}>
            <Text style={styles.avatarPhText}>{(item?.name || '?')[0]?.toUpperCase()}</Text>
          </View>
        )}
        <View style={{ flex: 1 }}>
          <View style={styles.nameRow}>
            <Text style={styles.name} numberOfLines={1}>
              {item?.name || 'Participant'}
            </Text>
            {isMe && (
              <View style={styles.youPill}>
                <Text style={styles.youPillText}>You</Text>
              </View>
            )}
          </View>
          <Text style={styles.sub} numberOfLines={1}>
            {timeLabel} • {item?.totalMarks ?? 0} marks
          </Text>
        </View>
        <View style={[styles.marksPill, rank <= 3 && styles.marksPillTop]}>
          <Text style={styles.marksText}>{item?.totalMarks ?? 0}</Text>
        </View>
      </View>
    );
  };

  const ListHeader = useMemo(
    () => (
      <View style={styles.statsWrap}>
        <View style={styles.statsCard}>
          <View style={styles.statItem}>
            <Ionicons name="people" size={17} color={GREEN.main} />
            <Text style={styles.statVal}>{sorted.length}</Text>
            <Text style={styles.statLab}>Participants</Text>
          </View>
          <View style={styles.statVline} />
          <View style={styles.statItem}>
            <Ionicons name="podium-outline" size={17} color={GREEN.dark} />
            <Text style={styles.statVal}>{sorted.length ? `#${myRankInfo?.rank ?? '—'}` : '—'}</Text>
            <Text style={styles.statLab}>Your rank</Text>
          </View>
          <View style={styles.statVline} />
          <View style={styles.statItem}>
            <Ionicons name="star" size={17} color="#ca8a04" />
            <Text style={styles.statVal}>
              {myRankInfo?.marks != null && Number.isFinite(myRankInfo.marks) ? myRankInfo.marks : '—'}
            </Text>
            <Text style={styles.statLab}>Your marks</Text>
          </View>
        </View>
        <Text style={styles.listSectionTitle}>Rankings</Text>
      </View>
    ),
    [sorted.length, myRankInfo]
  );

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
            Leaderboard
          </Text>
          <View style={styles.heroTopSpacer} />
        </View>
        {!!quizName && (
          <Text style={styles.heroQuizName} numberOfLines={1}>
            {quizName}
          </Text>
        )}
      </View>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={GREEN.main} />
          <Text style={styles.hint}>Loading results…</Text>
        </View>
      ) : error ? (
        <View style={styles.center}>
          <Ionicons name="alert-circle-outline" size={40} color="#b91c1c" />
          <Text style={styles.err}>{error}</Text>
          <TouchableOpacity style={styles.retry} onPress={load}>
            <Text style={styles.retryText}>Retry</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={sorted}
          keyExtractor={(item, i) => `${item?.userId ?? i}-${i}`}
          renderItem={renderItem}
          ListHeaderComponent={ListHeader}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => {
                setRefreshing(true);
                load();
              }}
              tintColor={GREEN.main}
            />
          }
          ListEmptyComponent={
            <View style={styles.empty}>
              <View style={styles.emptyIconWrap}>
                <Ionicons name="podium-outline" size={32} color={GREEN.main} />
              </View>
              <Text style={styles.emptyTitle}>No submissions yet</Text>
              <Text style={styles.emptySub}>Be the first to complete this quiz.</Text>
              <TouchableOpacity style={styles.playCta} onPress={() => navigation.navigate('QuizPrep', { quizId, quizName })}>
                <Text style={styles.playCtaText}>Take quiz</Text>
                <Ionicons name="arrow-forward" size={16} color="#fff" style={{ marginLeft: 6 }} />
              </TouchableOpacity>
            </View>
          }
        />
      )}

      <BottomNav navigation={navigation} active="home" />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#e8faf0' },
  hero: {
    paddingBottom: 10,
    paddingHorizontal: 16,
    backgroundColor: GREEN.dark,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    overflow: 'hidden',
  },
  heroBubble: {
    position: 'absolute',
    width: 130,
    height: 130,
    borderRadius: 65,
    backgroundColor: 'rgba(34,197,94,0.18)',
    top: -55,
    right: -35,
  },
  heroTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
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
    letterSpacing: 0.3,
  },
  heroQuizName: {
    marginTop: 6,
    fontSize: 11,
    fontWeight: '700',
    color: 'rgba(234,255,240,0.85)',
    textAlign: 'center',
    paddingHorizontal: 8,
  },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 },
  hint: { marginTop: 10, color: NEUTRAL.subtext, fontWeight: '600' },
  err: { marginTop: 10, color: '#b91c1c', fontWeight: '700', textAlign: 'center' },
  retry: { marginTop: 16, backgroundColor: GREEN.main, paddingHorizontal: 22, paddingVertical: 12, borderRadius: 14 },
  retryText: { color: '#fff', fontWeight: '900' },
  listContent: { paddingHorizontal: 14, paddingBottom: 100 },
  statsWrap: { marginBottom: 4 },
  statsCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 8,
    marginTop: 2,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    shadowColor: '#0f172a',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  statItem: { flex: 1, alignItems: 'center' },
  statVal: { marginTop: 4, fontSize: 14, fontWeight: '900', color: '#0f172a' },
  statLab: { marginTop: 1, fontSize: 9, fontWeight: '700', color: NEUTRAL.subtext, textAlign: 'center' },
  statVline: { width: 1, height: 32, backgroundColor: '#e2e8f0' },
  listSectionTitle: {
    marginTop: 10,
    marginBottom: 6,
    marginLeft: 2,
    fontSize: 12,
    fontWeight: '900',
    color: GREEN.dark,
    letterSpacing: 0.2,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    borderWidth: 1.5,
    padding: 8,
    marginBottom: 8,
    shadowColor: '#0f172a',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 1,
  },
  rowMe: {
    borderWidth: 2,
    shadowColor: GREEN.main,
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 3,
  },
  rankRing: {
    width: 36,
    alignItems: 'center',
    marginRight: 8,
    paddingVertical: 4,
    borderRadius: 10,
    borderWidth: 1.5,
    backgroundColor: 'rgba(255,255,255,0.65)',
  },
  rankNum: { fontSize: 14, fontWeight: '900' },
  avatar: { width: 36, height: 36, borderRadius: 18, marginRight: 8, backgroundColor: '#e2e8f0' },
  avatarPh: {
    width: 36,
    height: 36,
    borderRadius: 18,
    marginRight: 8,
    backgroundColor: '#dcfce7',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#bbf7d0',
  },
  avatarPhMe: { borderColor: GREEN.main, borderWidth: 2, backgroundColor: '#ecfdf5' },
  avatarPhText: { fontWeight: '900', color: GREEN.dark, fontSize: 14 },
  nameRow: { flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap' },
  name: { fontSize: 13, fontWeight: '900', color: '#0f172a', flexShrink: 1 },
  youPill: {
    marginLeft: 6,
    backgroundColor: GREEN.main,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  youPillText: { color: '#fff', fontSize: 8, fontWeight: '900', textTransform: 'uppercase', letterSpacing: 0.5 },
  sub: { marginTop: 2, fontSize: 10, fontWeight: '600', color: NEUTRAL.subtext },
  marksPill: {
    backgroundColor: GREEN.dark,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
    marginLeft: 6,
    minWidth: 40,
    alignItems: 'center',
  },
  marksPillTop: { backgroundColor: GREEN.main },
  marksText: { color: '#fff', fontWeight: '900', fontSize: 13 },
  empty: { alignItems: 'center', paddingVertical: 40, paddingHorizontal: 20 },
  emptyIconWrap: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#f0fdf4',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#bbf7d0',
  },
  emptyTitle: { marginTop: 12, fontSize: 15, fontWeight: '900', color: GREEN.dark },
  emptySub: { marginTop: 6, color: NEUTRAL.subtext, fontWeight: '600', textAlign: 'center', fontSize: 12 },
  playCta: {
    marginTop: 16,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: GREEN.dark,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 12,
  },
  playCtaText: { color: '#fff', fontWeight: '900', fontSize: 14 },
});
