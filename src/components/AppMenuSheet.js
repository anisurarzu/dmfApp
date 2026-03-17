import { useEffect, useMemo, useRef } from 'react';
import { Animated, Image, Pressable, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { GREEN } from '../theme/colors';

export default function AppMenuSheet({
  isOpen,
  onClose,
  navigation,
  me,
  avatarUri,
  initials,
  isBusy,
  onLogout,
  items,
}) {
  const anim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (isOpen) {
      Animated.timing(anim, { toValue: 1, duration: 240, useNativeDriver: true }).start();
    } else {
      Animated.timing(anim, { toValue: 0, duration: 200, useNativeDriver: true }).start();
    }
  }, [isOpen, anim]);

  const overlayOpacity = anim.interpolate({ inputRange: [0, 1], outputRange: [0, 0.38] });
  const translateY = anim.interpolate({ inputRange: [0, 1], outputRange: [-520, 0] });

  const safeItems = useMemo(() => items || [], [items]);

  if (!isOpen) return null;

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="box-none">
      <Pressable style={StyleSheet.absoluteFill} onPress={onClose}>
        <Animated.View style={[StyleSheet.absoluteFill, { backgroundColor: '#000', opacity: overlayOpacity }]} />
      </Pressable>

      <Animated.View style={[styles.drawer, { transform: [{ translateY }] }]}>
        <View style={styles.drawerHeader}>
          <View style={styles.drawerAvatar}>
            {avatarUri ? (
              <Image source={{ uri: avatarUri }} style={styles.drawerAvatarImg} />
            ) : (
              <Text style={styles.drawerAvatarText}>{initials || 'U'}</Text>
            )}
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.drawerName}>
              {me?.firstName ? `${me.firstName}${me?.lastName ? ` ${me.lastName}` : ''}` : me?.username || 'User'}
            </Text>
            {!!me?.email && <Text style={styles.drawerSub}>{me.email}</Text>}
          </View>
          <TouchableOpacity style={styles.drawerClose} activeOpacity={0.7} onPress={onClose}>
            <Ionicons name="close" size={20} color="#0f172a" />
          </TouchableOpacity>
        </View>

        <ScrollView style={{ flex: 1 }} contentContainerStyle={styles.drawerSection} showsVerticalScrollIndicator={false}>
          <Text style={styles.drawerLabel}>Menu</Text>

          {safeItems.map((it) => (
            <TouchableOpacity
              key={it.key}
              style={styles.drawerItem}
              activeOpacity={0.78}
              onPress={() => {
                onClose?.();
                if (it?.to) navigation?.navigate?.(it.to);
                else it?.onPress?.();
              }}
              disabled={!!it?.disabled}
            >
              <View style={styles.drawerItemIcon}>
                <Ionicons name={it.icon} size={18} color={GREEN.dark} />
              </View>
              <Text style={styles.drawerItemText}>{it.label}</Text>
              <Ionicons name="chevron-forward" size={18} color="#94a3b8" />
            </TouchableOpacity>
          ))}
        </ScrollView>

        <View style={styles.drawerFooter}>
          <TouchableOpacity
            style={[styles.drawerLogout, isBusy && { opacity: 0.7 }]}
            activeOpacity={0.85}
            onPress={() => {
              onClose?.();
              onLogout?.();
            }}
            disabled={isBusy}
          >
            <Ionicons name="log-out-outline" size={18} color="#fff" />
            <Text style={styles.drawerLogoutText}>{isBusy ? 'Please wait…' : 'Logout'}</Text>
          </TouchableOpacity>
          <Text style={styles.drawerFootNote}>Darul Muttaquine Foundation</Text>
        </View>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  drawer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 520,
    backgroundColor: '#fff',
    paddingTop: 54,
    paddingHorizontal: 16,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  drawerHeader: { flexDirection: 'row', alignItems: 'center', paddingBottom: 16 },
  drawerAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: GREEN.pale,
    borderWidth: 1,
    borderColor: 'rgba(22,163,74,0.25)',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    marginRight: 12,
  },
  drawerAvatarImg: { width: '100%', height: '100%', resizeMode: 'cover', borderRadius: 22 },
  drawerAvatarText: { color: GREEN.dark, fontWeight: '900' },
  drawerName: { color: '#0f172a', fontWeight: '900', fontSize: 14 },
  drawerSub: { color: '#64748b', fontWeight: '700', fontSize: 12, marginTop: 2 },
  drawerClose: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: '#f1f5f9',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
  },
  drawerSection: { paddingTop: 6, paddingBottom: 14 },
  drawerLabel: { color: '#64748b', fontWeight: '900', fontSize: 12, marginBottom: 12, paddingHorizontal: 2 },
  drawerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 10,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: GREEN.pale,
    backgroundColor: '#fff',
    marginBottom: 10,
  },
  drawerItemIcon: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: GREEN.pale,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  drawerItemText: { flex: 1, color: GREEN.dark, fontWeight: '900', fontSize: 14 },
  drawerFooter: { paddingBottom: 18, paddingTop: 10 },
  drawerLogout: {
    height: 48,
    borderRadius: 16,
    backgroundColor: GREEN.dark,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  drawerLogoutText: { color: '#fff', fontWeight: '900', marginLeft: 10 },
  drawerFootNote: { marginTop: 10, color: '#94a3b8', fontWeight: '800', fontSize: 11 },
});

