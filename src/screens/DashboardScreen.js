import { StatusBar } from 'expo-status-bar';
import { useRef, useState } from 'react';
import { Dimensions, Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { GREEN } from '../theme/colors';
import { useAuth } from '../context/AuthContext';
import BottomNav from '../components/BottomNav';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const EDU_CARD_WIDTH = (SCREEN_WIDTH - 40 - 12) / 2; // 40 = sheet horizontal padding, 12 = gap between cards

export default function DashboardScreen({ navigation }) {
  const { me, logout, isBusy } = useAuth();

  const avatarUri =
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
    null;

  const initials =
    `${me?.firstName || ''} ${me?.lastName || ''}`
      .trim()
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((s) => s[0]?.toUpperCase())
      .join('') || 'U';

  return (
    <View style={styles.screen}>
      <StatusBar style="light" />

      <View style={styles.top}>
        <View style={styles.topBgBubble} />
        <View style={styles.topInner}>
          <View style={styles.topRow}>
            <TouchableOpacity
              style={[styles.iconBtn, styles.menuBtn]}
              activeOpacity={0.75}
              onPress={() => navigation.navigate('Menu')}
            >
              <Ionicons name="menu" size={22} color="#fff" />
            </TouchableOpacity>

            <TouchableOpacity style={styles.avatarBtn} activeOpacity={0.8} onPress={() => navigation.navigate('Profile')}>
              {avatarUri ? (
                <Image source={{ uri: avatarUri }} style={styles.avatarImg} />
              ) : (
                <View style={styles.avatarFallback}>
                  <Text style={styles.avatarInitials}>{initials}</Text>
                </View>
              )}
            </TouchableOpacity>
          </View>

          <Text style={styles.topTitle}>Support education. Change lives.</Text>
          <Text style={styles.topSubtitle}>
            Welcome{me?.firstName ? `, ${me.firstName}` : ''} — explore scholarships, results, and ways to help.
          </Text>

          <View style={styles.pillRow}>
            <TouchableOpacity style={styles.pill} activeOpacity={0.85}>
              <Ionicons name="sparkles-outline" size={18} color="#eafff0" />
              <Text style={styles.pillText}>Quick actions</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.logoutMini}
              activeOpacity={0.85}
              onPress={logout}
              disabled={isBusy}
            >
              <Ionicons name="log-out-outline" size={18} color="#fff" />
            </TouchableOpacity>
          </View>
        </View>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.sheet}>
          <View style={styles.section}>
            <View style={styles.eduWrap}>
              <View style={[styles.sectionHead, styles.eduHead]}>
                <Text style={styles.sectionTitle}>Education</Text>
                <TouchableOpacity activeOpacity={0.7}>
                  <Text style={styles.viewAll}>View All</Text>
                </TouchableOpacity>
              </View>

              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.eduScroll}
              >
                {[
                  { key: 'scholarship', title: 'Scholarships', sub: 'Apply & track', icon: 'school' },
                  { key: 'quiz', title: 'Practice', sub: 'Quiz & MCQ', icon: 'help-circle' },
                  { key: 'result', title: 'Results', sub: 'Merit list', icon: 'trophy' },
                  { key: 'library', title: 'Resources', sub: 'Notes & guides', icon: 'book' },
                ].map((item, index, arr) => (
                  <TouchableOpacity
                    key={item.key}
                    style={[
                      styles.eduCardH,
                      index === arr.length - 1 && { marginRight: 0 },
                    ]}
                    activeOpacity={0.85}
                    onPress={() => {
                      if (item.key === 'result') navigation.navigate('Results');
                    }}
                  >
                    {item.key === 'scholarship' ? (
                      <View style={styles.eduImgH}>
                        <Image
                          source={require('../../assets/logo-dmf-scholarship.png')}
                          style={styles.eduImgLogo}
                          resizeMode="contain"
                        />
                      </View>
                    ) : item.key === 'quiz' ? (
                      <View style={styles.eduImgH}>
                        <Image
                          source={require('../../assets/quize-icon.png')}
                          style={styles.eduImgLogo}
                          resizeMode="contain"
                        />
                      </View>
                    ) : item.key === 'result' ? (
                      <View style={styles.eduImgH}>
                        <Image
                          source={require('../../assets/result.png')}
                          style={styles.eduImgLogo}
                          resizeMode="contain"
                        />
                      </View>
                    ) : item.key === 'library' ? (
                      <View style={styles.eduImgH}>
                        <Image
                          source={require('../../assets/learning.png')}
                          style={styles.eduImgLogo}
                          resizeMode="contain"
                        />
                      </View>
                    ) : (
                      <View style={styles.eduImgH} />
                    )}
                    <View style={styles.popMeta}>
                      <View style={styles.popIcon}>
                        <Ionicons name={item.icon} size={16} color={GREEN.dark} />
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text style={styles.popTitle}>{item.title}</Text>
                        <Text style={styles.popSub}>{item.sub}</Text>
                      </View>
                    </View>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          </View>

          <View style={styles.section}>
            <View style={styles.sectionHead}>
              <Text style={styles.sectionTitle}>Charity</Text>
              <TouchableOpacity activeOpacity={0.7}>
                <Text style={styles.viewAll}>View All</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.popGrid}>
              {[
                { key: 'donation', title: 'Donate', sub: 'Zakat • Sadaqah • Fund', icon: 'heart' },
                { key: 'programs', title: 'Campaigns', sub: 'Urgent needs', icon: 'megaphone' },
              ].map((item) => (
                <TouchableOpacity key={item.key} style={styles.popCard} activeOpacity={0.85}>
                  <View style={styles.popImg}>
                    {item.key === 'donation' && (
                      <Image
                        source={require('../../assets/donation.png')}
                        style={styles.popImgAsset}
                        resizeMode="contain"
                      />
                    )}
                  </View>
                  <View style={styles.popMeta}>
                    <View style={styles.popIcon}>
                      <Ionicons name={item.icon} size={16} color={GREEN.dark} />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.popTitle}>{item.title}</Text>
                      <Text style={styles.popSub}>{item.sub}</Text>
                    </View>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.section}>
            <View style={styles.sectionHead}>
              <Text style={styles.sectionTitle}>Community</Text>
              <TouchableOpacity activeOpacity={0.7} onPress={() => navigation.navigate('Profile')}>
                <Text style={styles.viewAll}>Profile</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.communityCard}>
              <View style={styles.communityIcon}>
                <Ionicons name="people" size={18} color={GREEN.dark} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.communityTitle}>Be part of the mission</Text>
                <Text style={styles.communitySub}>
                  Keep your profile updated and follow your scholarship & donation activity.
                </Text>
              </View>
              <TouchableOpacity style={styles.communityCta} activeOpacity={0.8} onPress={() => navigation.navigate('Profile')}>
                <Text style={styles.communityCtaText}>Open</Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={{ height: 92 }} />
        </View>
      </ScrollView>

      <BottomNav navigation={navigation} active="home" />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: GREEN.bg },
  top: {
    height: 240,
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
    left: -90,
  },
  topInner: { flex: 1, paddingTop: 56, paddingHorizontal: 20 },
  topRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  iconBtn: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.16)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuBtn: {
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.22)',
  },
  avatarBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    overflow: 'hidden',
    backgroundColor: 'rgba(255,255,255,0.16)',
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.75)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarImg: { width: '100%', height: '100%', resizeMode: 'cover', borderRadius: 22 },
  avatarFallback: { width: '100%', height: '100%', alignItems: 'center', justifyContent: 'center' },
  avatarInitials: { color: '#ffffff', fontWeight: '900', fontSize: 14, letterSpacing: 0.4 },
  topTitle: { marginTop: 16, fontSize: 22, fontWeight: '900', color: '#ffffff', maxWidth: 300 },
  topSubtitle: {
    marginTop: 8,
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '700',
    color: 'rgba(234,255,240,0.9)',
    maxWidth: 320,
  },
  pillRow: { flexDirection: 'row', alignItems: 'center', marginTop: 16 },
  pill: {
    flex: 1,
    height: 46,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.16)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.18)',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    marginRight: 12,
  },
  pillText: { flex: 1, color: '#eafff0', fontWeight: '800', marginLeft: 10, fontSize: 14 },
  logoutMini: {
    width: 44,
    height: 46,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.16)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.18)',
    alignItems: 'center',
    justifyContent: 'center',
  },

  scroll: { flex: 1 },
  content: { paddingHorizontal: 0, paddingTop: 0 },
  sheet: {
    marginTop: -18,
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingTop: 22,
    paddingHorizontal: 20,
    minHeight: 600,
    // subtle top edge shadow + clean rounded cut
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 4,
  },
  section: { marginBottom: 26 },
  sectionHead: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  sectionTitle: { fontSize: 18, fontWeight: '900', color: GREEN.dark },
  viewAll: { fontSize: 14, fontWeight: '800', color: GREEN.main },
  eduWrap: {
    borderRadius: 22,
    overflow: 'hidden',
    backgroundColor: '#ffffff',
  },
  eduHead: { paddingHorizontal: 2, paddingTop: 2, marginBottom: 8 },
  dealCard: {
    borderRadius: 18,
    backgroundColor: '#ffffff',
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#dcfce7',
    shadowColor: '#0f172a',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 4,
  },
  dealCardTop: { height: 110, backgroundColor: '#ffffff', padding: 12 },
  dealHero: { position: 'absolute', right: 10, bottom: -10 },
  dealBadge: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#dcfce7',
    alignItems: 'center',
    justifyContent: 'center',
  },
  dealCardBottom: { paddingHorizontal: 12, paddingVertical: 12 },
  dealTitle: { fontSize: 15, fontWeight: '900', color: GREEN.dark },
  dealSub: { fontSize: 12, fontWeight: '700', color: '#16a34a', marginTop: 2 },

  popGrid: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 6 },
  eduScroll: { paddingTop: 6, paddingBottom: 2, paddingRight: 8 },
  popCard: {
    width: '48%',
    borderRadius: 18,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#dcfce7',
    overflow: 'hidden',
  },
  popImg: {
    height: 120,
    backgroundColor: GREEN.bg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  popImgAsset: { width: 120, height: 80 },
  eduCardH: {
    width: EDU_CARD_WIDTH,
    borderRadius: 18,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#dcfce7',
    overflow: 'hidden',
    marginRight: 12,
  },
  eduImgH: {
    height: 120,
    backgroundColor: GREEN.bg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  eduImgLogo: {
    width: 120,
    height: 80,
  },
  popMeta: { flexDirection: 'row', alignItems: 'center', padding: 12 },
  popIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#dcfce7',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  popTitle: { fontSize: 13, fontWeight: '900', color: GREEN.dark },
  popSub: { fontSize: 11, fontWeight: '700', color: '#16a34a', marginTop: 2 },

  communityCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 18,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#dcfce7',
    padding: 14,
    shadowColor: '#0f172a',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.06,
    shadowRadius: 14,
    elevation: 3,
  },
  communityIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#dcfce7',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  communityTitle: { fontSize: 14, fontWeight: '900', color: GREEN.dark },
  communitySub: { fontSize: 12, fontWeight: '700', color: '#64748b', marginTop: 2, lineHeight: 16 },
  communityCta: {
    height: 36,
    paddingHorizontal: 14,
    borderRadius: 14,
    backgroundColor: GREEN.dark,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 12,
  },
  communityCtaText: { color: '#fff', fontWeight: '900', fontSize: 13 },

});

