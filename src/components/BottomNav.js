import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import { GREEN } from '../theme/colors';

export default function BottomNav({ navigation, active = 'home' }) {
  return (
    <View style={styles.bottomNav}>
      <BlurView intensity={60} tint="light" style={StyleSheet.absoluteFill} />
      <View style={styles.bottomNavInner}>
        <TouchableOpacity
          style={styles.navItem}
          activeOpacity={0.7}
          onPress={() => navigation.navigate('Dashboard')}
        >
          <Ionicons name="home" size={24} color={active === 'home' ? GREEN.main : '#64748b'} />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.navItem}
          activeOpacity={0.7}
          onPress={() => navigation.navigate('Prayer')}
        >
          <Ionicons name="time-outline" size={24} color={active === 'prayer' ? GREEN.main : '#64748b'} />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.navItem}
          activeOpacity={0.7}
          onPress={() => navigation.navigate('Results')}
        >
          <Ionicons name="trophy-outline" size={24} color={active === 'results' ? GREEN.main : '#64748b'} />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.navItem}
          activeOpacity={0.7}
          onPress={() => navigation.navigate('Dua')}
        >
          <Ionicons name="book-outline" size={24} color={active === 'dua' ? GREEN.main : '#64748b'} />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.navItem}
          activeOpacity={0.7}
          onPress={() => navigation.navigate('Profile')}
        >
          <Ionicons name="person-outline" size={24} color={active === 'profile' ? GREEN.main : '#64748b'} />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
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
  navItem: { padding: 8 },
});

