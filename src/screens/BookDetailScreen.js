import { StatusBar } from 'expo-status-bar';
import { Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BOOKS_BY_ID } from '../constants/books';

const TEAL = {
  deep: '#0f766e',
  main: '#14b8a6',
  light: '#5eead4',
  pale: '#ccfbf1',
  page: '#f0fdfa',
  ink: '#0f172a',
  muted: '#64748b',
};

export default function BookDetailScreen({ navigation, route }) {
  const insets = useSafeAreaInsets();
  const bookId = route?.params?.bookId;
  const book = bookId ? BOOKS_BY_ID[bookId] : null;

  if (!book) {
    return (
      <View style={[styles.screen, styles.miss, { paddingTop: insets.top + 24 }]}>
        <StatusBar style="dark" />
        <Text style={styles.missText}>বই পাওয়া যায়নি।</Text>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.missLink}>ফিরে যান</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const author = book.author || {};
  const editor = book.editor || {};

  return (
    <View style={styles.screen}>
      <StatusBar style="dark" />
      <LinearGradient colors={[TEAL.pale, '#fff']} style={[styles.topBar, { paddingTop: insets.top + 8 }]}>
        <View style={styles.topInner}>
          <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()} activeOpacity={0.88}>
            <Ionicons name="chevron-back" size={22} color={TEAL.deep} />
          </TouchableOpacity>
          <Text style={styles.topTitle} numberOfLines={1}>
            বইয়ের বিবরণ
          </Text>
          <View style={styles.topSpacer} />
        </View>
      </LinearGradient>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.scroll, { paddingBottom: insets.bottom + 28 }]}
      >
        <View style={styles.heroCard}>
          <Image source={book.cover} style={styles.heroCover} resizeMode="cover" />
        </View>

        <View style={styles.body}>
          {book.category ? (
            <View style={styles.catPill}>
              <Text style={styles.catPillText}>{book.category}</Text>
            </View>
          ) : null}
          <Text style={styles.title}>{book.title}</Text>
          <Text style={styles.subtitle}>{book.subtitle}</Text>
          {book.description ? <Text style={styles.description}>{book.description}</Text> : null}
          {book.year ? (
            <View style={styles.yearRow}>
              <Ionicons name="calendar-outline" size={16} color={TEAL.deep} />
              <Text style={styles.yearText}>সংস্করণ {book.year}</Text>
            </View>
          ) : null}

          <Text style={styles.priceNote}>ডাউনলোড: ৳{book.priceBdt} (পেমেন্ট সফল হলে)</Text>

          <TouchableOpacity
            style={styles.readBtn}
            activeOpacity={0.92}
            onPress={() => navigation.navigate('BookReader', { bookId: book.id })}
          >
            <LinearGradient colors={[TEAL.deep, TEAL.main]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.readGrad}>
              <Ionicons name="book-outline" size={22} color="#fff" />
              <Text style={styles.readText}>পড়ুন</Text>
            </LinearGradient>
          </TouchableOpacity>

          <View style={styles.introBlock}>
            <View style={styles.introHead}>
              <Ionicons name="people-outline" size={22} color={TEAL.deep} />
              <Text style={styles.introTitle}>পরিচিতি</Text>
            </View>

            <Text style={styles.sectionHeading}>লেখক পরিচিতি</Text>
            <View style={styles.infoCard}>
              <InfoRow label="নাম" value={author?.name} />
              <InfoRow label="পেশা" value={author?.profession} />
              <InfoRow label="অতিরিক্ত শিক্ষা" value={author?.extraEducation} />
              {author?.roles?.length ? (
                <View style={styles.rolesBlock}>
                  <Text style={styles.rolesLabel}>বর্তমান দায়িত্বসমূহ</Text>
                  {author.roles.map((r, i) => (
                    <View key={i} style={styles.bulletRow}>
                      <View style={styles.bullet} />
                      <Text style={styles.bulletText}>{r}</Text>
                    </View>
                  ))}
                </View>
              ) : null}
            </View>

            {editor?.name || editor?.roles?.length ? (
              <>
                <Text style={[styles.sectionHeading, { marginTop: 20 }]}>সম্পাদক পরিচিতি</Text>
                <View style={styles.infoCard}>
                  <InfoRow label="নাম" value={editor?.name} />
                  {editor?.roles?.length ? (
                    <View style={styles.rolesBlock}>
                      <Text style={styles.rolesLabel}>বর্তমান দায়িত্বসমূহ</Text>
                      {editor.roles.map((r, i) => (
                        <View key={i} style={styles.bulletRow}>
                          <View style={styles.bullet} />
                          <Text style={styles.bulletText}>{r}</Text>
                        </View>
                      ))}
                    </View>
                  ) : null}
                </View>
              </>
            ) : null}
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

function InfoRow({ label, value }) {
  if (!value) return null;
  return (
    <View style={styles.infoRow}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={styles.infoValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: TEAL.page },
  miss: { alignItems: 'center', paddingHorizontal: 24 },
  missText: { fontSize: 15, fontWeight: '600', color: TEAL.muted },
  missLink: { marginTop: 14, fontSize: 15, fontWeight: '800', color: TEAL.deep },
  topBar: {
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(20,184,166,0.2)',
  },
  topInner: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingBottom: 12,
  },
  backBtn: {
    width: 42,
    height: 42,
    borderRadius: 14,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: TEAL.light,
  },
  topTitle: { flex: 1, textAlign: 'center', fontSize: 16, fontWeight: '800', color: TEAL.ink },
  topSpacer: { width: 42 },
  scroll: { paddingTop: 12 },
  heroCard: {
    marginHorizontal: 16,
    borderRadius: 10,
    overflow: 'hidden',
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: TEAL.light,
    shadowColor: '#0f172a',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.1,
    shadowRadius: 16,
    elevation: 6,
    alignSelf: 'center',
  },
  heroCover: { width: 200, height: 280, backgroundColor: TEAL.pale },
  body: { paddingHorizontal: 16, paddingTop: 18 },
  catPill: {
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
    backgroundColor: TEAL.pale,
    borderWidth: 1,
    borderColor: TEAL.light,
    marginBottom: 10,
  },
  catPillText: { fontSize: 12, fontWeight: '800', color: TEAL.deep },
  title: { fontSize: 24, fontWeight: '900', color: TEAL.ink, letterSpacing: -0.4, lineHeight: 32 },
  subtitle: { marginTop: 8, fontSize: 14, fontWeight: '600', color: TEAL.muted, lineHeight: 21 },
  description: {
    marginTop: 14,
    fontSize: 14,
    fontWeight: '500',
    color: TEAL.ink,
    lineHeight: 23,
    opacity: 0.92,
  },
  yearRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 12 },
  yearText: { fontSize: 14, fontWeight: '700', color: TEAL.deep },
  priceNote: { marginTop: 14, fontSize: 12, fontWeight: '700', color: TEAL.deep, opacity: 0.9 },
  readBtn: { marginTop: 16, borderRadius: 16, overflow: 'hidden' },
  readGrad: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    paddingVertical: 16,
  },
  readText: { fontSize: 17, fontWeight: '900', color: '#fff' },
  introBlock: { marginTop: 28 },
  introHead: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 14 },
  introTitle: { fontSize: 20, fontWeight: '900', color: TEAL.ink },
  sectionHeading: {
    fontSize: 15,
    fontWeight: '800',
    color: TEAL.deep,
    marginBottom: 10,
  },
  infoCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  infoRow: { marginBottom: 12 },
  infoLabel: { fontSize: 11, fontWeight: '800', color: TEAL.muted, textTransform: 'uppercase', letterSpacing: 0.4 },
  infoValue: { marginTop: 4, fontSize: 15, fontWeight: '700', color: TEAL.ink, lineHeight: 22 },
  rolesBlock: { marginTop: 4 },
  rolesLabel: { fontSize: 11, fontWeight: '800', color: TEAL.muted, marginBottom: 8, textTransform: 'uppercase' },
  bulletRow: { flexDirection: 'row', alignItems: 'flex-start', marginTop: 6 },
  bullet: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: TEAL.main,
    marginTop: 7,
    marginRight: 10,
  },
  bulletText: { flex: 1, fontSize: 14, fontWeight: '600', color: TEAL.ink, lineHeight: 21 },
});
