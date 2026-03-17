import { StatusBar } from 'expo-status-bar';
import { useEffect, useMemo, useRef, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import { GREEN, NEUTRAL } from '../theme/colors';
import BottomNav from '../components/BottomNav';

const CALC_METHOD = 4; // Umm al-Qura (Salafi-friendly, same as many apps)

function stripOffset(t) {
  if (!t) return '';
  return String(t).split(' ')[0]; // "05:12 (+06)" -> "05:12"
}

function pad2(n) {
  return String(n).padStart(2, '0');
}

function formatHms(ms) {
  const s = Math.max(0, Math.floor(ms / 1000));
  const hh = Math.floor(s / 3600);
  const mm = Math.floor((s % 3600) / 60);
  const ss = s % 60;
  return `${pad2(hh)}:${pad2(mm)}:${pad2(ss)}`;
}

function buildTime(date, hhmm) {
  const [h, m] = String(hhmm || '').split(':').map((x) => parseInt(x, 10));
  if (!Number.isFinite(h) || !Number.isFinite(m)) return null;
  const d = new Date(date);
  d.setHours(h, m, 0, 0);
  return d;
}

function getPrayerSchedule(date, timings) {
  const fajr = buildTime(date, stripOffset(timings?.Fajr));
  const sunrise = buildTime(date, stripOffset(timings?.Sunrise)); // Fajr ends at sunrise
  const dhuhr = buildTime(date, stripOffset(timings?.Dhuhr));
  const asr = buildTime(date, stripOffset(timings?.Asr));
  const maghrib = buildTime(date, stripOffset(timings?.Maghrib));
  const isha = buildTime(date, stripOffset(timings?.Isha));

  const rows = [
    { key: 'Fajr', label: 'Fajr', icon: 'cloudy-night-outline', start: fajr },
    { key: 'Dhuhr', label: 'Dhuhr', icon: 'sunny-outline', start: dhuhr },
    { key: 'Asr', label: 'Asr', icon: 'partly-sunny-outline', start: asr },
    { key: 'Maghrib', label: 'Maghrib', icon: 'moon-outline', start: maghrib },
    { key: 'Isha', label: 'Isha', icon: 'moon-outline', start: isha },
  ].filter((r) => r.start);

  // End time:
  // - Fajr ends at Sunrise
  // - Dhuhr ends at Asr
  // - Asr ends at Maghrib
  // - Maghrib ends at Isha
  // - Isha ends at next day's Fajr (handled separately where needed)
  for (let i = 0; i < rows.length; i++) {
    if (rows[i].key === 'Fajr' && sunrise) {
      rows[i].end = sunrise;
    } else {
      rows[i].end = rows[i + 1]?.start || null;
    }
  }
  return rows;
}

export default function PrayerScreen({ navigation }) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [coords, setCoords] = useState(null);
  const [place, setPlace] = useState(null);
  const [useCustomLocation, setUseCustomLocation] = useState(false);
  const [customCity, setCustomCity] = useState('Makkah');
  const [customCountry, setCustomCountry] = useState('Saudi Arabia');
  const [reloadKey, setReloadKey] = useState(0);
  const [timingsToday, setTimingsToday] = useState(null);
  const [timingsTomorrow, setTimingsTomorrow] = useState(null);
  const [dateInfo, setDateInfo] = useState(null);
  const [nowTick, setNowTick] = useState(Date.now());
  const tickRef = useRef(null);
  const [alarmMap, setAlarmMap] = useState({});

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        setError('');
        let lat = null;
        let lng = null;

        if (!useCustomLocation) {
          const { status } = await Location.requestForegroundPermissionsAsync();
          if (status !== 'granted') {
            setError('Location permission is required to show prayer times.');
            setLoading(false);
            return;
          }
          const loc = await Location.getCurrentPositionAsync({});
          lat = loc.coords.latitude;
          lng = loc.coords.longitude;
          setCoords(loc.coords);
          try {
            const geo = await Location.reverseGeocodeAsync({
              latitude: lat,
              longitude: lng,
            });
            setPlace(geo?.[0] || null);
          } catch {
            // ignore
          }
        }

        const today = new Date();
        const d = today.getDate();
        const m = today.getMonth() + 1;
        const y = today.getFullYear();

        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);
        const d2 = tomorrow.getDate();
        const m2 = tomorrow.getMonth() + 1;
        const y2 = tomorrow.getFullYear();

        const baseToday = useCustomLocation
          ? `https://api.aladhan.com/v1/timingsByCity/${d}-${m}-${y}?city=${encodeURIComponent(
              customCity.trim()
            )}&country=${encodeURIComponent(customCountry.trim())}&method=${CALC_METHOD}`
          : `https://api.aladhan.com/v1/timings/${d}-${m}-${y}?latitude=${lat}&longitude=${lng}&method=${CALC_METHOD}`;
        const baseTomorrow = useCustomLocation
          ? `https://api.aladhan.com/v1/timingsByCity/${d2}-${m2}-${y2}?city=${encodeURIComponent(
              customCity.trim()
            )}&country=${encodeURIComponent(customCountry.trim())}&method=${CALC_METHOD}`
          : `https://api.aladhan.com/v1/timings/${d2}-${m2}-${y2}?latitude=${lat}&longitude=${lng}&method=${CALC_METHOD}`;

        const urlToday = baseToday;
        const urlTomorrow = baseTomorrow;

        const [resToday, resTomorrow] = await Promise.all([fetch(urlToday), fetch(urlTomorrow)]);
        const jsonToday = await resToday.json();
        const jsonTomorrow = await resTomorrow.json();
        if (jsonToday.code !== 200) {
          throw new Error(jsonToday.data?.message || 'Failed to fetch today timings');
        }
        if (jsonTomorrow.code !== 200) {
          throw new Error(jsonTomorrow.data?.message || 'Failed to fetch tomorrow timings');
        }
        setTimingsToday(jsonToday.data.timings);
        setTimingsTomorrow(jsonTomorrow.data.timings);
        setDateInfo(jsonToday.data.date);
      } catch (e) {
        setError(e?.message || 'Failed to load prayer times.');
      } finally {
        setLoading(false);
      }
    })();
  }, [useCustomLocation, reloadKey]);

  useEffect(() => {
    if (tickRef.current) clearInterval(tickRef.current);
    tickRef.current = setInterval(() => setNowTick(Date.now()), 1000);
    return () => {
      if (tickRef.current) clearInterval(tickRef.current);
    };
  }, []);

  const now = useMemo(() => new Date(nowTick), [nowTick]);
  const schedule = useMemo(() => getPrayerSchedule(now, timingsToday), [now, timingsToday]);
  const current = useMemo(() => {
    if (!schedule.length) return null;
    for (let i = schedule.length - 1; i >= 0; i--) {
      if (now >= schedule[i].start) return schedule[i];
    }
    return schedule[0];
  }, [schedule, now]);

  // Derive current prayer end time for the top "waqt ends in" timer
  const currentEnd = useMemo(() => {
    if (!current) return null;
    // For Fajr/Dhuhr/Asr/Maghrib we already set .end inside getPrayerSchedule
    if (current.end) return current.end;

    // Special case: Isha ends at next day's Fajr (Salafi-friendly)
    if (current.key === 'Isha') {
      // Prefer tomorrow's Fajr from API; fallback to today's Fajr + 1 day
      const baseFajr =
        stripOffset(timingsTomorrow?.Fajr) || stripOffset(timingsToday?.Fajr);
      if (baseFajr) {
        const tomorrow = new Date(now);
        tomorrow.setDate(tomorrow.getDate() + 1);
        const fajrTomorrow = buildTime(tomorrow, baseFajr);
        if (fajrTomorrow) return fajrTomorrow;
      }
    }

    // Absolute fallback so timer never disappears: treat end == start
    return current.start || null;
  }, [current, now, timingsToday, timingsTomorrow]);

  const remaining = currentEnd ? currentEnd.getTime() - now.getTime() : null;
  const totalMs = currentEnd && current?.start ? currentEnd.getTime() - current.start.getTime() : null;
  const elapsedMs = totalMs != null && remaining != null ? Math.max(0, totalMs - remaining) : null;
  const arcProgress =
    totalMs && elapsedMs != null ? Math.min(1, Math.max(0, elapsedMs / totalMs)) : 0;

  const nextIftar = useMemo(() => {
    if (!timingsToday && !timingsTomorrow) return null;
    const todayMagh = buildTime(now, stripOffset(timingsToday?.Maghrib));
    if (todayMagh && now < todayMagh) return todayMagh;
    // else use tomorrow maghrib
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const maghTomorrow = buildTime(tomorrow, stripOffset(timingsTomorrow?.Maghrib));
    return maghTomorrow || todayMagh || null;
  }, [now, timingsToday, timingsTomorrow]);
  const nextSehri = useMemo(() => {
    const baseToday = stripOffset(timingsToday?.Imsak || timingsToday?.Fajr);
    const baseTomorrow = stripOffset(timingsTomorrow?.Imsak || timingsTomorrow?.Fajr);
    const sehriToday = baseToday ? buildTime(now, baseToday) : null;
    if (sehriToday && now < sehriToday) return sehriToday;
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const sehriTomorrow = baseTomorrow ? buildTime(tomorrow, baseTomorrow) : null;
    return sehriTomorrow || sehriToday || null;
  }, [now, timingsToday, timingsTomorrow]);
  const untilIftarMs = useMemo(() => {
    if (!nextIftar) return null;
    return Math.max(0, nextIftar.getTime() - now.getTime());
  }, [now, nextIftar]);

  return (
    <View style={styles.screen}>
      <StatusBar style="light" />

      <View style={styles.hero}>
        <View style={styles.heroSky} />
        <View style={styles.sun} />
        <View style={styles.hillBack} />
        <View style={styles.hillFront} />

        <View style={styles.heroTopBar}>
          <View style={styles.locLeft}>
            <Ionicons name="location" size={14} color="#0f172a" />
            <Text style={styles.locText}>
              {useCustomLocation
                ? `${customCity || 'Custom'}, ${customCountry || ''}`
                : place?.city || place?.subregion || place?.region || 'Current location'}
            </Text>
            <Ionicons name="chevron-down" size={14} color="#0f172a" />
          </View>
          <View style={styles.topIcons}>
            <TouchableOpacity style={styles.topIconBtn} activeOpacity={0.7}>
              <Ionicons name="heart-outline" size={18} color="#0f172a" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.topIconBtn} activeOpacity={0.7}>
              <Ionicons name="notifications-outline" size={18} color="#0f172a" />
            </TouchableOpacity>
          </View>
        </View>

        <Text style={styles.dateText}>
          {dateInfo?.gregorian?.date || `${now.getDate()} ${now.toLocaleString('en', { month: 'long' })}, ${now.getFullYear()}`}
        </Text>

        <View style={styles.centerBlock}>
          <View style={styles.arcWrap}>
            <View style={styles.arcTrack} />
            <View style={[styles.arcMask, { height: 92 * (1 - arcProgress) + 2 }]} />
          </View>
          <Text style={styles.waqtName}>{current?.label || '—'}</Text>
          <Text style={styles.waqtSub}>Waqt ends in</Text>
          <Text style={styles.countdownText}>{remaining != null ? formatHms(remaining) : '--:--:--'}</Text>
          {currentEnd && (
            <Text style={styles.endText}>
              Ends at {pad2(currentEnd.getHours())}:{pad2(currentEnd.getMinutes())}
            </Text>
          )}
        </View>
      </View>

      <ScrollView style={styles.sheet} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.sheetCard}>
          <View style={styles.sheetIconRow}>
            <View style={styles.sheetIconCircle}>
              <Ionicons name="moon" size={18} color={GREEN.dark} />
            </View>
            <Text style={styles.sheetIconText}>“Indeed, the prayer is enjoined on the believers at fixed times”</Text>
          </View>
        {loading && (
          <View style={styles.loadingBox}>
            <ActivityIndicator size="large" color={GREEN.main} />
            <Text style={styles.loadingText}>Loading prayer times…</Text>
          </View>
        )}

        {!loading && !!error && (
          <View style={styles.errorBox}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}

        {!loading && !error && !!timingsToday && (
          <>
            <View style={styles.statCard}>
              <View style={styles.statRow}>
                <View style={styles.statCell}>
                  <Text style={styles.statTime}>
                    {nextSehri ? `${pad2(nextSehri.getHours())}:${pad2(nextSehri.getMinutes())}` : '--:--'}
                  </Text>
                  <Text style={styles.statLabel}>Next Sehri</Text>
                </View>
                <View style={styles.statDivider} />
                <View style={styles.statCell}>
                  <Text style={styles.statTime}>
                    {nextIftar ? `${pad2(nextIftar.getHours())}:${pad2(nextIftar.getMinutes())}` : '--:--'}
                  </Text>
                  <Text style={styles.statLabel}>Next Iftar</Text>
                </View>
                <View style={styles.statDivider} />
                <View style={styles.statCell}>
                  <Text style={[styles.statTime, styles.statStrong]}>{untilIftarMs != null ? formatHms(untilIftarMs) : '--:--:--'}</Text>
                  <Text style={styles.statLabel}>Until Iftar</Text>
                </View>
              </View>
              <TouchableOpacity style={styles.fullBtn} activeOpacity={0.8}>
                <Text style={styles.fullBtnText}>View Fullscreen</Text>
                <Ionicons name="chevron-forward" size={16} color={NEUTRAL.subtext} />
              </TouchableOpacity>
            </View>

            <View style={styles.locationCard}>
              <View style={{ flex: 1 }}>
                <Text style={styles.locationTitle}>Location mode</Text>
                <Text style={styles.locationSub}>
                  {useCustomLocation ? 'Using custom city' : 'Using your GPS position'}
                </Text>
              </View>
              <TouchableOpacity
                style={styles.locationToggle}
                activeOpacity={0.8}
                onPress={() => setUseCustomLocation(!useCustomLocation)}
              >
                <View style={[styles.toggleKnob, useCustomLocation && styles.toggleKnobOn]} />
              </TouchableOpacity>
            </View>

            {useCustomLocation && (
              <View style={styles.customLocationRow}>
                <View style={styles.customField}>
                  <Text style={styles.customLabel}>City</Text>
                  <TextInput
                    style={styles.customInput}
                    value={customCity}
                    onChangeText={setCustomCity}
                    placeholder="City"
                  />
                </View>
                <View style={styles.customField}>
                  <Text style={styles.customLabel}>Country</Text>
                  <TextInput
                    style={styles.customInput}
                    value={customCountry}
                    onChangeText={setCustomCountry}
                    placeholder="Country"
                  />
                </View>
                <TouchableOpacity
                  style={styles.mapBtn}
                  activeOpacity={0.8}
                  onPress={async () => {
                    try {
                      const { status } = await Location.requestForegroundPermissionsAsync();
                      if (status !== 'granted') {
                        setError('Location permission is required to use map.');
                        return;
                      }
                      const loc = await Location.getCurrentPositionAsync({});
                      const geo = await Location.reverseGeocodeAsync({
                        latitude: loc.coords.latitude,
                        longitude: loc.coords.longitude,
                      });
                      const g = geo?.[0];
                      if (g) {
                        setCustomCity(g.city || g.subregion || g.region || customCity);
                        setCustomCountry(g.country || customCountry);
                      }
                    } catch (e) {
                      setError(e?.message || 'Failed to read location from map.');
                    }
                  }}
                >
                  <Ionicons name="map-outline" size={16} color="#fff" />
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.applyBtn}
                  activeOpacity={0.8}
                  onPress={() => {
                    setLoading(true);
                    setReloadKey((x) => x + 1);
                  }}
                >
                  <Text style={styles.applyText}>Apply</Text>
                </TouchableOpacity>
              </View>
            )}

            <View style={styles.timesCard}>
              {schedule.map((p, idx) => {
                const isActive = current?.key === p.key;
                const start = stripOffset(timingsToday?.[p.key]);
                const end = p.end ? `${pad2(p.end.getHours())}:${pad2(p.end.getMinutes())}` : '';
                const alarmOn = !!alarmMap[p.key];
                return (
                  <View key={p.key} style={[styles.timeRow, idx === schedule.length - 1 && styles.timeRowLast]}>
                    <View style={[styles.timeIcon, isActive && styles.timeIconActive]}>
                      <Ionicons name={p.icon} size={18} color={isActive ? GREEN.dark : NEUTRAL.subtext} />
                    </View>
                    <Text style={[styles.timeName, isActive && styles.timeNameActive]}>{p.label}</Text>
                    <View style={styles.timeRight}>
                      <Text style={styles.timeRange}>
                        {start}{end ? `  -  ${end}` : ''}
                      </Text>
                      <TouchableOpacity
                        style={[styles.bellBtn, alarmOn && styles.bellBtnOn]}
                        activeOpacity={0.8}
                        onPress={() =>
                          setAlarmMap((prev) => ({
                            ...prev,
                            [p.key]: !prev[p.key],
                          }))
                        }
                      >
                        <Ionicons
                          name={alarmOn ? 'notifications' : 'notifications-outline'}
                          size={16}
                          color={alarmOn ? GREEN.dark : NEUTRAL.subtext}
                        />
                      </TouchableOpacity>
                    </View>
                  </View>
                );
              })}
            </View>
          </>
        )}

        <View style={{ height: 90 }} />
        </View>
      </ScrollView>

      <BottomNav navigation={navigation} active="prayer" />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#e5f5ec' },

  hero: {
    height: 360,
    backgroundColor: '#bbf7d0',
    overflow: 'hidden',
  },
  heroSky: { ...StyleSheet.absoluteFillObject, backgroundColor: '#bbf7d0' },
  sun: {
    position: 'absolute',
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: '#ffe58f',
    top: 110,
    right: 60,
    opacity: 0.9,
  },
  hillBack: {
    position: 'absolute',
    left: -40,
    right: -40,
    bottom: 120,
    height: 120,
    borderTopLeftRadius: 120,
    borderTopRightRadius: 120,
    backgroundColor: 'rgba(34,197,94,0.15)',
  },
  hillFront: {
    position: 'absolute',
    left: -60,
    right: -60,
    bottom: 90,
    height: 140,
    borderTopLeftRadius: 140,
    borderTopRightRadius: 140,
    backgroundColor: 'rgba(22,163,74,0.18)',
  },
  heroTopBar: {
    position: 'absolute',
    top: 54,
    left: 20,
    right: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  locLeft: { flexDirection: 'row', alignItems: 'center' },
  locText: { marginLeft: 6, marginRight: 6, fontWeight: '900', color: '#0f172a' },
  topIcons: { flexDirection: 'row' },
  topIconBtn: { width: 38, height: 38, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  dateText: { position: 'absolute', top: 86, left: 40, color: 'rgba(15,23,42,0.75)', fontWeight: '800', fontSize: 12 },

  centerBlock: { position: 'absolute', top: 120, left: 0, right: 0, alignItems: 'center' },
  arcWrap: { width: 180, height: 90, overflow: 'hidden', alignItems: 'center' },
  arcTrack: {
    width: 180,
    height: 180,
    borderRadius: 90,
    borderWidth: 14,
    borderColor: 'rgba(22,163,74,0.35)',
  },
  arcMask: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 92,
    backgroundColor: '#bbf7d0',
  },
  waqtName: { marginTop: 6, fontSize: 18, fontWeight: '900', color: '#0f172a' },
  waqtSub: { marginTop: 4, fontSize: 12, fontWeight: '800', color: 'rgba(15,23,42,0.7)' },
  countdownText: { marginTop: 6, fontSize: 28, fontWeight: '900', color: GREEN.dark },
  endText: { marginTop: 4, fontSize: 12, fontWeight: '800', color: 'rgba(15,23,42,0.75)' },

  sheet: {
    flex: 1,
    marginTop: 40,
    backgroundColor: 'transparent',
  },
  sheetCard: {
    flex: 1,
    backgroundColor: '#fff',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingTop: 16,
    paddingHorizontal: 20,
  },
  content: { paddingBottom: 24 },
  sheetIconRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  sheetIconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#dcfce7',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  sheetIconText: {
    flex: 1,
    fontSize: 11,
    fontWeight: '700',
    color: NEUTRAL.subtext,
  },
  loadingBox: { alignItems: 'center', justifyContent: 'center', paddingVertical: 40 },
  loadingText: { marginTop: 10, color: NEUTRAL.subtext, fontWeight: '700' },
  errorBox: {
    marginTop: 20,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#fee2e2',
    backgroundColor: '#fef2f2',
    padding: 14,
  },
  errorText: { color: '#b91c1c', fontWeight: '800', fontSize: 13 },

  statCard: {
    borderRadius: 18,
    backgroundColor: '#ecfdf3',
    borderWidth: 1,
    borderColor: GREEN.pale,
    overflow: 'hidden',
    marginBottom: 14,
  },
  statRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 14 },
  statCell: { flex: 1, alignItems: 'center' },
  statDivider: { width: 1, height: 34, backgroundColor: '#e2e8f0' },
  statTime: { fontSize: 16, fontWeight: '900', color: '#0f172a' },
  statStrong: { fontSize: 18 },
  statLabel: { marginTop: 2, fontSize: 12, fontWeight: '800', color: NEUTRAL.subtext },
  fullBtn: {
    height: 44,
    backgroundColor: '#ffffff',
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  fullBtnText: { fontWeight: '900', color: NEUTRAL.subtext, marginRight: 6 },

  locationCard: {
    marginTop: 10,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    backgroundColor: '#f8fafc',
    paddingHorizontal: 14,
    paddingVertical: 10,
    flexDirection: 'row',
    alignItems: 'center',
  },
  locationTitle: { fontSize: 13, fontWeight: '900', color: '#0f172a' },
  locationSub: { marginTop: 2, fontSize: 11, fontWeight: '700', color: NEUTRAL.subtext },
  locationToggle: {
    width: 46,
    height: 26,
    borderRadius: 13,
    backgroundColor: '#e2e8f0',
    padding: 3,
    justifyContent: 'center',
  },
  toggleKnob: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#ffffff',
    alignSelf: 'flex-start',
  },
  toggleKnobOn: {
    alignSelf: 'flex-end',
    backgroundColor: GREEN.main,
  },
  customLocationRow: {
    marginTop: 10,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    backgroundColor: '#ffffff',
    padding: 10,
    flexDirection: 'row',
    alignItems: 'flex-end',
  },
  customField: { flex: 1, marginRight: 8 },
  customLabel: { fontSize: 11, fontWeight: '800', color: NEUTRAL.subtext, marginBottom: 2 },
  customInput: {
    height: 40,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    paddingHorizontal: 8,
    fontSize: 13,
    fontWeight: '800',
    color: '#0f172a',
  },
  mapBtn: {
    height: 40,
    width: 40,
    borderRadius: 12,
    backgroundColor: '#38bdf8',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 6,
  },
  applyBtn: {
    height: 40,
    borderRadius: 12,
    backgroundColor: GREEN.dark,
    paddingHorizontal: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  applyText: { color: '#fff', fontWeight: '900', fontSize: 13 },

  sectionHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10, marginTop: 4 },
  sectionTitle2: { fontSize: 18, fontWeight: '900', color: '#0f172a' },
  setAlarm: { fontSize: 14, fontWeight: '900', color: '#16a34a' },

  timesCard: {
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    backgroundColor: '#fff',
    paddingVertical: 6,
  },
  timeRow: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 14, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#f1f5f9' },
  timeRowLast: { borderBottomWidth: 0 },
  timeIcon: { width: 34, height: 34, borderRadius: 17, backgroundColor: '#f1f5f9', alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  timeIconActive: { backgroundColor: 'rgba(34,197,94,0.15)' },
  timeName: { flex: 1, fontSize: 14, fontWeight: '900', color: '#0f172a' },
  timeNameActive: { color: GREEN.dark },
  timeRight: { alignItems: 'flex-end' },
  timeRange: { fontSize: 13, fontWeight: '800', color: NEUTRAL.subtext },
  bellBtn: {
    marginTop: 4,
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#e2e8f0',
  },
  bellBtnOn: { backgroundColor: GREEN.pale },
});

