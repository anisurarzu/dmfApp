import { StatusBar } from 'expo-status-bar';
import { useRef, useState } from 'react';
import {
  Animated,
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
import AuthTopImage from '../components/AuthTopImage';
import PartnerLogos from '../components/PartnerLogos';
import { GREEN, NEUTRAL } from '../theme/colors';
import { useAuth } from '../context/AuthContext';

export default function RegisterScreen({ navigation }) {
  const { register, isBusy } = useAuth();
  const buttonScale = useRef(new Animated.Value(1)).current;

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [errors, setErrors] = useState({});
  const [success, setSuccess] = useState('');

  const onPressIn = () => {
    Animated.spring(buttonScale, { toValue: 0.97, useNativeDriver: true }).start();
  };
  const onPressOut = () => {
    Animated.spring(buttonScale, { toValue: 1, friction: 4, useNativeDriver: true }).start();
  };

  const handleRegister = async () => {
    setErrors({});
    setSuccess('');

    const payload = {
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      username: username.trim(),
      email: (email || '').trim().toLowerCase(),
      password,
    };

    const next = {};
    if (!payload.firstName) next.firstName = 'First name is required';
    if (!payload.lastName) next.lastName = 'Last name is required';
    if (!payload.username) next.username = 'Username is required';
    if (!payload.email) next.email = 'Email is required';
    if (!payload.password) next.password = 'Password is required';
    if (Object.keys(next).length) {
      setErrors(next);
      return;
    }

    const res = await register(payload);
    if (!res.ok) {
      const fe = res?.fieldErrors && Object.keys(res.fieldErrors).length ? res.fieldErrors : null;
      if (fe) setErrors({ ...fe, general: res.error });
      else setErrors({ general: res.error });
      return;
    }

    setSuccess(res?.data?.message || 'Registered successfully. Please check your email.');
    navigation.navigate('Login');
  };

  return (
    <View style={styles.screen}>
      <StatusBar style="light" />
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.authScrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <AuthTopImage onBack={() => navigation.goBack()} />

          <View style={styles.authPanel}>
            <View style={styles.authTitleRow}>
              <View style={styles.authTitleLeft}>
                <Text style={styles.authTitle}>Register</Text>
                <Ionicons name="leaf" size={28} color={GREEN.main} />
              </View>
            </View>
            <Text style={styles.authSubtitle}>Create your new account</Text>

            {!!errors.general && <Text style={styles.authErrorText}>{errors.general}</Text>}
            {!!success && <Text style={styles.authSuccessText}>{success}</Text>}

            <View style={styles.authInputWrap}>
              <Ionicons name="person-outline" size={20} color={GREEN.dark} />
              <TextInput
                style={styles.authInput}
                placeholder="First Name"
                placeholderTextColor={NEUTRAL.subtext}
                value={firstName}
                onChangeText={setFirstName}
                editable={!isBusy}
              />
            </View>
            {!!errors.firstName && <Text style={styles.authErrorText}>{errors.firstName}</Text>}

            <View style={styles.authInputWrap}>
              <Ionicons name="person-outline" size={20} color={GREEN.dark} />
              <TextInput
                style={styles.authInput}
                placeholder="Last Name"
                placeholderTextColor={NEUTRAL.subtext}
                value={lastName}
                onChangeText={setLastName}
                editable={!isBusy}
              />
            </View>
            {!!errors.lastName && <Text style={styles.authErrorText}>{errors.lastName}</Text>}

            <View style={styles.authInputWrap}>
              <Ionicons name="at-outline" size={20} color={GREEN.dark} />
              <TextInput
                style={styles.authInput}
                placeholder="Username"
                placeholderTextColor={NEUTRAL.subtext}
                autoCapitalize="none"
                autoCorrect={false}
                value={username}
                onChangeText={setUsername}
                editable={!isBusy}
              />
            </View>
            {!!errors.username && <Text style={styles.authErrorText}>{errors.username}</Text>}

            <View style={styles.authInputWrap}>
              <Ionicons name="mail-outline" size={20} color={GREEN.dark} />
              <TextInput
                style={styles.authInput}
                placeholder="Email"
                placeholderTextColor={NEUTRAL.subtext}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                value={email}
                onChangeText={setEmail}
                editable={!isBusy}
              />
            </View>
            {!!errors.email && <Text style={styles.authErrorText}>{errors.email}</Text>}

            <View style={styles.authInputWrap}>
              <Ionicons name="lock-closed-outline" size={20} color={GREEN.dark} />
              <TextInput
                style={styles.authInput}
                placeholder="Password"
                placeholderTextColor={NEUTRAL.subtext}
                secureTextEntry={!showPassword}
                value={password}
                onChangeText={setPassword}
                editable={!isBusy}
              />
              <TouchableOpacity onPress={() => setShowPassword(!showPassword)} disabled={isBusy}>
                <Ionicons
                  name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                  size={20}
                  color={GREEN.dark}
                />
              </TouchableOpacity>
            </View>
            {!!errors.password && <Text style={styles.authErrorText}>{errors.password}</Text>}

            <View style={styles.authOptionsRow}>
              <TouchableOpacity
                style={styles.authCheckRow}
                onPress={() => setRememberMe(!rememberMe)}
                activeOpacity={0.7}
                disabled={isBusy}
              >
                <View style={[styles.authCheckbox, rememberMe && styles.authCheckboxChecked]}>
                  {rememberMe && <Ionicons name="checkmark" size={16} color="#fff" />}
                </View>
                <Text style={styles.authCheckLabel}>Remember Me</Text>
              </TouchableOpacity>
              <TouchableOpacity activeOpacity={0.7} disabled={isBusy}>
                <Text style={styles.authForgot}>Forgot Password ?</Text>
              </TouchableOpacity>
            </View>

            <Pressable onPressIn={onPressIn} onPressOut={onPressOut} onPress={handleRegister} disabled={isBusy}>
              <Animated.View
                style={[
                  styles.authMainBtn,
                  isBusy && styles.authMainBtnDisabled,
                  { transform: [{ scale: buttonScale }] },
                ]}
              >
                <Text style={styles.authMainBtnText}>{isBusy ? 'Please wait...' : 'Register'}</Text>
              </Animated.View>
            </Pressable>

            <View style={styles.authSwitchRow}>
              <Text style={styles.authSwitchLabel}>Already have an account? </Text>
              <TouchableOpacity onPress={() => navigation.navigate('Login')} activeOpacity={0.7} disabled={isBusy}>
                <Text style={styles.authSwitchLink}>Login</Text>
              </TouchableOpacity>
            </View>
          </View>

          <PartnerLogos />
          <View style={{ height: 24 }} />
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#ffffff' },
  container: { flex: 1 },
  authScrollContent: { paddingBottom: 40 },
  authPanel: {
    marginTop: -24,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
    backgroundColor: '#ffffff',
    paddingHorizontal: 24,
    paddingTop: 28,
    paddingBottom: 28,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 12,
    marginBottom: 4,
  },
  authTitleRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  authTitleLeft: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  authTitle: { fontSize: 24, fontWeight: '800', color: GREEN.dark, marginRight: 10 },
  authSubtitle: { fontSize: 15, color: NEUTRAL.subtext, marginBottom: 22 },
  authInputWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: GREEN.pale,
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 14,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: 'rgba(34,197,94,0.2)',
  },
  authInput: {
    flex: 1,
    marginLeft: 12,
    fontSize: 16,
    color: GREEN.dark,
    paddingVertical: 0,
  },
  authOptionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  authCheckRow: { flexDirection: 'row', alignItems: 'center' },
  authCheckbox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: GREEN.main,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  authCheckboxChecked: { backgroundColor: GREEN.main, borderColor: GREEN.main },
  authCheckLabel: { fontSize: 14, color: '#475569' },
  authForgot: { fontSize: 14, color: GREEN.main, fontWeight: '600' },
  authMainBtn: {
    backgroundColor: GREEN.dark,
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: 'center',
    marginBottom: 20,
  },
  authMainBtnText: { color: '#ffffff', fontSize: 18, fontWeight: '700' },
  authMainBtnDisabled: { opacity: 0.7 },
  authSwitchRow: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center' },
  authSwitchLabel: { fontSize: 15, color: NEUTRAL.subtext },
  authSwitchLink: { fontSize: 15, color: GREEN.main, fontWeight: '700' },
  authErrorText: {
    color: '#b91c1c',
    fontSize: 12,
    marginTop: -8,
    marginBottom: 10,
    marginLeft: 8,
    fontWeight: '600',
  },
  authSuccessText: {
    color: '#166534',
    fontSize: 12,
    marginTop: -8,
    marginBottom: 10,
    marginLeft: 8,
    fontWeight: '700',
  },
});

