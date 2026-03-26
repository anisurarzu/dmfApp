import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { GREEN } from '../theme/colors';

/**
 * Bottom bar with a raised center action (QR / barcode scan).
 * Side tabs: Home, Prayer, Menu, Profile.
 */
export default function BottomNav({ navigation, active = 'home' }) {
  const insets = useSafeAreaInsets();
  const bottomPad = Math.max(insets.bottom, 10);

  const goScan = () => {
    navigation.navigate('Scan');
  };

  return (
    <View style={[styles.root, { paddingBottom: bottomPad }]} accessibilityRole="tablist">
      <BlurView intensity={72} tint="light" style={StyleSheet.absoluteFill} />
      <View style={styles.barRow}>
        <TouchableOpacity
          style={styles.navItem}
          activeOpacity={0.7}
          onPress={() => navigation.navigate('Dashboard')}
          accessibilityRole="tab"
          accessibilityState={{ selected: active === 'home' }}
        >
          <Ionicons name={active === 'home' ? 'home' : 'home-outline'} size={24} color={active === 'home' ? GREEN.main : '#64748b'} />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.navItem}
          activeOpacity={0.7}
          onPress={() => navigation.navigate('Prayer')}
          accessibilityRole="tab"
          accessibilityState={{ selected: active === 'prayer' }}
        >
          <Ionicons name={active === 'prayer' ? 'time' : 'time-outline'} size={24} color={active === 'prayer' ? GREEN.main : '#64748b'} />
        </TouchableOpacity>
        <View style={styles.fabSlot} />
        <TouchableOpacity
          style={styles.navItem}
          activeOpacity={0.7}
          onPress={() => navigation.navigate('Menu')}
          accessibilityRole="tab"
          accessibilityState={{ selected: active === 'menu' }}
        >
          <Ionicons name={active === 'menu' ? 'list' : 'list-outline'} size={24} color={active === 'menu' ? GREEN.main : '#64748b'} />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.navItem}
          activeOpacity={0.7}
          onPress={() => navigation.navigate('Profile')}
          accessibilityRole="tab"
          accessibilityState={{ selected: active === 'profile' }}
        >
          <Ionicons name={active === 'profile' ? 'person' : 'person-outline'} size={24} color={active === 'profile' ? GREEN.main : '#64748b'} />
        </TouchableOpacity>
      </View>

      <TouchableOpacity
        style={[styles.fab, { bottom: bottomPad + 18 }]}
        activeOpacity={0.88}
        onPress={goScan}
        accessibilityLabel="Scan QR code"
        accessibilityRole="button"
      >
        <View style={styles.fabInner}>
          <Ionicons name="scan-outline" size={26} color="#ffffff" />
        </View>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    minHeight: 62,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    overflow: 'visible',
    backgroundColor: '#ffffff',
    borderTopWidth: 1,
    borderLeftWidth: 1,
    borderRightWidth: 1,
    borderColor: '#bbf7d0',
    zIndex: 200,
    shadowColor: '#14532d',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 200,
  },
  barRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingTop: 10,
    minHeight: 52,
  },
  navItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 6,
  },
  fabSlot: {
    width: 72,
  },
  fab: {
    position: 'absolute',
    left: '50%',
    marginLeft: -36,
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: GREEN.main,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: GREEN.dark,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.35,
    shadowRadius: 16,
    elevation: 16,
  },
  fabInner: {
    width: 44,
    height: 44,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.95)',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
