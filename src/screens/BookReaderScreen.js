import { StatusBar } from 'expo-status-bar';
import { useState } from 'react';
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { WebView } from 'react-native-webview';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BOOKS_BY_ID, drivePreviewUrl } from '../constants/books';

const TEAL = { deep: '#0f766e', main: '#14b8a6', page: '#f0fdfa' };

export default function BookReaderScreen({ navigation, route }) {
  const insets = useSafeAreaInsets();
  const bookId = route?.params?.bookId;
  const book = bookId ? BOOKS_BY_ID[bookId] : null;
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [retryKey, setRetryKey] = useState(0);

  const uri = book ? drivePreviewUrl(book.driveFileId) : '';

  if (!book) {
    return (
      <View style={[styles.screen, styles.centered, { paddingTop: insets.top }]}>
        <StatusBar style="dark" />
        <Text style={styles.errTitle}>বই পাওয়া যায়নি</Text>
        <TouchableOpacity style={styles.outlineBtn} onPress={() => navigation.goBack()}>
          <Text style={styles.outlineBtnText}>ফিরে যান</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.screen}>
      <StatusBar style="dark" />
      <View style={[styles.toolbar, { paddingTop: insets.top + 8 }]}>
        <TouchableOpacity style={styles.toolBack} onPress={() => navigation.goBack()} activeOpacity={0.88}>
          <Ionicons name="chevron-back" size={22} color={TEAL.deep} />
        </TouchableOpacity>
        <View style={styles.toolTitleWrap}>
          <Text style={styles.toolTitle} numberOfLines={2}>
            {book.title}
          </Text>
        </View>
        <View style={styles.headerSpacer} />
      </View>

      <View style={styles.webWrap}>
        {error ? (
          <View style={styles.errorBox}>
            <Ionicons name="cloud-offline-outline" size={48} color={TEAL.main} />
            <Text style={styles.errorTitle}>লোড হয়নি</Text>
            <Text style={styles.errorSub}>
              নেটওয়ার্ক চেক করে আবার চেষ্টা করুন, অথবা কিছুক্ষণ পরে খুলুন।
            </Text>
            <TouchableOpacity
              style={styles.primaryBtn}
              onPress={() => {
                setError(false);
                setLoading(true);
                setRetryKey((k) => k + 1);
              }}
              activeOpacity={0.9}
            >
              <Text style={styles.primaryBtnText}>আবার চেষ্টা</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.secondaryBtn} onPress={() => navigation.goBack()} activeOpacity={0.88}>
              <Text style={styles.secondaryBtnText}>ফিরে যান</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <WebView
            key={retryKey}
            source={{ uri }}
            style={styles.web}
            onLoadStart={() => { setLoading(true); setError(false); }}
            onLoadEnd={() => setLoading(false)}
            onError={() => { setLoading(false); setError(true); }}
            javaScriptEnabled
            domStorageEnabled
            startInLoadingState={false}
            allowsInlineMediaPlayback
            mixedContentMode="compatibility"
            setSupportMultipleWindows={false}
          />
        )}
        {loading && !error ? (
          <View style={styles.loadingOverlay} pointerEvents="none">
            <ActivityIndicator size="large" color={TEAL.main} />
            <Text style={styles.loadingText}>বই লোড হচ্ছে…</Text>
          </View>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: TEAL.page },
  centered: { alignItems: 'center', justifyContent: 'center', padding: 24 },
  toolbar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingBottom: 10,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(20,184,166,0.2)',
  },
  toolBack: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: TEAL.page,
    alignItems: 'center',
    justifyContent: 'center',
  },
  toolTitleWrap: { flex: 1, marginHorizontal: 10 },
  toolTitle: { fontSize: 14, fontWeight: '800', color: '#0f172a', lineHeight: 19 },
  headerSpacer: { width: 40 },
  webWrap: { flex: 1, position: 'relative' },
  web: { flex: 1, backgroundColor: '#fff' },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.88)',
  },
  loadingText: { marginTop: 12, fontSize: 14, fontWeight: '600', color: TEAL.deep },
  errorBox: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 28 },
  errorTitle: { marginTop: 16, fontSize: 18, fontWeight: '800', color: '#0f172a' },
  errorSub: { marginTop: 8, textAlign: 'center', fontSize: 14, fontWeight: '600', color: '#64748b', lineHeight: 21 },
  primaryBtn: {
    marginTop: 22,
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 14,
    backgroundColor: TEAL.deep,
  },
  primaryBtnText: { fontSize: 15, fontWeight: '800', color: '#fff' },
  secondaryBtn: { marginTop: 14, paddingVertical: 10, paddingHorizontal: 16 },
  secondaryBtnText: { fontSize: 14, fontWeight: '700', color: TEAL.deep },
  errTitle: { fontSize: 16, fontWeight: '700', color: '#64748b', marginBottom: 16 },
  outlineBtn: { paddingVertical: 12, paddingHorizontal: 20 },
  outlineBtnText: { fontSize: 15, fontWeight: '800', color: TEAL.deep },
});
