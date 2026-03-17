import { StatusBar } from 'expo-status-bar';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { GREEN, NEUTRAL } from '../theme/colors';
import { useAuth } from '../context/AuthContext';
import BottomNav from '../components/BottomNav';

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

function getInitials(me) {
  return (
    `${me?.firstName || ''} ${me?.lastName || ''}`
      .trim()
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((s) => s[0]?.toUpperCase())
      .join('') || 'U'
  );
}

function Row({ icon, title, subtitle, onPress }) {
  return (
    <TouchableOpacity style={styles.row} activeOpacity={0.75} onPress={onPress}>
      <View style={styles.rowIcon}>
        <Ionicons name={icon} size={18} color={GREEN.dark} />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={styles.rowTitle}>{title}</Text>
        {!!subtitle && <Text style={styles.rowSub}>{subtitle}</Text>}
      </View>
      <Ionicons name="chevron-forward" size={18} color={NEUTRAL.subtext} />
    </TouchableOpacity>
  );
}

export default function ProfileScreen({ navigation }) {
  const { me, logout, isBusy } = useAuth();
  const avatarUri = getAvatarUri(me);
  const initials = getInitials(me);

  const fullName = `${me?.firstName || ''} ${me?.lastName || ''}`.trim() || me?.username || 'User';
  const email = me?.email || '';
  const username = me?.username ? `@${me.username}` : '';

  return (
    <View style={styles.screen}>
      <StatusBar style="light" />

      <View style={styles.top}>
        <View style={styles.topBgBubble} />
        <View style={styles.topInner}>
          <View style={styles.topRow}>
            <TouchableOpacity style={styles.iconBtn} activeOpacity={0.7} onPress={() => navigation.navigate('Menu')}>
              <Ionicons name="menu" size={22} color="#fff" />
            </TouchableOpacity>
            <Text style={styles.topTitle}>Profile</Text>
            <TouchableOpacity style={styles.iconBtn} activeOpacity={0.7} onPress={() => navigation.goBack()}>
              <Ionicons name="chevron-back" size={22} color="#fff" />
            </TouchableOpacity>
          </View>

          <View style={styles.profileCard}>
            <View style={styles.avatarWrap}>
              {avatarUri ? (
                <Image source={{ uri: avatarUri }} style={styles.avatarImg} />
              ) : (
                <View style={styles.avatarFallback}>
                  <Text style={styles.avatarInitials}>{initials}</Text>
                </View>
              )}
            </View>

            <View style={{ flex: 1 }}>
              <Text style={styles.name}>{fullName}</Text>
              {!!username && <Text style={styles.handle}>{username}</Text>}
              {!!email && <Text style={styles.email}>{email}</Text>}
            </View>
          </View>
        </View>
      </View>

      <View style={styles.sheet}>
        <Text style={styles.sectionLabel}>Profile</Text>
        <Row icon="person-outline" title="Edit profile" subtitle="Name, photo, contact" onPress={() => navigation.navigate('EditProfile')} />
        <Row icon="key-outline" title="Change password" subtitle="Update your password" onPress={() => navigation.navigate('ChangePassword')} />
        <Row icon="shield-checkmark-outline" title="Security" subtitle="Login sessions" onPress={() => {}} />
        <View style={{ height: 92 }} />
      </View>
      <BottomNav navigation={navigation} active="profile" />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: GREEN.bg },
  top: { height: 280, backgroundColor: GREEN.dark, overflow: 'hidden' },
  topBgBubble: {
    position: 'absolute',
    width: 320,
    height: 320,
    borderRadius: 160,
    backgroundColor: 'rgba(34,197,94,0.28)',
    top: -140,
    right: -110,
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
  topTitle: { color: '#fff', fontWeight: '900', fontSize: 18 },

  profileCard: {
    marginTop: 18,
    backgroundColor: 'rgba(255,255,255,0.14)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.18)',
    borderRadius: 22,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarWrap: {
    width: 64,
    height: 64,
    borderRadius: 32,
    overflow: 'hidden',
    backgroundColor: 'rgba(255,255,255,0.16)',
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.75)',
    marginRight: 14,
  },
  avatarImg: { width: '100%', height: '100%', resizeMode: 'cover', borderRadius: 32 },
  avatarFallback: { width: '100%', height: '100%', alignItems: 'center', justifyContent: 'center' },
  avatarInitials: { color: '#fff', fontWeight: '900', fontSize: 18, letterSpacing: 0.5 },
  name: { color: '#fff', fontWeight: '900', fontSize: 18 },
  handle: { color: 'rgba(234,255,240,0.95)', fontWeight: '800', marginTop: 2, fontSize: 12 },
  email: { color: 'rgba(234,255,240,0.85)', fontWeight: '700', marginTop: 2, fontSize: 12 },

  sheet: {
    flex: 1,
    marginTop: -28,
    backgroundColor: '#fff',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingTop: 18,
    paddingHorizontal: 20,
    minHeight: 600,
  },
  sectionLabel: { color: NEUTRAL.subtext, fontWeight: '800', fontSize: 12, marginBottom: 10 },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 12,
    borderRadius: 16,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: GREEN.pale,
    marginBottom: 10,
  },
  rowIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: GREEN.pale,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  rowTitle: { color: GREEN.dark, fontWeight: '900', fontSize: 14 },
  rowSub: { color: NEUTRAL.subtext, fontWeight: '700', fontSize: 12, marginTop: 2 },
});

