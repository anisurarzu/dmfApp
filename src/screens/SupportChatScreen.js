import { StatusBar } from 'expo-status-bar';
import { useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Animated,
  Image,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { GREEN, NEUTRAL } from '../theme/colors';
import { useAuth } from '../context/AuthContext';
import { apiCreateSupportSession, apiFetchSupportMessages, apiSendSupportMessage } from '../api/support';

const SPACE = {
  xs: 6,
  sm: 10,
  md: 14,
  lg: 18,
  xl: 22,
};

function makeId(prefix = 'msg') {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function nowIso() {
  return new Date().toISOString();
}

function getAvatarUri(me) {
  return (
    me?.photoURL ||
    me?.photoUrl ||
    me?.photo ||
    me?.avatarURL ||
    me?.avatarUrl ||
    me?.avatar ||
    me?.imageURL ||
    me?.imageUrl ||
    me?.image ||
    me?.profileImageURL ||
    me?.profileImageUrl ||
    me?.profileImage ||
    me?.profilePictureURL ||
    me?.profilePictureUrl ||
    me?.profilePicture ||
    null
  );
}

const QUICK_PROMPTS = [
  'How can I apply for scholarship?',
  'I cannot submit quiz answers',
  'Payment issue in my wallet',
];

function aiReplyFor(text) {
  const q = String(text || '').toLowerCase();
  if (q.includes('scholarship')) return 'You can apply from Scholarship section with your profile and required documents. Want me to show the exact steps?';
  if (q.includes('quiz')) return 'If quiz submission fails, please check internet stability and retry from Quiz list. I can also connect you to an agent now.';
  if (q.includes('payment') || q.includes('wallet') || q.includes('credit')) return 'For wallet issues, I can collect your issue details now and escalate instantly to customer service.';
  return 'I can help instantly, or connect you to our customer service team for live support.';
}

export default function SupportChatScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const { me, token } = useAuth();
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState([]);
  const [isTyping, setIsTyping] = useState(false);
  const [handoff, setHandoff] = useState(false);
  const [sessionId, setSessionId] = useState(null);
  const [syncWarn, setSyncWarn] = useState('');
  const [showIntro, setShowIntro] = useState(true);
  const scrollRef = useRef(null);
  const lastSeenRef = useRef('');
  const pulseAnim = useRef(new Animated.Value(1)).current;

  const userName = useMemo(() => `${me?.firstName || ''} ${me?.lastName || ''}`.trim() || 'User', [me?.firstName, me?.lastName]);
  const avatarUri = useMemo(() => getAvatarUri(me), [me]);

  useEffect(() => {
    let mounted = true;
    const pulseLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.08,
          duration: 700,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 700,
          useNativeDriver: true,
        }),
      ])
    );
    pulseLoop.start();

    const introTimer = setTimeout(() => {
      if (!mounted) return;
      setShowIntro(false);
    }, 1900);

    return () => {
      mounted = false;
      clearTimeout(introTimer);
      pulseLoop.stop();
    };
  }, [pulseAnim]);

  useEffect(() => {
    const seed = [
      {
        id: makeId('ai'),
        role: 'ai',
        text: `Assalamu alaikum ${userName}! I am DMF AI Support. How can I help you today?`,
        createdAt: nowIso(),
      },
      {
        id: makeId('ai'),
        role: 'ai',
        text: 'If needed, I can connect you to our live customer service instantly.',
        createdAt: nowIso(),
      },
    ];
    setMessages(seed);
  }, [userName]);

  useEffect(() => {
    (async () => {
      try {
        if (!token) return;
        const res = await apiCreateSupportSession({
          token,
          user: { id: me?._id || me?.id || null, name: userName, email: me?.email || null },
        });
        const sid = res?.data?.sessionId || res?.data?._id || null;
        if (sid) setSessionId(String(sid));
      } catch {
        setSyncWarn('Live server is temporarily unavailable. Local realtime chat is active.');
      }
    })();
  }, [token, me?._id, me?.id, me?.email, userName]);

  useEffect(() => {
    if (!sessionId || !token) return undefined;
    const t = setInterval(async () => {
      try {
        const res = await apiFetchSupportMessages({ token, sessionId, since: lastSeenRef.current });
        const incoming = Array.isArray(res?.data?.messages) ? res.data.messages : [];
        if (!incoming.length) return;
        setMessages((prev) => {
          const prevIds = new Set(prev.map((m) => m.id));
          const next = [...prev];
          incoming.forEach((m) => {
            const id = String(m?.id || m?._id || makeId('srv'));
            if (!prevIds.has(id)) {
              const createdAt = m?.createdAt || nowIso();
              next.push({
                id,
                role: m?.senderType === 'agent' ? 'agent' : m?.senderType === 'user' ? 'user' : 'ai',
                text: String(m?.text || ''),
                createdAt,
              });
              lastSeenRef.current = createdAt;
            }
          });
          return next;
        });
      } catch {
        // silent polling fallback
      }
    }, 2500);
    return () => clearInterval(t);
  }, [sessionId, token]);

  useEffect(() => {
    scrollRef.current?.scrollToEnd({ animated: true });
  }, [messages, isTyping]);

  const pushMessage = (msg) => setMessages((prev) => [...prev, msg]);

  async function sendText(text, role = 'user') {
    const cleaned = String(text || '').trim();
    if (!cleaned) return;
    const message = { id: makeId(role), role, text: cleaned, createdAt: nowIso() };
    pushMessage(message);
    lastSeenRef.current = message.createdAt;
    if (sessionId && token) {
      try {
        await apiSendSupportMessage({ token, sessionId, text: cleaned, senderType: role === 'agent' ? 'agent' : role });
      } catch {
        // local mode fallback
      }
    }
  }

  function handleSend() {
    const text = input.trim();
    if (!text) return;
    setInput('');
    sendText(text, 'user');

    setIsTyping(true);
    setTimeout(() => {
      const reply = handoff
        ? 'Thank you for waiting. A support executive will review your issue and reply right away.'
        : aiReplyFor(text);
      sendText(reply, handoff ? 'agent' : 'ai');
      setIsTyping(false);
    }, handoff ? 1200 : 900);
  }

  function handleConnectAgent() {
    if (handoff) return;
    setHandoff(true);
    setIsTyping(true);
    setTimeout(() => {
      sendText('Customer Service joined the chat. Please share your issue details.', 'agent');
      setIsTyping(false);
    }, 900);
  }

  return (
    <View style={styles.screen}>
      <StatusBar style="light" />
      <View style={[styles.top, { paddingTop: Math.max(insets.top, 8) + 2 }]}>
        <TouchableOpacity style={styles.backBtn} activeOpacity={0.75} onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-back" size={22} color="#fff" />
        </TouchableOpacity>
        <View style={{ flex: 1 }}>
          <Text style={styles.topTitle}>Support Chat</Text>
          <Text style={styles.topSub}>{handoff ? 'Live Customer Service' : 'AI Assistant'}</Text>
        </View>
        <View style={styles.liveBadge}>
          <View style={styles.liveDot} />
          <Text style={styles.liveText}>Live</Text>
        </View>
      </View>

      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
        <View style={styles.sheet}>
          {!!syncWarn && <Text style={styles.syncWarn}>{syncWarn}</Text>}
          <ScrollView ref={scrollRef} style={styles.chat} contentContainerStyle={styles.chatContent}>
            {messages.map((m) => (
              <View key={m.id} style={[styles.row, m.role === 'user' ? styles.rowUser : styles.rowOther]}>
                {m.role !== 'user' && (
                  <View style={[styles.msgAvatar, styles.msgAvatarOther]}>
                    <Ionicons name={m.role === 'agent' ? 'headset' : 'sparkles'} size={14} color={GREEN.dark} />
                  </View>
                )}
                <View style={[styles.bubble, m.role === 'user' ? styles.bubbleUser : styles.bubbleOther]}>
                  <Text style={[styles.msgText, m.role === 'user' && styles.msgTextUser]}>{m.text}</Text>
                </View>
                {m.role === 'user' && (
                  <View style={[styles.msgAvatar, styles.msgAvatarUser]}>
                    {avatarUri ? (
                      <Image source={{ uri: avatarUri }} style={styles.msgAvatarImage} />
                    ) : (
                      <Ionicons name="person" size={14} color="#fff" />
                    )}
                  </View>
                )}
              </View>
            ))}
            {isTyping && (
              <View style={styles.row}>
                <View style={[styles.msgAvatar, styles.msgAvatarOther]}>
                  <Ionicons name={handoff ? 'headset' : 'sparkles'} size={14} color={GREEN.dark} />
                </View>
                <View style={[styles.bubble, styles.bubbleOther, { flexDirection: 'row', alignItems: 'center' }]}>
                  <ActivityIndicator size="small" color={GREEN.main} />
                  <Text style={styles.typingText}>{handoff ? 'Agent is typing...' : 'AI is typing...'}</Text>
                </View>
              </View>
            )}
          </ScrollView>

          {!handoff && (
            <View style={styles.quickWrap}>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                {QUICK_PROMPTS.map((q) => (
                  <Pressable key={q} style={styles.promptChip} onPress={() => setInput(q)}>
                    <Text style={styles.promptText}>{q}</Text>
                  </Pressable>
                ))}
              </ScrollView>
            </View>
          )}

          <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom, 10) + 2 }]}>
            {!handoff && (
              <TouchableOpacity style={styles.handoffBtn} activeOpacity={0.85} onPress={handleConnectAgent}>
                <Ionicons name="headset-outline" size={16} color={GREEN.dark} />
                <Text style={styles.handoffText}>Talk to customer service</Text>
              </TouchableOpacity>
            )}

            <View style={styles.inputRow}>
              <TextInput
                value={input}
                onChangeText={setInput}
                placeholder="Type your message..."
                placeholderTextColor={NEUTRAL.subtext}
                style={styles.input}
                multiline
                maxLength={500}
              />
              <TouchableOpacity
                activeOpacity={0.85}
                style={[styles.sendBtn, !input.trim() && styles.sendBtnDisabled]}
                onPress={handleSend}
                disabled={!input.trim()}
              >
                <Ionicons name="send" size={16} color="#fff" />
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </KeyboardAvoidingView>

      {showIntro && (
        <View style={styles.introOverlay}>
          <Animated.View style={[styles.introIconWrap, { transform: [{ scale: pulseAnim }] }]}>
            <Ionicons name="chatbubble-ellipses" size={30} color="#fff" />
          </Animated.View>
          <Text style={styles.introTitle}>DMF Support</Text>
          <Text style={styles.introSub}>WELCOME TO DMF SUPPORT PANNEL</Text>
          <View style={styles.introLoadingRow}>
            <ActivityIndicator size="small" color="#fff" />
            <Text style={styles.introLoadingText}>Loading secure support channel...</Text>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: GREEN.dark },
  top: {
    paddingHorizontal: SPACE.md,
    paddingBottom: SPACE.sm,
    flexDirection: 'row',
    alignItems: 'center',
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.16)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACE.sm,
  },
  topTitle: { color: '#fff', fontSize: 18, fontWeight: '900' },
  topSub: { color: 'rgba(255,255,255,0.82)', fontSize: 12, fontWeight: '600', marginTop: 3 },
  liveBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.14)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  liveDot: { width: 7, height: 7, borderRadius: 4, backgroundColor: '#22c55e', marginRight: 6 },
  liveText: { color: '#fff', fontWeight: '800', fontSize: 11 },
  sheet: {
    flex: 1,
    backgroundColor: '#f6fff8',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    overflow: 'hidden',
  },
  syncWarn: {
    marginTop: SPACE.sm,
    marginHorizontal: SPACE.md,
    backgroundColor: '#fffbeb',
    color: '#92400e',
    borderRadius: 12,
    paddingHorizontal: SPACE.sm,
    paddingVertical: 8,
    fontWeight: '700',
    fontSize: 12,
  },
  chat: { flex: 1 },
  chatContent: { paddingHorizontal: SPACE.md, paddingTop: SPACE.md, paddingBottom: SPACE.sm },
  row: { marginBottom: SPACE.sm },
  rowGap: { marginHorizontal: SPACE.xs },
  rowUser: { alignItems: 'flex-end' },
  rowOther: { alignItems: 'flex-start' },
  bubble: { borderRadius: 18, paddingHorizontal: 12, paddingVertical: 10, maxWidth: '82%' },
  bubbleUser: { backgroundColor: GREEN.main, borderBottomRightRadius: 6 },
  bubbleOther: { backgroundColor: '#ffffff', borderWidth: 1, borderColor: '#d1fae5', borderBottomLeftRadius: 6 },
  msgText: { color: '#0f172a', fontSize: 14, lineHeight: 20, fontWeight: '600' },
  msgTextUser: { color: '#fff' },
  msgAvatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: SPACE.xs,
  },
  msgAvatarOther: {
    backgroundColor: '#dcfce7',
    borderWidth: 1,
    borderColor: '#bbf7d0',
  },
  msgAvatarUser: {
    backgroundColor: GREEN.dark,
    overflow: 'hidden',
  },
  msgAvatarImage: {
    width: '100%',
    height: '100%',
    borderRadius: 14,
  },
  typingText: { marginLeft: 8, color: '#334155', fontWeight: '700', fontSize: 12 },
  quickWrap: { paddingHorizontal: SPACE.md, marginBottom: SPACE.xs, marginTop: 2 },
  promptChip: {
    marginRight: SPACE.xs,
    backgroundColor: '#ecfdf3',
    borderWidth: 1,
    borderColor: '#bbf7d0',
    borderRadius: 999,
    paddingHorizontal: SPACE.sm,
    paddingVertical: 8,
  },
  promptText: { color: GREEN.dark, fontSize: 12, fontWeight: '700' },
  footer: {
    paddingHorizontal: SPACE.md,
    paddingTop: SPACE.sm,
    paddingBottom: SPACE.sm,
    borderTopWidth: 1,
    borderTopColor: '#dcfce7',
    backgroundColor: '#ffffff',
  },
  handoffBtn: {
    marginBottom: SPACE.sm,
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0fdf4',
    borderWidth: 1,
    borderColor: '#86efac',
    borderRadius: 999,
    paddingVertical: 8,
    paddingHorizontal: SPACE.sm,
  },
  handoffText: { marginLeft: 6, color: GREEN.dark, fontWeight: '800', fontSize: 12 },
  inputRow: { flexDirection: 'row', alignItems: 'flex-end' },
  input: {
    flex: 1,
    minHeight: 46,
    maxHeight: 120,
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#cbd5e1',
    borderRadius: 14,
    paddingHorizontal: SPACE.sm,
    paddingVertical: 11,
    color: '#0f172a',
    fontWeight: '600',
  },
  sendBtn: {
    marginLeft: SPACE.xs,
    width: 46,
    height: 46,
    borderRadius: 14,
    backgroundColor: GREEN.dark,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendBtnDisabled: { backgroundColor: '#94a3b8' },
  introOverlay: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 40,
    backgroundColor: 'rgba(5,46,22,0.96)',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: SPACE.lg,
  },
  introIconWrap: {
    width: 76,
    height: 76,
    borderRadius: 38,
    backgroundColor: GREEN.main,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 14,
    elevation: 8,
  },
  introTitle: {
    marginTop: SPACE.md,
    fontSize: 24,
    fontWeight: '900',
    color: '#fff',
    letterSpacing: 0.3,
  },
  introSub: {
    marginTop: SPACE.xs,
    fontSize: 14,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.88)',
  },
  introLoadingRow: {
    marginTop: SPACE.lg,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 999,
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  introLoadingText: {
    marginLeft: 8,
    fontSize: 12,
    fontWeight: '700',
    color: '#fff',
  },
});
