import { useCallback, useRef, useState } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import {
  ActivityIndicator,
  Linking,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { GREEN, NEUTRAL } from '../theme/colors';

/** iOS: QR + common retail codes; Android: full ML Kit set. */
const BARCODE_TYPES =
  Platform.OS === 'ios'
    ? ['qr', 'ean13', 'ean8', 'code128', 'code39', 'pdf417', 'datamatrix', 'upc_a', 'upc_e']
    : ['qr', 'ean13', 'ean8', 'code128', 'code39', 'upc_a', 'upc_e', 'pdf417', 'aztec', 'datamatrix', 'codabar', 'itf14', 'code93'];

const SCAN_DEBOUNCE_MS = 1800;

function looksLikeUrl(s) {
  if (!s || typeof s !== 'string') return false;
  const t = s.trim();
  return /^https?:\/\//i.test(t) || /^www\./i.test(t);
}

export default function ScanScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(null);
  const [torch, setTorch] = useState(false);
  const lastScanRef = useRef({ at: 0, data: '' });

  useFocusEffect(
    useCallback(() => {
      setScanned(null);
      lastScanRef.current = { at: 0, data: '' };
    }, [])
  );

  const handleBarcodeScanned = useCallback(
    ({ data, type }) => {
      const raw = String(data || '').trim();
      if (!raw) return;
      const now = Date.now();
      if (lastScanRef.current.data === raw && now - lastScanRef.current.at < SCAN_DEBOUNCE_MS) {
        return;
      }
      lastScanRef.current = { at: now, data: raw };
      setScanned({ data: raw, type: type || 'unknown' });
    },
    []
  );

  const openIfLink = useCallback(async () => {
    if (!scanned?.data) return;
    let url = scanned.data.trim();
    if (/^www\./i.test(url)) url = `https://${url}`;
    if (!/^https?:\/\//i.test(url)) return;
    try {
      const can = await Linking.canOpenURL(url);
      if (can) await Linking.openURL(url);
    } catch {
      // ignore
    }
  }, [scanned]);

  const resetScan = useCallback(() => {
    setScanned(null);
    lastScanRef.current = { at: 0, data: '' };
  }, []);

  const topPad = Math.max(insets.top, 8);

  if (!permission) {
    return (
      <View style={styles.centered}>
        <StatusBar style="light" />
        <ActivityIndicator size="large" color={GREEN.main} />
      </View>
    );
  }

  if (!permission.granted) {
    return (
      <View style={styles.centered}>
        <StatusBar style="dark" />
        <Ionicons name="camera-outline" size={56} color={NEUTRAL.subtext} />
        <Text style={styles.permTitle}>Camera access needed</Text>
        <Text style={styles.permSub}>Allow camera to scan QR codes and barcodes.</Text>
        <TouchableOpacity style={styles.permBtn} activeOpacity={0.85} onPress={requestPermission}>
          <Text style={styles.permBtnText}>Allow camera</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.backLink} onPress={() => navigation.goBack()} activeOpacity={0.7}>
          <Text style={styles.backLinkText}>Go back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.screen}>
      <StatusBar style="light" />
      <CameraView
        style={StyleSheet.absoluteFill}
        facing="back"
        enableTorch={torch}
        barcodeScannerSettings={{ barcodeTypes: BARCODE_TYPES }}
        onBarcodeScanned={scanned ? undefined : handleBarcodeScanned}
      />

      <View style={[styles.header, { paddingTop: topPad + 8 }]} pointerEvents="box-none">
        <TouchableOpacity style={styles.headerBtn} onPress={() => navigation.goBack()} activeOpacity={0.75}>
          <Ionicons name="chevron-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Scan</Text>
        <TouchableOpacity style={styles.headerBtn} onPress={() => setTorch((t) => !t)} activeOpacity={0.75}>
          <Ionicons name={torch ? 'flash' : 'flash-outline'} size={22} color="#fff" />
        </TouchableOpacity>
      </View>

      <View style={styles.frameWrap} pointerEvents="none">
        <View style={styles.frame} />
        <Text style={styles.hint}>Point camera at a QR code or barcode</Text>
      </View>

      {!!scanned && (
        <View style={[styles.resultSheet, { paddingBottom: Math.max(insets.bottom, 16) + 12 }]}>
          <Text style={styles.resultLabel}>Scanned</Text>
          <Text style={styles.resultData} numberOfLines={4}>
            {scanned.data}
          </Text>
          <Text style={styles.resultType}>{scanned.type}</Text>
          <View style={styles.resultActions}>
            {looksLikeUrl(scanned.data) && (
              <TouchableOpacity style={styles.primaryBtn} activeOpacity={0.85} onPress={openIfLink}>
                <Text style={styles.primaryBtnText}>Open link</Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity style={styles.secondaryBtn} activeOpacity={0.85} onPress={resetScan}>
              <Text style={styles.secondaryBtnText}>Scan again</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {Platform.OS === 'web' && (
        <View style={styles.webNote}>
          <Text style={styles.webNoteText}>Barcode scanning works on iOS and Android in Expo Go or a dev build.</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#000' },
  centered: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 28,
  },
  permTitle: { marginTop: 16, fontSize: 18, fontWeight: '800', color: '#0f172a' },
  permSub: { marginTop: 8, fontSize: 14, fontWeight: '600', color: NEUTRAL.subtext, textAlign: 'center' },
  permBtn: {
    marginTop: 22,
    backgroundColor: GREEN.dark,
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 14,
  },
  permBtnText: { color: '#fff', fontWeight: '800', fontSize: 15 },
  backLink: { marginTop: 16, padding: 8 },
  backLinkText: { color: GREEN.main, fontWeight: '700', fontSize: 15 },

  header: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingBottom: 8,
    backgroundColor: 'rgba(0,0,0,0.45)',
  },
  headerBtn: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: { color: '#fff', fontSize: 17, fontWeight: '800' },

  frameWrap: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    paddingBottom: 120,
  },
  frame: {
    width: 260,
    height: 260,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.85)',
    backgroundColor: 'transparent',
  },
  hint: {
    marginTop: 20,
    color: 'rgba(255,255,255,0.9)',
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
    paddingHorizontal: 32,
  },

  resultSheet: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#fff',
    borderTopLeftRadius: 22,
    borderTopRightRadius: 22,
    paddingHorizontal: 20,
    paddingTop: 18,
    borderTopWidth: 1,
    borderColor: '#e2e8f0',
  },
  resultLabel: { fontSize: 12, fontWeight: '800', color: NEUTRAL.subtext, textTransform: 'uppercase' },
  resultData: { marginTop: 8, fontSize: 16, fontWeight: '700', color: '#0f172a' },
  resultType: { marginTop: 6, fontSize: 12, fontWeight: '600', color: NEUTRAL.subtext },
  resultActions: { marginTop: 16, flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  primaryBtn: {
    backgroundColor: GREEN.dark,
    paddingVertical: 12,
    paddingHorizontal: 18,
    borderRadius: 12,
  },
  primaryBtnText: { color: '#fff', fontWeight: '800', fontSize: 14 },
  secondaryBtn: {
    backgroundColor: GREEN.bg,
    paddingVertical: 12,
    paddingHorizontal: 18,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: GREEN.pale,
  },
  secondaryBtnText: { color: GREEN.dark, fontWeight: '800', fontSize: 14 },

  webNote: {
    position: 'absolute',
    bottom: 24,
    left: 16,
    right: 16,
    backgroundColor: 'rgba(0,0,0,0.7)',
    padding: 12,
    borderRadius: 12,
  },
  webNoteText: { color: '#fff', fontSize: 12, fontWeight: '600', textAlign: 'center' },
});
