import { StatusBar } from 'expo-status-bar';
import { useMemo, useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  findNodeHandle,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { GREEN, NEUTRAL } from '../theme/colors';
import { useAuth } from '../context/AuthContext';
import BottomNav from '../components/BottomNav';

export default function ChangePasswordScreen({ navigation }) {
  const { me, isBusy, changePassword } = useAuth();
  const email = useMemo(() => (me?.email ? String(me.email).trim().toLowerCase() : ''), [me]);

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [show, setShow] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [scrollRef, setScrollRef] = useState(null);

  const onSubmit = async () => {
    setError('');
    setSuccess('');
    if (!email) {
      setError('Your account email is missing. Please login again.');
      return;
    }
    if (!currentPassword) {
      setError('Current password is required.');
      return;
    }
    if (!newPassword || newPassword.length < 6) {
      setError('New password must be at least 6 characters.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setError("New password and confirm password don't match.");
      return;
    }

    const res = await changePassword({ email, currentPassword, newPassword });
    if (!res.ok) {
      setError(res.error || 'Password change failed');
      return;
    }
    setSuccess('Password updated successfully.');
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    setTimeout(() => navigation.goBack(), 800);
  };

  const scrollToFocused = (e) => {
    const node = findNodeHandle(e?.target);
    if (!node || !scrollRef) return;
    const extraOffset = 100;
    try {
      scrollRef.scrollResponderScrollNativeHandleToKeyboard(node, extraOffset, true);
    } catch {
      // ignore
    }
  };

  return (
    <View style={styles.screen}>
      <StatusBar style="light" />

      <View style={styles.top}>
        <View style={styles.topBgBubble} />
        <View style={styles.topInner}>
          <View style={styles.topRow}>
            <TouchableOpacity style={styles.iconBtn} activeOpacity={0.7} onPress={() => navigation.goBack()}>
              <Ionicons name="chevron-back" size={22} color="#fff" />
            </TouchableOpacity>
            <Text style={styles.topTitle}>Change Password</Text>
            <View style={{ width: 44 }} />
          </View>
          <Text style={styles.heroSub}>Use a strong password you don’t reuse anywhere else.</Text>
        </View>
      </View>

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 8 : 0}
      >
        <ScrollView
          ref={setScrollRef}
          style={styles.sheet}
          contentContainerStyle={styles.sheetContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          automaticallyAdjustKeyboardInsets
        >
          <View style={styles.panel}>
            <Text style={styles.label}>Email</Text>
            <View style={styles.readonly}>
              <Ionicons name="mail-outline" size={18} color={GREEN.dark} />
              <Text style={styles.readonlyText}>{email || '—'}</Text>
            </View>

            <Text style={styles.label}>Current password</Text>
            <View style={styles.inputWrap}>
              <Ionicons name="lock-closed-outline" size={18} color={GREEN.dark} />
              <TextInput
                style={styles.input}
                value={currentPassword}
                onChangeText={setCurrentPassword}
                placeholder="Current password"
                placeholderTextColor={NEUTRAL.subtext}
                secureTextEntry={!show}
                editable={!isBusy}
                onFocus={scrollToFocused}
              />
            </View>

            <Text style={styles.label}>New password</Text>
            <View style={styles.inputWrap}>
              <Ionicons name="key-outline" size={18} color={GREEN.dark} />
              <TextInput
                style={styles.input}
                value={newPassword}
                onChangeText={setNewPassword}
                placeholder="New password"
                placeholderTextColor={NEUTRAL.subtext}
                secureTextEntry={!show}
                editable={!isBusy}
                onFocus={scrollToFocused}
              />
              <TouchableOpacity onPress={() => setShow(!show)} disabled={isBusy}>
                <Ionicons name={show ? 'eye-off-outline' : 'eye-outline'} size={18} color={GREEN.dark} />
              </TouchableOpacity>
            </View>

            <Text style={styles.label}>Confirm new password</Text>
            <View style={styles.inputWrap}>
              <Ionicons name="checkmark-circle-outline" size={18} color={GREEN.dark} />
              <TextInput
                style={styles.input}
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                placeholder="Confirm new password"
                placeholderTextColor={NEUTRAL.subtext}
                secureTextEntry={!show}
                editable={!isBusy}
                onFocus={scrollToFocused}
              />
            </View>

            {!!error && <Text style={styles.errorText}>{error}</Text>}
            {!!success && <Text style={styles.successText}>{success}</Text>}

            <TouchableOpacity
              style={[styles.saveBtn, isBusy && { opacity: 0.7 }]}
              activeOpacity={0.85}
              onPress={onSubmit}
              disabled={isBusy}
            >
              {isBusy ? <ActivityIndicator size="small" color="#fff" /> : <Ionicons name="save-outline" size={18} color="#fff" />}
              <Text style={styles.saveText}>{isBusy ? 'Saving…' : 'Update password'}</Text>
            </TouchableOpacity>
          </View>
          <View style={{ height: 32 }} />
        </ScrollView>
      </KeyboardAvoidingView>
      <BottomNav navigation={navigation} active="profile" />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: GREEN.bg },
  flex: { flex: 1 },
  top: {
    height: 210,
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
  topInner: { flex: 1, paddingTop: 56, paddingHorizontal: 20 },
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
  heroSub: { marginTop: 12, color: 'rgba(234,255,240,0.9)', fontWeight: '700', fontSize: 13, lineHeight: 18 },

  sheet: {
    flex: 1,
    marginTop: -18,
    backgroundColor: '#fff',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
  },
  sheetContent: { paddingTop: 18, paddingHorizontal: 20 },
  panel: {
    borderRadius: 20,
    borderWidth: 1,
    borderColor: GREEN.pale,
    backgroundColor: '#fff',
    padding: 14,
  },
  label: { fontSize: 12, fontWeight: '900', color: GREEN.dark, marginBottom: 6, marginTop: 10 },
  readonly: {
    height: 48,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: GREEN.pale,
    backgroundColor: GREEN.bg,
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
  },
  readonlyText: { marginLeft: 10, fontSize: 14, fontWeight: '900', color: '#0f172a' },
  inputWrap: {
    height: 48,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: GREEN.pale,
    backgroundColor: GREEN.bg,
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
  },
  input: { flex: 1, marginLeft: 10, fontSize: 15, fontWeight: '800', color: '#0f172a', paddingVertical: 0 },
  errorText: { marginTop: 10, color: '#b91c1c', fontWeight: '800', fontSize: 12 },
  successText: { marginTop: 10, color: GREEN.dark, fontWeight: '900', fontSize: 12 },
  saveBtn: {
    marginTop: 14,
    height: 50,
    borderRadius: 18,
    backgroundColor: GREEN.dark,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  saveText: { color: '#fff', fontWeight: '900', marginLeft: 10, fontSize: 15 },
});

