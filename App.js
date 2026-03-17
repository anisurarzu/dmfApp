import { StatusBar } from 'expo-status-bar';
import { useRef, useEffect, useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  Image,
  ImageBackground,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Animated,
  Pressable,
} from 'react-native';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons, FontAwesome5 } from '@expo/vector-icons';

const GREEN = {
  dark: '#166534',
  main: '#16a34a',
  light: '#22c55e',
  pale: '#dcfce7',
  bg: '#f0fdf4',
};

export default function App() {
  const [screen, setScreen] = useState('login');
  const [authScreen, setAuthScreen] = useState('login');
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const headerOpacity = useRef(new Animated.Value(0)).current;
  const logoScale = useRef(new Animated.Value(0.9)).current;
  const cardOpacity = useRef(new Animated.Value(0)).current;
  const cardTranslateY = useRef(new Animated.Value(30)).current;
  const buttonScale = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(headerOpacity, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }),
      Animated.spring(logoScale, {
        toValue: 1,
        friction: 8,
        tension: 50,
        useNativeDriver: true,
      }),
    ]).start();
    Animated.parallel([
      Animated.timing(cardOpacity, {
        toValue: 1,
        duration: 500,
        delay: 200,
        useNativeDriver: true,
      }),
      Animated.timing(cardTranslateY, {
        toValue: 0,
        duration: 500,
        delay: 200,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const onPressIn = () => {
    Animated.spring(buttonScale, { toValue: 0.97, useNativeDriver: true }).start();
  };
  const onPressOut = () => {
    Animated.spring(buttonScale, { toValue: 1, friction: 4, useNativeDriver: true }).start();
  };

  if (screen === 'dashboard') {
    return (
      <View style={styles.screen}>
        <StatusBar style="dark" />
        <View style={[styles.background, { backgroundColor: '#ffffff' }]} />
        <ScrollView
          style={styles.dashScroll}
          contentContainerStyle={styles.dashScrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Dashboard header */}
          <View style={styles.dashHeader}>
            <TouchableOpacity style={styles.dashMenuBtn} activeOpacity={0.7}>
              <Ionicons name="grid-outline" size={24} color={GREEN.dark} />
            </TouchableOpacity>
            <View style={styles.dashHeaderText}>
              <Text style={styles.dashHello}>Hello, User</Text>
              <Text style={styles.dashLocation}>Dhaka, Bangladesh</Text>
            </View>
            <TouchableOpacity style={styles.dashLogoutBtn} activeOpacity={0.7} onPress={() => setScreen('login')}>
              <Ionicons name="log-out-outline" size={22} color={GREEN.dark} />
              <Text style={styles.dashLogoutText}>Logout</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.dashSearchRow}>
            <View style={styles.dashSearchBox}>
              <Ionicons name="search" size={20} color="#94a3b8" />
              <TextInput
                style={styles.dashSearchInput}
                placeholder="Search..."
                placeholderTextColor="#94a3b8"
              />
            </View>
          </View>

          {/* Educational: Scholarship, Quiz, Result, Donation */}
          <View style={styles.dashEduGrid}>
            <TouchableOpacity style={styles.dashEduCard} activeOpacity={0.8}>
              <View style={styles.dashEduIconWrap}>
                <Ionicons name="school-outline" size={32} color={GREEN.dark} />
              </View>
              <Text style={styles.dashEduTitle}>Scholarship</Text>
              <Text style={styles.dashEduSub}>Programs & Apply</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.dashEduCard} activeOpacity={0.8}>
              <View style={styles.dashEduIconWrap}>
                <Ionicons name="help-circle-outline" size={32} color={GREEN.dark} />
              </View>
              <Text style={styles.dashEduTitle}>Quiz</Text>
              <Text style={styles.dashEduSub}>MCQ & Practice</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.dashEduCard} activeOpacity={0.8}>
              <View style={styles.dashEduIconWrap}>
                <Ionicons name="trophy-outline" size={32} color={GREEN.dark} />
              </View>
              <Text style={styles.dashEduTitle}>Result</Text>
              <Text style={styles.dashEduSub}>Scores & Merit</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.dashEduCard} activeOpacity={0.8}>
              <View style={styles.dashEduIconWrap}>
                <Ionicons name="heart-outline" size={32} color={GREEN.dark} />
              </View>
              <Text style={styles.dashEduTitle}>Donation</Text>
              <Text style={styles.dashEduSub}>Support & Give</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.dashSection}>
            <View style={styles.dashSectionHead}>
              <Text style={styles.dashSectionTitle}>Scholarship Programs</Text>
              <TouchableOpacity activeOpacity={0.7}>
                <Text style={styles.dashViewAll}>View All</Text>
              </TouchableOpacity>
            </View>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.dashCardScroll}>
              {[1, 2, 3].map((i) => (
                <TouchableOpacity key={i} style={styles.dashCard} activeOpacity={0.8}>
                  <View style={styles.dashCardBadge}>
                    <Ionicons name="school" size={18} color={GREEN.main} />
                  </View>
                  <View style={styles.dashCardPlaceholder} />
                  <Text style={styles.dashCardLabel}>Season 5</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          <View style={styles.dashSection}>
            <View style={styles.dashSectionHead}>
              <Text style={styles.dashSectionTitle}>Latest Results</Text>
              <TouchableOpacity activeOpacity={0.7}>
                <Text style={styles.dashViewAll}>View All</Text>
              </TouchableOpacity>
            </View>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.dashCardScroll}>
              {[1, 2, 3].map((i) => (
                <TouchableOpacity key={i} style={styles.dashCard} activeOpacity={0.8}>
                  <View style={styles.dashCardBadge}>
                    <Ionicons name="trophy" size={18} color={GREEN.main} />
                  </View>
                  <View style={styles.dashCardPlaceholder} />
                  <Text style={styles.dashCardLabel}>Merit List</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          <View style={{ height: 88 }} />
        </ScrollView>

        <View style={styles.bottomNav}>
          <BlurView intensity={60} tint="light" style={StyleSheet.absoluteFill} />
          <View style={styles.bottomNavInner}>
            <TouchableOpacity style={styles.navItem} activeOpacity={0.7}>
              <Ionicons name="home" size={24} color={GREEN.main} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.navItem} activeOpacity={0.7}>
              <Ionicons name="bag-outline" size={24} color="#64748b" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.navItem} activeOpacity={0.7}>
              <Ionicons name="person-outline" size={24} color="#64748b" />
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  }

  // Auth screens: Login & Register with new design
  const isLogin = authScreen === 'login';

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
          {/* Top section: bg image + overlay + back */}
          <View style={styles.authTopWrap}>
            <ImageBackground
              source={require('./assets/top-bg.jpg')}
              style={styles.authTopBg}
              resizeMode="cover"
            >
              <View style={styles.authTopOverlay} />
              <TouchableOpacity style={styles.authBackBtn} activeOpacity={0.8}>
                <Ionicons name="arrow-back" size={24} color="#fff" />
              </TouchableOpacity>
            </ImageBackground>
          </View>

          {/* Curved white panel - top & bottom same finish */}
          <View style={[styles.authPanel, styles.authPanelShadowBottom]}>
            {isLogin ? (
              <>
                <View style={styles.authTitleRow}>
                  <Text style={styles.authTitle}>Welcome Back</Text>
                  <Ionicons name="leaf" size={28} color={GREEN.main} />
                </View>
                <Text style={styles.authSubtitle}>Login to your account</Text>

                <View style={styles.authInputWrap}>
                  <Ionicons name="person-outline" size={20} color={GREEN.dark} />
                  <TextInput
                    style={styles.authInput}
                    placeholder="Full Name"
                    placeholderTextColor="#64748b"
                  />
                </View>
                <View style={styles.authInputWrap}>
                  <Ionicons name="lock-closed-outline" size={20} color={GREEN.dark} />
                  <TextInput
                    style={styles.authInput}
                    placeholder="Password"
                    placeholderTextColor="#64748b"
                    secureTextEntry={!showPassword}
                  />
                  <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                    <Ionicons name={showPassword ? 'eye-off-outline' : 'eye-outline'} size={20} color={GREEN.dark} />
                  </TouchableOpacity>
                </View>

                <View style={styles.authOptionsRow}>
                  <TouchableOpacity style={styles.authCheckRow} onPress={() => setRememberMe(!rememberMe)} activeOpacity={0.7}>
                    <View style={[styles.authCheckbox, rememberMe && styles.authCheckboxChecked]}>
                      {rememberMe && <Ionicons name="checkmark" size={16} color="#fff" />}
                    </View>
                    <Text style={styles.authCheckLabel}>Remember Me</Text>
                  </TouchableOpacity>
                  <TouchableOpacity activeOpacity={0.7}>
                    <Text style={styles.authForgot}>Forgot Password ?</Text>
                  </TouchableOpacity>
                </View>

                <Pressable onPressIn={onPressIn} onPressOut={onPressOut} onPress={() => setScreen('dashboard')}>
                  <Animated.View style={[styles.authMainBtn, { transform: [{ scale: buttonScale }] }]}>
                    <Text style={styles.authMainBtnText}>Login</Text>
                  </Animated.View>
                </Pressable>

                <View style={styles.authSwitchRow}>
                  <Text style={styles.authSwitchLabel}>Don't have account? </Text>
                  <TouchableOpacity onPress={() => setAuthScreen('register')} activeOpacity={0.7}>
                    <Text style={styles.authSwitchLink}>Sign up</Text>
                  </TouchableOpacity>
                </View>
              </>
            ) : (
              <>
                <View style={styles.authTitleRow}>
                  <Text style={styles.authTitle}>Register</Text>
                  <Ionicons name="leaf" size={28} color={GREEN.main} />
                </View>
                <Text style={styles.authSubtitle}>Create your new account</Text>

                <View style={styles.authInputWrap}>
                  <Ionicons name="person-outline" size={20} color={GREEN.dark} />
                  <TextInput
                    style={styles.authInput}
                    placeholder="Full Name"
                    placeholderTextColor="#64748b"
                  />
                </View>
                <View style={styles.authInputWrap}>
                  <Ionicons name="mail-outline" size={20} color={GREEN.dark} />
                  <TextInput
                    style={styles.authInput}
                    placeholder="user@mail.com"
                    placeholderTextColor="#64748b"
                    keyboardType="email-address"
                    autoCapitalize="none"
                  />
                </View>
                <View style={styles.authInputWrap}>
                  <Ionicons name="lock-closed-outline" size={20} color={GREEN.dark} />
                  <TextInput
                    style={styles.authInput}
                    placeholder="Password"
                    placeholderTextColor="#64748b"
                    secureTextEntry={!showPassword}
                  />
                  <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                    <Ionicons name={showPassword ? 'eye-off-outline' : 'eye-outline'} size={20} color={GREEN.dark} />
                  </TouchableOpacity>
                </View>

                <View style={styles.authOptionsRow}>
                  <TouchableOpacity style={styles.authCheckRow} onPress={() => setRememberMe(!rememberMe)} activeOpacity={0.7}>
                    <View style={[styles.authCheckbox, rememberMe && styles.authCheckboxChecked]}>
                      {rememberMe && <Ionicons name="checkmark" size={16} color="#fff" />}
                    </View>
                    <Text style={styles.authCheckLabel}>Remember Me</Text>
                  </TouchableOpacity>
                  <TouchableOpacity activeOpacity={0.7}>
                    <Text style={styles.authForgot}>Forgot Password ?</Text>
                  </TouchableOpacity>
                </View>

                <Pressable onPressIn={onPressIn} onPressOut={onPressOut} onPress={() => setScreen('dashboard')}>
                  <Animated.View style={[styles.authMainBtn, { transform: [{ scale: buttonScale }] }]}>
                    <Text style={styles.authMainBtnText}>Register</Text>
                  </Animated.View>
                </Pressable>

                <View style={styles.authOrRow}>
                  <View style={styles.authOrLine} />
                  <Text style={styles.authOrText}>Or continue with</Text>
                  <View style={styles.authOrLine} />
                </View>
                <View style={styles.authSocialRow}>
                  <TouchableOpacity style={styles.authSocialCircle} activeOpacity={0.8}>
                    <FontAwesome5 name="facebook-f" size={22} color="#1877F2" />
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.authSocialCircle} activeOpacity={0.8}>
                    <FontAwesome5 name="google" size={22} color="#4285F4" />
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.authSocialCircle} activeOpacity={0.8}>
                    <Ionicons name="logo-apple" size={26} color="#000" />
                  </TouchableOpacity>
                </View>

                <View style={styles.authSwitchRow}>
                  <Text style={styles.authSwitchLabel}>Already have an account? </Text>
                  <TouchableOpacity onPress={() => setAuthScreen('login')} activeOpacity={0.7}>
                    <Text style={styles.authSwitchLink}>Login</Text>
                  </TouchableOpacity>
                </View>
              </>
            )}
          </View>

          {/* Top 3 logos */}
          <View style={styles.logosRow}>
            <View style={styles.logoCard}>
              <LinearGradient colors={['#f0fdf4', '#dcfce7']} style={styles.logoCardGradient}>
                <Image source={require('./assets/logo.png')} style={styles.smallLogo} resizeMode="contain" />
              </LinearGradient>
            </View>
            <View style={styles.logoCard}>
              <LinearGradient colors={['#f0fdf4', '#dcfce7']} style={styles.logoCardGradient}>
                <Image source={require('./assets/logo-dmf.png')} style={styles.smallLogo} resizeMode="contain" />
              </LinearGradient>
            </View>
            <View style={styles.logoCard}>
              <LinearGradient colors={['#f0fdf4', '#dcfce7']} style={styles.logoCardGradient}>
                <Image source={require('./assets/logo-dmf-scholarship.png')} style={styles.smallLogo} resizeMode="contain" />
              </LinearGradient>
            </View>
          </View>

          {/* Gap between upper and lower logo rows */}
          <View style={styles.logosRowGap} />

          {/* Partner logos - bg color applied (use transparent PNG for best look) */}
          <View style={styles.logosRow}>
            <View style={styles.logoCardPartner}>
              <View style={styles.logoCardPartnerBg}>
                <Image source={require('./assets/logo-partner-soft.png')} style={styles.smallLogo} resizeMode="contain" />
              </View>
            </View>
            <View style={styles.logoCardPartner}>
              <View style={styles.logoCardPartnerBg}>
                <Image source={require('./assets/logo-partner-invest.png')} style={styles.smallLogo} resizeMode="contain" />
              </View>
            </View>
            <View style={styles.logoCardPartner}>
              <View style={styles.logoCardPartnerBg}>
                <Image source={require('./assets/logo-partner-youth.png')} style={styles.smallLogo} resizeMode="contain" />
              </View>
            </View>
          </View>

          <View style={styles.bottomSpacer} />
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  background: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#ffffff',
  },
  container: {
    flex: 1,
  },
  // Auth (Login/Register) new design
  authScrollContent: {
    paddingBottom: 40,
  },
  authTopWrap: {
    height: 200,
    width: '100%',
  },
  authTopBg: {
    flex: 1,
    width: '100%',
    justifyContent: 'flex-start',
  },
  authTopOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(22,101,52,0.75)',
  },
  authBackBtn: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 52 : 44,
    left: 20,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(220,252,231,0.95)',
    alignItems: 'center',
    justifyContent: 'center',
  },
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
  authPanelShadowBottom: {},
  authTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  authTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: '#166534',
    marginRight: 10,
  },
  authSubtitle: {
    fontSize: 15,
    color: '#64748b',
    marginBottom: 22,
  },
  authInputWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#dcfce7',
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
    color: '#166534',
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
    borderColor: '#16a34a',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  authCheckboxChecked: {
    backgroundColor: '#16a34a',
    borderColor: '#16a34a',
  },
  authCheckLabel: { fontSize: 14, color: '#475569' },
  authForgot: { fontSize: 14, color: '#16a34a', fontWeight: '600' },
  authMainBtn: {
    backgroundColor: '#166534',
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: 'center',
    marginBottom: 20,
  },
  authMainBtnText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '700',
  },
  authSwitchRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  authSwitchLabel: { fontSize: 15, color: '#64748b' },
  authSwitchLink: { fontSize: 15, color: '#16a34a', fontWeight: '700' },
  authOrRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  authOrLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#e2e8f0',
  },
  authOrText: {
    marginHorizontal: 12,
    fontSize: 14,
    color: '#94a3b8',
  },
  authSocialRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  authSocialCircle: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: '#f1f5f9',
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 12,
  },
  authSocialButtons: {
    paddingHorizontal: 24,
    marginTop: 8,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 4,
    marginBottom: 4,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(220,252,231,0.9)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#166534',
  },
  headerRight: {
    width: 40,
  },
  heroWrapper: {
    marginHorizontal: -20,
    marginTop: 8,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    overflow: 'hidden',
    shadowColor: '#059669',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 6,
  },
  gradient: {
    paddingTop: 16,
    paddingBottom: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroInner: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoWrapper: {
    alignItems: 'center',
  },
  logo: {
    width: 120,
    height: 92,
    marginBottom: 8,
  },
  logoTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#166534',
    letterSpacing: 0.5,
  },
  logoSubtitle: {
    fontSize: 10,
    color: '#15803d',
    letterSpacing: 1.2,
    marginTop: 2,
  },
  cardWrapper: {
    marginTop: -20,
    marginHorizontal: 16,
  },
  glassCard: {
    borderRadius: 24,
    overflow: 'hidden',
    backgroundColor: 'rgba(255,255,255,0.45)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.7)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.1,
    shadowRadius: 24,
    elevation: 12,
  },
  cardInner: {
    padding: 20,
    overflow: 'hidden',
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1e293b',
    marginBottom: 4,
  },
  createAccountRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
  },
  newUserText: {
    fontSize: 15,
    color: '#64748b',
  },
  createAccountLink: {
    fontSize: 15,
    color: '#16a34a',
    fontWeight: '600',
  },
  input: {
    backgroundColor: 'rgba(255,255,255,0.7)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.9)',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: '#1e293b',
    marginBottom: 10,
  },
  continueButton: {
    backgroundColor: '#16a34a',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 4,
    marginBottom: 14,
  },
  continueButtonText: {
    color: '#ffffff',
    fontSize: 17,
    fontWeight: '600',
  },
  orRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
  },
  orLine: {
    flex: 1,
    height: 1,
    backgroundColor: 'rgba(0,0,0,0.08)',
  },
  orText: {
    marginHorizontal: 12,
    fontSize: 14,
    color: '#94a3b8',
    fontWeight: '500',
  },
  socialButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.6)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.8)',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginBottom: 10,
  },
  socialIconWrap: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.9)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  socialIcon: {
    fontSize: 16,
    fontWeight: '700',
    color: '#475569',
  },
  socialButtonText: {
    fontSize: 16,
    color: '#334155',
    fontWeight: '500',
  },
  logosRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 28,
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  logosRowGap: {
    height: 16,
    width: '100%',
  },
  logoCard: {
    width: 80,
    height: 80,
    marginHorizontal: 10,
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#166534',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 6,
  },
  logoCardGradient: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 20,
    padding: 8,
  },
  logoCardPartner: {
    width: 80,
    height: 80,
    marginHorizontal: 10,
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#166534',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 6,
  },
  logoCardPartnerBg: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 20,
    padding: 8,
    backgroundColor: '#f0fdf4',
  },
  smallLogo: {
    width: 64,
    height: 64,
  },
  bottomSpacer: {
    height: 24,
  },
  bottomNav: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 64,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    overflow: 'hidden',
    backgroundColor: 'rgba(255,255,255,0.5)',
    borderTopWidth: 1,
    borderLeftWidth: 1,
    borderRightWidth: 1,
    borderColor: 'rgba(255,255,255,0.7)',
  },
  bottomNavInner: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingHorizontal: 40,
  },
  navItem: {
    padding: 8,
  },
  // Dashboard
  dashScroll: { flex: 1 },
  dashScrollContent: {
    paddingTop: Platform.OS === 'ios' ? 56 : 48,
    paddingHorizontal: 20,
  },
  dashHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  dashMenuBtn: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#dcfce7',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
    shadowColor: '#166534',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  dashHeaderText: { flex: 1 },
  dashHello: {
    fontSize: 20,
    fontWeight: '700',
    color: '#166534',
  },
  dashLocation: {
    fontSize: 14,
    color: '#15803d',
    marginTop: 2,
  },
  dashLogoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(254,226,226,0.9)',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 12,
  },
  dashLogoutText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#166534',
    marginLeft: 6,
  },
  dashSearchRow: { marginBottom: 22 },
  dashSearchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 16,
    paddingHorizontal: 18,
    paddingVertical: 14,
    borderWidth: 1.5,
    borderColor: '#bbf7d0',
    shadowColor: '#166534',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  dashSearchInput: {
    flex: 1,
    marginLeft: 12,
    fontSize: 16,
    color: '#166534',
    paddingVertical: 0,
  },
  dashEduGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  dashEduCard: {
    width: '48%',
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 18,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#dcfce7',
    shadowColor: '#166534',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 4,
  },
  dashEduIconWrap: {
    width: 56,
    height: 56,
    borderRadius: 16,
    backgroundColor: '#dcfce7',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  dashEduTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#166534',
    marginBottom: 2,
  },
  dashEduSub: {
    fontSize: 12,
    color: '#16a34a',
    fontWeight: '500',
  },
  dashSection: { marginBottom: 24 },
  dashSectionHead: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  dashSectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#166534',
  },
  dashViewAll: {
    fontSize: 14,
    fontWeight: '600',
    color: '#16a34a',
  },
  dashCardScroll: { marginHorizontal: -20 },
  dashCard: {
    width: 160,
    marginLeft: 20,
    borderRadius: 18,
    backgroundColor: '#ffffff',
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#dcfce7',
    shadowColor: '#166534',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  dashCardBadge: {
    position: 'absolute',
    top: 10,
    right: 10,
    zIndex: 1,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#dcfce7',
    alignItems: 'center',
    justifyContent: 'center',
  },
  dashCardPlaceholder: {
    height: 100,
    backgroundColor: '#f0fdf4',
  },
  dashCardLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#166534',
    paddingVertical: 10,
    paddingHorizontal: 12,
  },
});
