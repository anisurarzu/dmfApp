import { StatusBar } from 'expo-status-bar';
import { Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { GREEN } from '../theme/colors';
import { EDUCATION_ITEMS } from '../constants/educationItems';

function openEducationItem(navigation, key) {
  if (key === 'result') navigation.navigate('Results');
  else if (key === 'quiz') navigation.navigate('QuizList');
  else if (key === 'blood_donation') navigation.navigate('BloodDonation');
  else if (key === 'courses') navigation.navigate('CoursesList');
  else navigation.navigate('Menu');
}

export default function EducationAllScreen({ navigation }) {
  const insets = useSafeAreaInsets();

  return (
    <View style={styles.screen}>
      <StatusBar style="dark" />
      <View style={[styles.header, { paddingTop: Math.max(insets.top, 12) + 4 }]}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()} activeOpacity={0.75}>
          <Ionicons name="chevron-back" size={24} color={GREEN.dark} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Education</Text>
        <View style={styles.headerSpacer} />
      </View>

      <Text style={styles.intro}>Everything in one place — tap an option to open it.</Text>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 28 }]}
        showsVerticalScrollIndicator={false}
      >
        {EDUCATION_ITEMS.map((item, index) => (
          <TouchableOpacity
            key={item.key}
            style={[styles.card, index === EDUCATION_ITEMS.length - 1 && styles.cardLast]}
            activeOpacity={0.88}
            onPress={() => openEducationItem(navigation, item.key)}
          >
            <View style={styles.cardHero}>
              {item.asset ? (
                <Image source={item.asset} style={styles.cardHeroImg} resizeMode="contain" />
              ) : (
                <Ionicons
                  name={item.icon}
                  size={72}
                  color={item.accentColor || GREEN.dark}
                />
              )}
            </View>
            <View style={styles.cardBody}>
              <View style={styles.cardIconWrap}>
                <Ionicons name={item.icon} size={22} color={GREEN.dark} />
              </View>
              <View style={styles.cardText}>
                <Text style={styles.cardTitle}>{item.title}</Text>
                <Text style={styles.cardSub}>{item.sub}</Text>
              </View>
              <Ionicons name="chevron-forward" size={22} color={GREEN.main} />
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: GREEN.bg },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  backBtn: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: '#f0fdf4',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#dcfce7',
  },
  headerTitle: {
    flex: 1,
    textAlign: 'center',
    fontSize: 18,
    fontWeight: '900',
    color: GREEN.dark,
    letterSpacing: -0.2,
  },
  headerSpacer: { width: 44 },
  intro: {
    marginHorizontal: 20,
    marginTop: 14,
    marginBottom: 6,
    fontSize: 13,
    lineHeight: 19,
    fontWeight: '600',
    color: '#475569',
  },
  scroll: { flex: 1 },
  scrollContent: { paddingHorizontal: 20, paddingTop: 14 },
  card: {
    backgroundColor: '#fff',
    borderRadius: 20,
    overflow: 'hidden',
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#dcfce7',
    shadowColor: '#0f172a',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.07,
    shadowRadius: 16,
    elevation: 4,
  },
  cardLast: { marginBottom: 0 },
  cardHero: {
    height: 112,
    backgroundColor: GREEN.bg,
    alignItems: 'center',
    justifyContent: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#ecfdf5',
  },
  cardHeroImg: { width: 140, height: 88 },
  cardBody: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  cardIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: '#dcfce7',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  cardText: { flex: 1 },
  cardTitle: { fontSize: 16, fontWeight: '900', color: GREEN.dark },
  cardSub: { fontSize: 13, fontWeight: '700', color: '#16a34a', marginTop: 3 },
});
