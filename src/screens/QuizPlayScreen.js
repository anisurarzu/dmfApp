import { StatusBar } from 'expo-status-bar';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
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
  apiCheckPhoneInQuiz,
  apiGetQuizById,
  apiSubmitQuizAnswer,
  buildAnswersPayloadForSubmit,
  getQuizListState,
  normalizeQuizQuestion,
} from '../api/quiz';

export default function QuizPlayScreen({ navigation, route }) {
  const { quizId, quizName: quizNameParam } = route.params || {};
  const { me, token } = useAuth();
  const insets = useSafeAreaInsets();

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [quiz, setQuiz] = useState(null);
  const [error, setError] = useState('');
  const [phoneBlocked, setPhoneBlocked] = useState(false);
  const [index, setIndex] = useState(0);
  /** @type {Record<number, number>} questionIndex -> selected option index */
  const [selections, setSelections] = useState({});
  const startedAt = useRef(Date.now());
  const [secondsLeft, setSecondsLeft] = useState(null);
  /** When non-null, countdown is active for this attempt */
  const [durationSeconds, setDurationSeconds] = useState(null);
  const timeUpHandled = useRef(false);
  const submittedRef = useRef(false);

  const normalizedQuestions = useMemo(() => {
    const raw = quiz?.quizQuestions;
    if (!Array.isArray(raw)) return [];
    return raw.map((q, i) => normalizeQuizQuestion(q, i));
  }, [quiz]);

  const userId = useMemo(
    () =>
      me?.uniqueId != null
        ? String(me.uniqueId)
        : me?._id != null
          ? String(me._id)
          : me?.id != null
            ? String(me.id)
            : me?.email
              ? String(me.email)
              : 'guest',
    [me]
  );

  const userName = useMemo(() => {
    const n = `${me?.firstName || ''} ${me?.lastName || ''}`.trim();
    return n || me?.username || me?.email || 'Participant';
  }, [me]);

  const load = useCallback(async () => {
    if (!quizId) {
      setError('Missing quiz.');
      setLoading(false);
      return;
    }
    setLoading(true);
    setError('');
    setPhoneBlocked(false);
    setQuiz(null);
    setIndex(0);
    setSelections({});
    setDurationSeconds(null);
    setSecondsLeft(null);
    submittedRef.current = false;
    timeUpHandled.current = false;
    try {
      const data = await apiGetQuizById(quizId, token);
      setQuiz(data);
      startedAt.current = Date.now();

      const phone = me?.phone ? String(me.phone).trim() : '';
      if (phone) {
        try {
          const { exists } = await apiCheckPhoneInQuiz(quizId, phone, token);
          if (exists) {
            setPhoneBlocked(true);
            setQuiz(null);
            Alert.alert(
              'Already submitted',
              'This phone number has already been used for this quiz.',
              [
                { text: 'Leaderboard', onPress: () => navigation.replace('QuizLeaderboard', { quizId, quizName: data?.quizName }) },
                { text: 'Back', style: 'cancel', onPress: () => navigation.goBack() },
              ]
            );
            return;
          }
        } catch {
          /* allow play if check fails */
        }
      }

      const availability = getQuizListState(data);
      if (!availability.playable) {
        setError(`This quiz is not available (${availability.statusLabel}).`);
        setQuiz(null);
        return;
      }

      const durRaw = data?.duration;
      const durMin = Number(durRaw);
      if (Number.isFinite(durMin) && durMin > 0) {
        const sec = Math.max(1, Math.round(durMin * 60));
        setDurationSeconds(sec);
        setSecondsLeft(sec);
      } else {
        setDurationSeconds(null);
        setSecondsLeft(null);
      }
    } catch (e) {
      setError(e?.message || 'Failed to load quiz.');
    } finally {
      setLoading(false);
    }
  }, [quizId, me?.phone, navigation, token]);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    if (!quizId || durationSeconds == null || durationSeconds <= 0) return undefined;
    const id = setInterval(() => {
      setSecondsLeft((s) => (s == null || s <= 1 ? 0 : s - 1));
    }, 1000);
    return () => clearInterval(id);
  }, [quizId, durationSeconds]);

  const doSubmit = useCallback(async () => {
    if (submitting || submittedRef.current) return;
    submittedRef.current = true;
    const nqList = normalizedQuestions;
    setSubmitting(true);
    const elapsedSec = Math.max(1, Math.round((Date.now() - startedAt.current) / 1000));
    const answers = buildAnswersPayloadForSubmit(nqList, selections);
    const totalMarks = answers.reduce((s, a) => s + (Number(a.mark) || 0), 0);

    try {
      await apiSubmitQuizAnswer(
        {
          quizID: String(quizId),
          userId,
          userName,
          userPhone: me?.phone ? String(me.phone) : '',
          userEmail: me?.email ? String(me.email) : '',
          answers,
          isSubmitted: true,
          answerTime: elapsedSec,
        },
        token
      );
      setDurationSeconds(null);
      setSecondsLeft(null);
      Alert.alert('Submitted', `Your score: ${totalMarks} marks.`, [
        {
          text: 'Leaderboard',
          onPress: () => navigation.replace('QuizLeaderboard', { quizId, quizName: quiz?.quizName }),
        },
        { text: 'Done', onPress: () => navigation.navigate('Dashboard') },
      ]);
    } catch (e) {
      submittedRef.current = false;
      Alert.alert('Submit failed', e?.message || 'Please try again.');
    } finally {
      setSubmitting(false);
    }
  }, [
    submitting,
    normalizedQuestions,
    selections,
    quizId,
    userId,
    userName,
    me?.phone,
    me?.email,
    quiz?.quizName,
    navigation,
    token,
  ]);

  useEffect(() => {
    if (secondsLeft !== 0 || timeUpHandled.current || submittedRef.current) return;
    timeUpHandled.current = true;
    doSubmit();
  }, [secondsLeft, doSubmit]);

  const current = normalizedQuestions[index];
  const total = normalizedQuestions.length;
  const progress = total ? (index + 1) / total : 0;

  const selectOption = (optIdx) => {
    setSelections((prev) => ({ ...prev, [index]: optIdx }));
  };

  const goNext = () => {
    if (index < total - 1) setIndex((i) => i + 1);
  };

  const goPrev = () => {
    if (index > 0) setIndex((i) => i - 1);
  };

  const handleSubmit = async (fromTimer = false) => {
    if (submitting) return;
    const unanswered = [];
    for (let i = 0; i < total; i++) {
      if (selections[i] == null) unanswered.push(i + 1);
    }
    if (unanswered.length && !fromTimer) {
      Alert.alert(
        'Incomplete',
        `You still need to answer: ${unanswered.slice(0, 5).join(', ')}${unanswered.length > 5 ? '…' : ''}. Submit anyway?`,
        [
          { text: 'Keep editing', style: 'cancel' },
          { text: 'Submit anyway', style: 'destructive', onPress: () => doSubmit() },
        ]
      );
      return;
    }
    await doSubmit();
  };

  const formatTime = (sec) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m}:${String(s).padStart(2, '0')}`;
  };

  if (loading) {
    return (
      <View style={styles.loadingRoot}>
        <StatusBar style="dark" />
        <ActivityIndicator size="large" color={GREEN.main} />
        <Text style={styles.loadingText}>Loading quiz…</Text>
      </View>
    );
  }

  if (phoneBlocked) {
    return (
      <View style={styles.loadingRoot}>
        <StatusBar style="dark" />
        <Ionicons name="lock-closed-outline" size={48} color={GREEN.main} />
        <Text style={styles.errTitle}>You already took this quiz with this phone number.</Text>
        <TouchableOpacity
          style={styles.backPrimary}
          onPress={() => navigation.replace('QuizLeaderboard', { quizId, quizName: quizNameParam })}
        >
          <Text style={styles.backPrimaryText}>View leaderboard</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.backPrimary, { marginTop: 12, backgroundColor: '#64748b' }]} onPress={() => navigation.goBack()}>
          <Text style={styles.backPrimaryText}>Go back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (error || !quiz || total === 0) {
    return (
      <View style={styles.loadingRoot}>
        <StatusBar style="dark" />
        <Ionicons name="alert-circle-outline" size={48} color="#b91c1c" />
        <Text style={styles.errTitle}>{error || 'No questions in this quiz.'}</Text>
        <TouchableOpacity style={styles.backPrimary} onPress={() => navigation.goBack()}>
          <Text style={styles.backPrimaryText}>Go back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.screen}>
      <StatusBar style="light" />

      <View style={[styles.header, { paddingTop: Math.max(insets.top, 8) + 6 }]}>
        <TouchableOpacity style={styles.headerBack} onPress={() => navigation.goBack()} activeOpacity={0.75}>
          <Ionicons name="chevron-back" size={22} color="#fff" />
        </TouchableOpacity>
        <View style={{ flex: 1 }}>
          <Text style={styles.headerTitle} numberOfLines={1}>
            {quiz.quizName || 'Quiz'}
          </Text>
          <Text style={styles.headerSub}>
            Question {index + 1} of {total}
          </Text>
        </View>
        {secondsLeft != null && (
          <View style={styles.timerPill}>
            <Ionicons name="timer-outline" size={16} color={secondsLeft < 60 ? '#fecaca' : '#fff'} />
            <Text style={[styles.timerText, secondsLeft < 60 && styles.timerWarn]}>{formatTime(secondsLeft)}</Text>
          </View>
        )}
      </View>

      <View style={styles.progressTrack}>
        <View style={[styles.progressFill, { width: `${progress * 100}%` }]} />
      </View>

      <ScrollView style={styles.body} contentContainerStyle={styles.bodyContent} showsVerticalScrollIndicator={false}>
        <Text style={styles.questionText}>{current.text}</Text>

        <View style={styles.optionsWrap}>
          {current.options.length === 0 ? (
            <Text style={styles.noOptions}>No options provided for this question.</Text>
          ) : (
            current.options.map((label, optIdx) => {
              const selected = selections[index] === optIdx;
              return (
                <TouchableOpacity
                  key={`${index}-${optIdx}`}
                  style={[styles.optionRow, selected && styles.optionRowOn]}
                  onPress={() => selectOption(optIdx)}
                  activeOpacity={0.85}
                >
                  <View style={[styles.optionBullet, selected && styles.optionBulletOn]}>
                    <Text style={[styles.optionLetter, selected && styles.optionLetterOn]}>
                      {String.fromCharCode(65 + optIdx)}
                    </Text>
                  </View>
                  <Text style={[styles.optionLabel, selected && styles.optionLabelOn]}>{label}</Text>
                  {selected && <Ionicons name="checkmark-circle" size={22} color={GREEN.main} />}
                </TouchableOpacity>
              );
            })
          )}
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.navBtn, index === 0 && styles.navBtnGhost]}
          onPress={goPrev}
          disabled={index === 0}
        >
          <Ionicons name="chevron-back" size={20} color={index === 0 ? '#cbd5e1' : GREEN.dark} />
          <Text style={[styles.navBtnText, index === 0 && styles.navBtnTextDisabled]}>Previous</Text>
        </TouchableOpacity>

        {index < total - 1 ? (
          <TouchableOpacity style={styles.nextBtn} onPress={goNext} activeOpacity={0.85}>
            <Text style={styles.nextBtnText}>Next</Text>
            <Ionicons name="chevron-forward" size={20} color="#fff" />
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={[styles.nextBtn, submitting && { opacity: 0.7 }]}
            onPress={() => handleSubmit(false)}
            disabled={submitting}
            activeOpacity={0.85}
          >
            {submitting ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <>
                <Text style={styles.nextBtnText}>Submit</Text>
                <Ionicons name="send" size={18} color="#fff" />
              </>
            )}
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: GREEN.bg },
  loadingRoot: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
    backgroundColor: GREEN.bg,
  },
  loadingText: { marginTop: 12, color: NEUTRAL.subtext, fontWeight: '600' },
  errTitle: { marginTop: 12, color: '#b91c1c', fontWeight: '800', textAlign: 'center' },
  backPrimary: {
    marginTop: 20,
    backgroundColor: GREEN.dark,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 14,
  },
  backPrimaryText: { color: '#fff', fontWeight: '900' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingBottom: 12,
    paddingHorizontal: 16,
    backgroundColor: GREEN.dark,
  },
  headerBack: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.14)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  headerTitle: { fontSize: 17, fontWeight: '900', color: '#fff' },
  headerSub: { marginTop: 2, fontSize: 12, fontWeight: '700', color: 'rgba(255,255,255,0.75)' },
  timerPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.2)',
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 12,
    marginLeft: 8,
  },
  timerText: { marginLeft: 6, fontWeight: '900', color: '#fff', fontSize: 13 },
  timerWarn: { color: '#fecaca' },
  progressTrack: { height: 4, backgroundColor: '#dcfce7' },
  progressFill: { height: '100%', backgroundColor: GREEN.main },
  body: { flex: 1 },
  bodyContent: { padding: 20, paddingBottom: 32 },
  questionText: { fontSize: 20, fontWeight: '900', color: '#0f172a', lineHeight: 28 },
  optionsWrap: { marginTop: 22 },
  noOptions: { color: NEUTRAL.subtext, fontWeight: '600' },
  optionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 14,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: '#e2e8f0',
  },
  optionRowOn: { borderColor: GREEN.main, backgroundColor: '#f0fdf4' },
  optionBullet: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: '#f1f5f9',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  optionBulletOn: { backgroundColor: GREEN.main },
  optionLetter: { fontWeight: '900', color: '#64748b', fontSize: 14 },
  optionLetterOn: { color: '#fff' },
  optionLabel: { flex: 1, fontSize: 15, fontWeight: '700', color: '#0f172a', lineHeight: 22 },
  optionLabelOn: { color: GREEN.dark },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 16,
    paddingBottom: 28,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
  },
  navBtn: { flexDirection: 'row', alignItems: 'center', paddingVertical: 10, paddingHorizontal: 8 },
  navBtnGhost: { opacity: 0.5 },
  navBtnText: { marginLeft: 4, fontWeight: '800', color: GREEN.dark, fontSize: 15 },
  navBtnTextDisabled: { color: '#cbd5e1' },
  nextBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: GREEN.main,
    paddingHorizontal: 22,
    paddingVertical: 14,
    borderRadius: 16,
    minWidth: 120,
    justifyContent: 'center',
  },
  nextBtnText: { color: '#fff', fontWeight: '900', fontSize: 15, marginRight: 6 },
});
