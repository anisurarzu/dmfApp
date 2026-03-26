import { StatusBar } from 'expo-status-bar';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Animated,
  Dimensions,
  Easing,
  Image,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { GREEN, NEUTRAL } from '../theme/colors';
import { useAuth } from '../context/AuthContext';
import BottomNav from '../components/BottomNav';
import { EDUCATION_ITEMS } from '../constants/educationItems';

const NOTIFICATIONS_STORAGE_KEY = 'dmf_dashboard_notifications_v1';

/** Set true to show the hadith marquee in the dashboard header again. */
const SHOW_DASHBOARD_HADITH = false;

const DEFAULT_NOTIFICATIONS = [
  {
    id: '1',
    title: 'Scholarship update',
    body: 'Check your latest scholarship status and results from the Education section.',
    time: '2h ago',
    read: false,
    icon: 'school-outline',
  },
  {
    id: '2',
    title: 'Thank you for giving',
    body: 'Your support helps students and families. JazakAllahu khayran.',
    time: 'Yesterday',
    read: false,
    icon: 'heart-outline',
  },
  {
    id: '3',
    title: 'Profile reminder',
    body: 'Keep your profile complete so we can reach you about programs and events.',
    time: '3d ago',
    read: true,
    icon: 'person-outline',
  },
];

const { width: SCREEN_WIDTH } = Dimensions.get('window');

/** Dashboard header + accent tokens (green, matches app theme). */
const HEADER = {
  grad: ['#052e16', '#0c3d26', '#136c3a', '#16a34a', '#22a85c'],
  gradLoc: [0, 0.22, 0.48, 0.72, 1],
  accent: GREEN.main,
  iconPlate: 'rgba(22, 163, 74, 0.16)',
  iconBorder: GREEN.main,
  label: GREEN.dark,
  dark: GREEN.dark,
};

const SHEET_PAD_X = 20;
const PAYMENT_GRID_GAP = 12;
const PAYMENT_TILE_W = (SCREEN_WIDTH - SHEET_PAD_X * 2 - PAYMENT_GRID_GAP * 3) / 4;
const EDU_GRID_GAP = 8;
const EDU_TILE_W = (SCREEN_WIDTH - SHEET_PAD_X * 2 - EDU_GRID_GAP * 2) / 3;
/** Education tiles: larger squircle than payment grid (payment caps at 72). */
const EDU_SQUIRCLE = Math.min(EDU_TILE_W - 4, 84);
const PROMO_CARD_SCROLL_W = SCREEN_WIDTH - SHEET_PAD_X * 2 - 36;

const PAYMENT_LIST_ITEMS = [
  { key: 'courses', label: 'Courses', icon: 'school-outline', color: '#15803d', route: 'EducationAll' },
  { key: 'books', label: 'Books', icon: 'book-outline', color: '#ca8a04', route: 'EducationAll' },
  { key: 'skills', label: 'Skills', icon: 'ribbon-outline', color: '#db2777', route: 'EducationAll' },
  { key: 'exam', label: 'Exam Fee', icon: 'document-text-outline', color: '#1d4ed8', route: 'EducationAll' },
  { key: 'training', label: 'Training', icon: 'fitness-outline', color: '#0369a1', route: 'EducationAll' },
  { key: 'rewards', label: 'Rewards Shop', icon: 'gift-outline', color: GREEN.main, route: 'EducationAll' },
  { key: 'goalsaving', label: 'Goal Saving', icon: 'flag-outline', color: '#0d9488', route: 'EducationAll' },
  { key: 'career', label: 'Career', icon: 'briefcase-outline', color: '#64748b', route: 'EducationAll' },
];

const OTHERS_LIST_ITEMS = [
  {
    key: 'gift_voucher',
    label: 'Gift Voucher',
    icon: 'gift-outline',
    color: '#db2777',
    route: 'EducationAll',
    badge: 'Popular',
  },
  {
    key: 'shop_voucher',
    label: 'Shop Voucher',
    icon: 'bag-handle-outline',
    color: '#ca8a04',
    route: 'EducationAll',
    badge: 'New',
  },
  { key: 'donate', label: 'Donate', icon: 'heart-outline', color: '#ef4444', route: 'EducationAll' },
  { key: 'blood_donate', label: 'Blood Donate', icon: 'water-outline', color: '#dc2626', route: 'BloodDonation' },
  { key: 'career_other', label: 'Career', icon: 'briefcase-outline', color: '#64748b', route: 'EducationAll' },
  { key: 'student_loan', label: 'Student Loan', icon: 'cash-outline', color: '#15803d', route: 'EducationAll' },
  { key: 'scholarship_info', label: 'Scholarship Info', icon: 'document-text-outline', color: '#1d4ed8', route: 'EducationAll' },
  { key: 'support', label: 'Support', icon: 'chatbubbles-outline', color: GREEN.main, route: 'Menu' },
];

function educationItemRoute(key) {
  switch (key) {
    case 'quiz':
      return 'QuizList';
    case 'result':
      return 'Results';
    case 'courses':
      return 'Menu';
    case 'blood_donation':
      return 'BloodDonation';
    default:
      return 'EducationAll';
  }
}

function renderShortcutIcon(type) {
  switch (type) {
    case 'topup':
      return (
        <View style={styles.actionGlowPlate}>
          <View style={styles.walletIconWrap}>
            <Ionicons name="wallet-outline" size={19} color={HEADER.dark} />
            <View style={styles.walletPlusBadge}>
              <Ionicons name="add" size={9} color="#fff" />
            </View>
          </View>
        </View>
      );
    case 'send':
      return (
        <View style={styles.actionGlowPlate}>
          <View style={styles.dollarCircle}>
            <Text style={styles.dollarCircleChar}>$</Text>
            <Ionicons name="arrow-up-outline" size={10} color={HEADER.dark} style={styles.dollarCircleArrowSend} />
          </View>
        </View>
      );
    case 'request':
      return (
        <View style={styles.actionGlowPlate}>
          <View style={styles.dollarCircle}>
            <Text style={styles.dollarCircleChar}>$</Text>
            <Ionicons name="arrow-down-outline" size={10} color={HEADER.dark} style={styles.dollarCircleArrowReq} />
          </View>
        </View>
      );
    case 'history':
      return (
        <View style={styles.actionGlowPlate}>
          <View style={styles.historyTenWrap}>
            <Ionicons name="time-outline" size={26} color={HEADER.dark} />
            <View style={styles.historyTenOverlay} pointerEvents="none">
              <Text style={styles.historyTenCenter}>10</Text>
            </View>
          </View>
        </View>
      );
    default:
      return null;
  }
}

/**
 * One hadith per weekday (0 = Sunday … 6 = Saturday).
 * `hadithNo`: বাংলা সংখ্যায় — কিতাবভেদে হাদিস নম্বর সামান্য ভিন্ন হতে পারে।
 */
const DAILY_HADITH_BN = [
  {
    body: 'কেবলমাত্র নিয়ত অনুযায়ী প্রত্যেকের জন্য সে যা নিয়ত করে।',
    hadithNo: '১',
    ref: 'সহীহ বুখারী ও মুসলিম',
  },
  {
    body: 'তোমাদের মধ্যে শ্রেষ্ঠ সেই ব্যক্তি, যে কুরআন শিখে এবং অন্যকে শেখায়।',
    hadithNo: '৫০২৭',
    ref: 'সহীহ বুখারী',
  },
  {
    body: 'মুসলমান সে, যার হাত ও জিভ থেকে অন্য মুসলমান নিরাপদ থাকে।',
    hadithNo: '১০',
    ref: 'সহীহ বুখারী',
  },
  {
    body: 'পবিত্রতা ঈমানের অর্ধেক।',
    hadithNo: '২২৩',
    ref: 'সহীহ মুসলিম',
  },
  {
    body: 'তোমাদের কেউ পথের কষ্টকর বস্তু সরিয়ে দিলে সে সদকা পেল।',
    hadithNo: '২৬২৮',
    ref: 'সহীহ মুসলিম',
  },
  {
    body: 'তোমাদের মধ্যে কেউ সহীহভাবে সূরা ইখলাস তিলাওয়াত করলে কুরআনের এক-তৃতীয়াংশ পাঠ করার সওয়াব পায়।',
    hadithNo: '৬৬৬৮',
    ref: 'সহীহ বুখারী',
  },
  {
    body: 'জান্নাত মায়ের কদমের নিচে রাখা হয়েছে।',
    hadithNo: '৩১০৪',
    ref: 'সুনান নাসাঈ, সহীহ ইবনে হিব্বান',
  },
];

function hadithForToday() {
  const d = new Date().getDay();
  return DAILY_HADITH_BN[d % DAILY_HADITH_BN.length];
}

function hadithCitation(ref, hadithNo) {
  const r = ref != null && String(ref).trim() !== '' ? String(ref).trim() : '—';
  const n = hadithNo != null && String(hadithNo).trim() !== '' ? String(hadithNo).trim() : '';
  return n ? `${r} (${n})` : r;
}

function hadithAccessibilityLabel(body, hadithNo, ref) {
  return `${body} -- ${hadithCitation(ref, hadithNo)}`;
}

/**
 * Row of Text nodes — avoid nested Text + parent numberOfLines={1} (RN often clips after first child).
 */
function HadithMarqueeLine({ body, hadithNo, refText, textStyle, onLayout, hideFromA11y }) {
  const citation = hadithCitation(refText, hadithNo);
  return (
    <View
      style={styles.hadithMarqueeLineRow}
      onLayout={onLayout}
      collapsable={false}
      {...(hideFromA11y
        ? { accessibilityElementsHidden: true, importantForAccessibility: 'no-hide-descendants' }
        : {})}
    >
      <Text style={[textStyle, styles.hadithMarqueeBodySeg]} numberOfLines={1} ellipsizeMode="clip">
        {body}
      </Text>
      <Text style={[textStyle, styles.hadithMarqueeSep]} numberOfLines={1}>
        {' -- '}
      </Text>
      <Text style={[textStyle, styles.hadithMarqueeRef]} numberOfLines={1} ellipsizeMode="clip">
        {citation}
      </Text>
    </View>
  );
}

function HadithMarquee({ body, hadithNo, refText, textStyle }) {
  const translateX = useRef(new Animated.Value(0)).current;
  const [textW, setTextW] = useState(0);
  const [containerW, setContainerW] = useState(0);
  const gap = 96;
  const a11yLabel = hadithAccessibilityLabel(body, hadithNo, refText);

  useEffect(() => {
    if (textW <= 0 || containerW <= 0) return undefined;
    translateX.stopAnimation();
    const segment = textW + gap;
    translateX.setValue(0);
    const pxPerSec = 22;
    const duration = Math.max(18000, (segment / pxPerSec) * 1000);
    const loop = Animated.loop(
      Animated.timing(translateX, {
        toValue: -segment,
        duration,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    );
    loop.start();
    return () => loop.stop();
  }, [body, hadithNo, refText, textW, containerW, gap, translateX]);

  return (
    <View style={styles.hadithMarqueeBlock}>
      <View style={styles.hadithMeasureWrap} pointerEvents="none">
        <HadithMarqueeLine
          body={body}
          hadithNo={hadithNo}
          refText={refText}
          textStyle={textStyle}
          hideFromA11y
          onLayout={(e) => setTextW(e.nativeEvent.layout.width)}
        />
      </View>
      <View
        style={styles.hadithMarqueeClip}
        onLayout={(e) => setContainerW(e.nativeEvent.layout.width)}
        accessible
        accessibilityLabel={a11yLabel}
        accessibilityRole="text"
      >
        {textW > 0 && containerW > 0 ? (
          <Animated.View style={[styles.hadithMarqueeRow, { transform: [{ translateX }] }]}>
            <HadithMarqueeLine body={body} hadithNo={hadithNo} refText={refText} textStyle={textStyle} />
            <View style={{ width: gap }} />
            <HadithMarqueeLine body={body} hadithNo={hadithNo} refText={refText} textStyle={textStyle} />
            <View style={{ width: gap }} />
            <HadithMarqueeLine body={body} hadithNo={hadithNo} refText={refText} textStyle={textStyle} />
          </Animated.View>
        ) : (
          <View style={styles.hadithMarqueePlaceholder} />
        )}
      </View>
    </View>
  );
}

export default function DashboardScreen({ navigation }) {
  const { me } = useAuth();
  const insets = useSafeAreaInsets();

  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [notifications, setNotifications] = useState(DEFAULT_NOTIFICATIONS);
  const [headerHeight, setHeaderHeight] = useState(272);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const raw = await AsyncStorage.getItem(NOTIFICATIONS_STORAGE_KEY);
        if (cancelled || !raw) return;
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length) {
          setNotifications(parsed);
        }
      } catch {
        /* keep defaults */
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const saveNotifications = useCallback((next) => {
    AsyncStorage.setItem(NOTIFICATIONS_STORAGE_KEY, JSON.stringify(next)).catch(() => {});
  }, []);

  const setAndPersist = useCallback(
    (updater) => {
      setNotifications((prev) => {
        const next = typeof updater === 'function' ? updater(prev) : updater;
        saveNotifications(next);
        return next;
      });
    },
    [saveNotifications]
  );

  const unreadCount = useMemo(
    () => notifications.filter((n) => !n.read).length,
    [notifications]
  );

  const markNotificationRead = useCallback(
    (id) => {
      setAndPersist((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
    },
    [setAndPersist]
  );

  const markAllNotificationsRead = useCallback(() => {
    setAndPersist((prev) => prev.map((n) => ({ ...n, read: true })));
  }, [setAndPersist]);

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

  const hadithToday = hadithForToday();

  return (
    <View style={styles.screen}>
      <StatusBar style="light" />

      <LinearGradient
        colors={HEADER.grad}
        locations={HEADER.gradLoc}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
        style={styles.top}
        onLayout={(e) => setHeaderHeight(e.nativeEvent.layout.height)}
      >
        <View style={[styles.topInner, { paddingTop: Math.max(insets.top, 10) + 4 }]}>
          {SHOW_DASHBOARD_HADITH && (
            <HadithMarquee
              body={hadithToday.body}
              hadithNo={hadithToday.hadithNo}
              refText={hadithToday.ref}
              textStyle={styles.hadithMarqueeText}
            />
          )}

          <View style={styles.topRow}>
            <View style={styles.topRowLeft}>
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

            <View style={styles.topRowRight}>
              <TouchableOpacity
                style={[styles.iconBtn, styles.notifBtn]}
                activeOpacity={0.75}
                onPress={() => setNotificationsOpen(true)}
                accessibilityLabel="Notifications"
              >
                <Ionicons name="notifications-outline" size={22} color="#fff" />
                {unreadCount > 0 && (
                  <View style={styles.notifBadge}>
                    <Text style={styles.notifBadgeText}>{unreadCount > 9 ? '9+' : unreadCount}</Text>
                  </View>
                )}
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.balanceInHeader}>
            <Text style={styles.availableBalanceLabel}>Scholarship Wallet</Text>
            <Text style={styles.walletSubLabel}>Your Learning Fund</Text>
            <Text style={styles.availableBalanceAmount} numberOfLines={1}>
              ৳137,946
            </Text>
            <View style={styles.balanceStatsRow}>
              <Text style={styles.balanceStatText}>Saved: ৳12,400</Text>
              <Text style={styles.balanceStatDivider}>·</Text>
              <Text style={styles.balanceStatText}>Bonus: ৳800</Text>
              <Text style={styles.balanceStatDivider}>·</Text>
              <Text style={styles.balanceStatText}>Locked: ৳5,000</Text>
            </View>
            <Text style={styles.streakHint}>🔥 Streak: 5 days no withdraw</Text>
          </View>
        </View>
      </LinearGradient>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.sheet}>
          <View style={[styles.section, styles.paymentSection]}>
            <Text style={styles.paymentListTitle}>Use Your Wallet</Text>
            <View style={styles.paymentListGrid}>
              {PAYMENT_LIST_ITEMS.map((item, index) => (
                <TouchableOpacity
                  key={item.key}
                  activeOpacity={0.88}
                  style={[
                    styles.paymentListTile,
                    ((index + 1) % 4 === 0 || index === PAYMENT_LIST_ITEMS.length - 1) &&
                      styles.paymentListTileRowEnd,
                  ]}
                  onPress={() => navigation.navigate(item.route)}
                >
                  <View style={styles.paymentListSquircle}>
                    <Ionicons name={item.icon} size={26} color={item.color} />
                  </View>
                  <Text style={styles.paymentListLabel} numberOfLines={2}>
                    {item.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.paymentListTitle}>Education</Text>
            <View style={styles.eduGrid}>
              {EDUCATION_ITEMS.map((item, index) => (
                <TouchableOpacity
                  key={item.key}
                  activeOpacity={0.88}
                  style={[styles.eduTile, (index + 1) % 3 === 0 && styles.eduTileRowEnd]}
                  onPress={() => navigation.navigate(educationItemRoute(item.key))}
                >
                  <View style={styles.eduSquircle}>
                    {item.asset ? (
                      <Image source={item.asset} style={styles.eduLogoInSquircle} resizeMode="contain" />
                    ) : (
                      <Ionicons
                        name={item.icon}
                        size={28}
                        color={item.accentColor != null ? item.accentColor : GREEN.main}
                      />
                    )}
                  </View>
                  <Text style={styles.eduTileTitle} numberOfLines={1}>
                    {item.title}
                  </Text>
                  <Text style={styles.eduTileSub} numberOfLines={1}>
                    {item.sub}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.paymentListTitle}>Others</Text>
            <View style={styles.paymentListGrid}>
              {OTHERS_LIST_ITEMS.map((item, index) => (
                <TouchableOpacity
                  key={item.key}
                  activeOpacity={0.88}
                  style={[
                    styles.paymentListTile,
                    ((index + 1) % 4 === 0 || index === OTHERS_LIST_ITEMS.length - 1) &&
                      styles.paymentListTileRowEnd,
                  ]}
                  onPress={() => navigation.navigate(item.route)}
                >
                  <View style={[styles.paymentListSquircle, item.badge && styles.paymentListSquircleWithBadge]}>
                    {item.badge ? (
                      <View style={styles.tileCornerBadge} pointerEvents="none">
                        <Text style={styles.tileCornerBadgeText} numberOfLines={1}>
                          {item.badge}
                        </Text>
                      </View>
                    ) : null}
                    <Ionicons name={item.icon} size={26} color={item.color} />
                  </View>
                  <Text style={styles.paymentListLabel} numberOfLines={2}>
                    {item.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.paymentListTitle}>Saving Goal</Text>
            <Text style={styles.goalBodyText}>Don&apos;t withdraw for 30 days</Text>
            <View style={styles.progressTrack}>
              <View style={[styles.progressFill, { width: '60%' }]} />
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.paymentListTitle}>Rewards</Text>
            <Text style={styles.rewardsBodyText}>You earned ৳100 bonus</Text>
          </View>

          <View style={styles.section}>
            <View style={styles.sectionHead}>
              <Text style={styles.sectionTitle}>Promo & Discount</Text>
              <TouchableOpacity activeOpacity={0.7} onPress={() => navigation.navigate('EducationAll')}>
                <Text style={styles.viewAll}>See more</Text>
              </TouchableOpacity>
            </View>

            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.promoHScroll}
            >
              <TouchableOpacity
                activeOpacity={0.92}
                style={[styles.promoCardTouch, { width: PROMO_CARD_SCROLL_W }]}
                onPress={() => navigation.navigate('EducationAll')}
              >
                <LinearGradient
                  colors={['#14532d', '#15803d', '#16a34a', '#22c55e']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.promoCard}
                >
                  <View style={styles.promoCardRow}>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.promoTitle}>Special Offer For Today&apos;s Top Up</Text>
                      <Text style={styles.promoSub}>Limited time rewards</Text>
                      <Text style={styles.promoDesc} numberOfLines={2}>
                        Get discount for every top up, transfer and payment.
                      </Text>
                    </View>
                    <View style={styles.promoIcon}>
                      <Ionicons name="gift-outline" size={20} color="rgba(255,255,255,0.95)" />
                    </View>
                  </View>
                </LinearGradient>
              </TouchableOpacity>
              <TouchableOpacity
                activeOpacity={0.92}
                style={styles.promoPeekTouch}
                onPress={() => navigation.navigate('EducationAll')}
              >
                <LinearGradient
                  colors={['#0369a1', '#38bdf8', '#7dd3fc']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.promoCardPeek}
                >
                  <Text style={styles.promoPeekTitle}>Bonus</Text>
                  <Text style={styles.promoPeekSub}>Next offer</Text>
                </LinearGradient>
              </TouchableOpacity>
            </ScrollView>
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

          <View style={{ height: 132 + Math.max(insets.bottom, 12) }} />
        </View>
      </ScrollView>

      <View style={styles.floatingShortcutsLayer} pointerEvents="box-none">
        <View
          style={[styles.actionShortcutsSlotOverlay, { top: headerHeight - 32 }]}
          pointerEvents="box-none"
        >
          <View style={styles.actionShortcutsCard}>
            {[
              { key: 'add', label: 'Add', type: 'topup', route: 'EducationAll' },
              { key: 'use', label: 'Learn', type: 'send', route: 'QuizList' },
              { key: 'withdraw', label: 'Withdraw', type: 'request', route: 'Results' },
              { key: 'tx', label: 'History', type: 'history', route: 'EducationAll' },
            ].map((it) => (
              <TouchableOpacity
                key={it.key}
                style={styles.actionShortcut}
                activeOpacity={0.95}
                onPress={() => navigation.navigate(it.route)}
              >
                {renderShortcutIcon(it.type)}
                <Text style={styles.actionLabel} numberOfLines={1}>
                  {it.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </View>

      <Modal
        visible={notificationsOpen}
        animationType="fade"
        transparent
        onRequestClose={() => setNotificationsOpen(false)}
      >
        <Pressable style={styles.notifOverlay} onPress={() => setNotificationsOpen(false)}>
          <Pressable
            style={[
              styles.notifPanel,
              {
                marginTop: Math.max(insets.top, 12) + 8,
                maxHeight: '75%',
              },
            ]}
            onPress={(e) => e.stopPropagation()}
          >
            <View style={styles.notifPanelHeader}>
              <Text style={styles.notifPanelTitle}>Notifications</Text>
              <View style={styles.notifPanelActions}>
                {unreadCount > 0 && (
                  <TouchableOpacity onPress={markAllNotificationsRead} activeOpacity={0.7}>
                    <Text style={styles.notifMarkAll}>Mark all read</Text>
                  </TouchableOpacity>
                )}
                <TouchableOpacity
                  onPress={() => setNotificationsOpen(false)}
                  style={styles.notifCloseBtn}
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                >
                  <Ionicons name="close" size={22} color="#64748b" />
                </TouchableOpacity>
              </View>
            </View>

            <ScrollView
              style={styles.notifList}
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
            >
              {notifications.length === 0 ? (
                <Text style={styles.notifEmpty}>No notifications yet.</Text>
              ) : (
                notifications.map((item) => (
                  <TouchableOpacity
                    key={item.id}
                    style={[styles.notifRow, !item.read && styles.notifRowUnread]}
                    activeOpacity={0.85}
                    onPress={() => {
                      markNotificationRead(item.id);
                    }}
                  >
                    <View style={styles.notifRowIcon}>
                      <Ionicons name={item.icon || 'notifications-outline'} size={20} color={GREEN.main} />
                    </View>
                    <View style={styles.notifRowBody}>
                      <View style={styles.notifRowTop}>
                        <Text style={styles.notifRowTitle} numberOfLines={1}>
                          {item.title}
                        </Text>
                        <Text style={styles.notifRowTime}>{item.time}</Text>
                      </View>
                      <Text style={styles.notifRowBodyText} numberOfLines={2}>
                        {item.body}
                      </Text>
                    </View>
                    {!item.read && <View style={styles.notifDot} />}
                  </TouchableOpacity>
                ))
              )}
            </ScrollView>
          </Pressable>
        </Pressable>
      </Modal>

      <BottomNav navigation={navigation} active="home" />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: GREEN.bg, overflow: 'visible' },
  top: {
    minHeight: 252,
    paddingBottom: 52,
    overflow: 'hidden',
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
    position: 'relative',
    zIndex: 2,
    ...(Platform.OS === 'android' ? { elevation: 8 } : {}),
  },
  floatingShortcutsLayer: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 18,
    pointerEvents: 'box-none',
  },
  topInner: { flex: 1, paddingHorizontal: 22, justifyContent: 'flex-start', paddingBottom: 6 },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    minHeight: 48,
  },
  topRowLeft: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    minWidth: 0,
  },
  topRowCenter: {
    flex: 2,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 6,
    minWidth: 0,
  },
  topRowRight: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    minWidth: 0,
  },
  iconBtn: {
    width: 46,
    height: 46,
    borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.14)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuBtn: {
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.22)',
  },
  notifBtn: {
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.38)',
    position: 'relative',
  },
  notifBadge: {
    position: 'absolute',
    top: 4,
    right: 4,
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    paddingHorizontal: 4,
    backgroundColor: '#ef4444',
    alignItems: 'center',
    justifyContent: 'center',
  },
  notifBadgeText: { color: '#fff', fontSize: 10, fontWeight: '900' },
  avatarBtn: {
    width: 48,
    height: 48,
    borderRadius: 24,
    overflow: 'hidden',
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.55)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarImg: { width: '100%', height: '100%', resizeMode: 'cover', borderRadius: 24 },
  avatarFallback: { width: '100%', height: '100%', alignItems: 'center', justifyContent: 'center' },
  avatarInitials: { color: '#ffffff', fontWeight: '900', fontSize: 14, letterSpacing: 0.4 },
  topHadithLabel: {
    fontSize: 15,
    fontWeight: '900',
    color: '#ffffff',
    letterSpacing: 0.2,
    textAlign: 'center',
  },
  hadithMarqueeBlock: { marginTop: 0, position: 'relative', alignSelf: 'stretch' },
  hadithMeasureWrap: {
    position: 'absolute',
    opacity: 0,
    left: 0,
    top: 0,
    zIndex: -1,
    flexDirection: 'row',
    alignItems: 'flex-start',
    maxWidth: 8000,
  },
  hadithMarqueeClip: {
    overflow: 'hidden',
    minHeight: 26,
    paddingVertical: 4,
    justifyContent: 'center',
    width: '100%',
  },
  hadithMarqueePlaceholder: { minHeight: 26 },
  hadithMarqueeRow: { flexDirection: 'row', alignItems: 'center', flexWrap: 'nowrap' },
  hadithMarqueeLineRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'nowrap',
    flexShrink: 0,
    flexGrow: 0,
  },
  hadithMarqueeBodySeg: { flexShrink: 0 },
  hadithMarqueeSep: {
    color: 'rgba(234,255,240,0.5)',
    fontWeight: '600',
  },
  hadithMarqueeRef: {
    color: 'rgba(255,251,235,0.98)',
    fontWeight: '800',
  },
  hadithMarqueeText: {
    fontSize: 13,
    lineHeight: 20,
    fontWeight: '700',
    color: 'rgba(234,255,240,0.95)',
  },
  scroll: { flex: 1, zIndex: 1, marginTop: -40 },
  content: { paddingHorizontal: 0, paddingTop: 0, flexGrow: 1 },
  actionShortcutsSlotOverlay: {
    position: 'absolute',
    left: SHEET_PAD_X,
    right: SHEET_PAD_X,
    zIndex: 20,
  },
  sheet: {
    marginTop: -6,
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    paddingTop: 84,
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
  /** Clears the floating shortcut card; keeps Payment List visually below it. */
  paymentSection: {
    paddingTop: 24,
    marginTop: 18,
  },
  sectionHead: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  sectionTitle: { fontSize: 18, fontWeight: '900', color: GREEN.dark },
  viewAll: { fontSize: 14, fontWeight: '800', color: HEADER.accent },
  balanceInHeader: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 12,
    paddingBottom: 28,
    minHeight: 108,
    flexShrink: 0,
  },
  availableBalanceLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.88)',
    letterSpacing: 0.5,
  },
  walletSubLabel: {
    marginTop: 4,
    fontSize: 12,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.75)',
    letterSpacing: 0.3,
  },
  balanceStatsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
    paddingHorizontal: 8,
  },
  balanceStatText: {
    fontSize: 11,
    fontWeight: '700',
    color: 'rgba(255,255,255,0.92)',
    marginHorizontal: 3,
  },
  balanceStatDivider: {
    fontSize: 11,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.45)',
    marginHorizontal: 2,
  },
  streakHint: {
    marginTop: 8,
    fontSize: 11,
    fontWeight: '700',
    color: 'rgba(255,255,255,0.88)',
    textAlign: 'center',
  },
  availableBalanceAmount: {
    marginTop: 8,
    fontSize: 38,
    fontWeight: '800',
    color: '#ffffff',
    letterSpacing: -0.8,
    textShadowColor: 'rgba(0,0,0,0.25)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 6,
    ...(Platform.OS === 'ios' ? { fontVariant: ['tabular-nums'] } : {}),
  },
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
  eduGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  eduTile: {
    width: EDU_TILE_W,
    marginRight: EDU_GRID_GAP,
    marginBottom: EDU_GRID_GAP,
    alignItems: 'center',
  },
  eduTileRowEnd: {
    marginRight: 0,
  },
  eduSquircle: {
    width: EDU_SQUIRCLE,
    height: EDU_SQUIRCLE,
    borderRadius: 22,
    backgroundColor: '#eef5f1',
    alignItems: 'center',
    justifyContent: 'center',
  },
  eduLogoInSquircle: {
    width: Math.round(EDU_SQUIRCLE * 0.58),
    height: Math.round(EDU_SQUIRCLE * 0.58),
    maxWidth: 52,
    maxHeight: 52,
  },
  eduTileTitle: {
    marginTop: 10,
    fontSize: 13,
    fontWeight: '700',
    color: '#0f172a',
    textAlign: 'center',
    width: '100%',
  },
  eduTileSub: {
    marginTop: 4,
    fontSize: 11,
    fontWeight: '600',
    color: '#64748b',
    textAlign: 'center',
    width: '100%',
  },
  paymentListTitle: {
    fontSize: 20,
    fontWeight: '900',
    color: '#0a0a0f',
    letterSpacing: -0.5,
    lineHeight: 26,
    marginBottom: 16,
  },
  paymentListGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  paymentListTile: {
    width: PAYMENT_TILE_W,
    marginRight: PAYMENT_GRID_GAP,
    marginBottom: PAYMENT_GRID_GAP,
    alignItems: 'center',
  },
  paymentListTileRowEnd: {
    marginRight: 0,
  },
  paymentListSquircle: {
    width: PAYMENT_TILE_W - 2,
    height: PAYMENT_TILE_W - 2,
    maxWidth: 72,
    maxHeight: 72,
    borderRadius: 22,
    backgroundColor: '#eef5f1',
    alignItems: 'center',
    justifyContent: 'center',
  },
  paymentListSquircleWithBadge: {
    position: 'relative',
  },
  tileCornerBadge: {
    position: 'absolute',
    top: 3,
    right: 2,
    zIndex: 1,
    backgroundColor: GREEN.main,
    paddingHorizontal: 4,
    paddingVertical: 2,
    borderRadius: 5,
    maxWidth: 52,
  },
  tileCornerBadgeText: {
    fontSize: 7,
    fontWeight: '800',
    color: '#ffffff',
    letterSpacing: -0.2,
    textAlign: 'center',
  },
  paymentListLabel: {
    marginTop: 8,
    fontSize: 12,
    fontWeight: '600',
    color: '#0f172a',
    textAlign: 'center',
    width: '100%',
    lineHeight: 15,
  },
  actionShortcutsCard: {
    marginTop: 0,
    marginBottom: 0,
    backgroundColor: '#ffffff',
    borderRadius: 20,
    paddingVertical: 12,
    paddingHorizontal: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(22, 163, 74, 0.18)',
    shadowColor: '#14532d',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    ...(Platform.OS === 'android' ? { elevation: 14 } : {}),
  },
  actionShortcut: {
    width: '23%',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 2,
  },
  actionGlowPlate: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: HEADER.iconPlate,
    alignItems: 'center',
    justifyContent: 'center',
  },
  walletIconWrap: {
    position: 'relative',
    width: 34,
    height: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  walletPlusBadge: {
    position: 'absolute',
    left: -3,
    bottom: -3,
    width: 15,
    height: 15,
    borderRadius: 8,
    backgroundColor: HEADER.accent,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#ffffff',
  },
  dollarCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: HEADER.iconBorder,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    backgroundColor: 'transparent',
  },
  dollarCircleChar: {
    fontSize: 12,
    fontWeight: '800',
    color: HEADER.dark,
    marginTop: -1,
  },
  dollarCircleArrowSend: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    transform: [{ rotate: '45deg' }],
  },
  dollarCircleArrowReq: {
    position: 'absolute',
    bottom: 2,
    left: 2,
    transform: [{ rotate: '-45deg' }],
  },
  historyTenWrap: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  historyTenOverlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
  },
  historyTenCenter: {
    fontSize: 9,
    fontWeight: '900',
    color: HEADER.dark,
    marginTop: 1,
    ...(Platform.OS === 'android' ? { includeFontPadding: false } : {}),
  },
  actionLabel: {
    marginTop: 5,
    fontSize: 9,
    fontWeight: '800',
    color: HEADER.label,
    letterSpacing: -0.15,
    textAlign: 'center',
  },
  goalBodyText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#64748b',
    marginBottom: 10,
    marginTop: -6,
  },
  progressTrack: {
    height: 8,
    borderRadius: 4,
    backgroundColor: '#e2e8f0',
    overflow: 'hidden',
  },
  progressFill: {
    height: 8,
    borderRadius: 4,
    backgroundColor: GREEN.main,
  },
  rewardsBodyText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0f172a',
    marginTop: -6,
  },
  promoHScroll: { flexDirection: 'row', alignItems: 'stretch', gap: 12, paddingRight: 4 },
  promoCardTouch: {},
  promoPeekTouch: { width: 112, borderRadius: 22, overflow: 'hidden' },
  promoCardPeek: {
    flex: 1,
    borderRadius: 22,
    padding: 16,
    justifyContent: 'flex-end',
    minHeight: 132,
  },
  promoPeekTitle: { fontSize: 16, fontWeight: '900', color: 'rgba(255,255,255,0.98)' },
  promoPeekSub: { marginTop: 4, fontSize: 12, fontWeight: '700', color: 'rgba(255,255,255,0.85)' },
  promoCard: {
    width: '100%',
    borderRadius: 22,
    overflow: 'hidden',
    padding: 18,
    shadowColor: '#0f172a',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.12,
    shadowRadius: 18,
    elevation: 4,
  },
  promoCardRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  promoTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: 'rgba(255,255,255,0.98)',
    letterSpacing: -0.2,
  },
  promoSub: {
    marginTop: 4,
    fontSize: 14,
    fontWeight: '800',
    color: 'rgba(255,255,255,0.92)',
  },
  promoDesc: {
    marginTop: 8,
    fontSize: 12,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.75)',
    lineHeight: 17,
  },
  promoIcon: {
    width: 44,
    height: 44,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.16)',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
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

  notifOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15,23,42,0.45)',
    paddingHorizontal: 16,
  },
  notifPanel: {
    alignSelf: 'stretch',
    backgroundColor: '#ffffff',
    borderRadius: 20,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  notifPanelHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  notifPanelTitle: { fontSize: 18, fontWeight: '900', color: GREEN.dark },
  notifPanelActions: { flexDirection: 'row', alignItems: 'center' },
  notifMarkAll: {
    fontSize: 13,
    fontWeight: '800',
    color: GREEN.main,
    marginRight: 8,
  },
  notifCloseBtn: { padding: 4 },
  notifList: { maxHeight: 420 },
  notifEmpty: {
    padding: 24,
    textAlign: 'center',
    color: '#64748b',
    fontWeight: '600',
  },
  notifRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  notifRowUnread: { backgroundColor: '#f0fdf4' },
  notifRowIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#dcfce7',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  notifRowBody: { flex: 1 },
  notifRowTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 },
  notifRowTitle: { flex: 1, fontSize: 14, fontWeight: '900', color: '#0f172a', marginRight: 8 },
  notifRowTime: { fontSize: 11, fontWeight: '700', color: '#94a3b8' },
  notifRowBodyText: { fontSize: 12, fontWeight: '600', color: '#64748b', lineHeight: 17 },
  notifDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: GREEN.main,
    marginTop: 6,
    marginLeft: 4,
  },
});

