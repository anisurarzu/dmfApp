import { StatusBar } from 'expo-status-bar';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
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

function MenuRow({ icon, label, sub, onPress }) {
  return (
    <TouchableOpacity style={styles.row} activeOpacity={0.75} onPress={onPress}>
      <View style={styles.rowIcon}>
        <Ionicons name={icon} size={18} color={GREEN.dark} />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={styles.rowTitle}>{label}</Text>
        {!!sub && <Text style={styles.rowSub}>{sub}</Text>}
      </View>
      <Ionicons name="chevron-forward" size={18} color={NEUTRAL.subtext} />
    </TouchableOpacity>
  );
}

export default function MenuScreen({ navigation }) {
  const { logout, isBusy } = useAuth();

  return (
    <View style={styles.screen}>
      <StatusBar style="dark" />

      <View style={styles.top}>
        <View style={styles.topRow}>
          <TouchableOpacity style={styles.iconBtn} activeOpacity={0.7} onPress={() => navigation.goBack()}>
            <Ionicons name="chevron-back" size={22} color={GREEN.dark} />
          </TouchableOpacity>
          <Text style={styles.topTitle}>Menu</Text>
          <View style={{ width: 44 }} />
        </View>
      </View>

      <ScrollView style={styles.scroll} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.sheet}>
          <Text style={styles.sectionLabel}>Navigation</Text>
          <MenuRow icon="person-outline" label="Profile" sub="View & edit your details" onPress={() => navigation.navigate('Profile')} />
          <MenuRow icon="settings-outline" label="Settings" sub="App preferences" onPress={() => {}} />
          <MenuRow icon="school-outline" label="Scholarship" sub="Programs & applications" onPress={() => {}} />
          <MenuRow icon="heart-outline" label="Donation" sub="Give & support" onPress={() => {}} />

          <View style={{ height: 18 }} />
          <Text style={styles.sectionLabel}>Support</Text>
          <MenuRow icon="help-circle-outline" label="Help & Support" sub="Get help" onPress={() => {}} />

          <View style={{ height: 22 }} />
          <TouchableOpacity
            style={[styles.logoutBtn, isBusy && { opacity: 0.75 }]}
            activeOpacity={0.85}
            onPress={logout}
            disabled={isBusy}
          >
            <Ionicons name="log-out-outline" size={20} color="#fff" />
            <Text style={styles.logoutText}>{isBusy ? 'Logging out…' : 'Logout'}</Text>
          </TouchableOpacity>

          <View style={{ height: 92 }} />
        </View>
      </ScrollView>
      <BottomNav navigation={navigation} />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#ffffff' },
  top: {
    backgroundColor: '#ffffff',
    paddingTop: 56,
    paddingHorizontal: 20,
    paddingBottom: 12,
  },
  topRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  iconBtn: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: GREEN.bg,
    borderWidth: 1,
    borderColor: GREEN.pale,
    alignItems: 'center',
    justifyContent: 'center',
  },
  topTitle: { color: GREEN.dark, fontWeight: '900', fontSize: 18 },

  scroll: { flex: 1 },
  content: { paddingHorizontal: 0, paddingTop: 0 },
  sheet: {
    flex: 1,
    backgroundColor: '#fff',
    paddingTop: 14,
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
  logoutBtn: {
    height: 52,
    borderRadius: 18,
    backgroundColor: '#dc2626',
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  logoutText: { color: '#fff', fontWeight: '900', fontSize: 16, marginLeft: 10 },
});

