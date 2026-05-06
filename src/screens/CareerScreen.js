import { StatusBar } from 'expo-status-bar';
import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Alert,
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

const CAREER_STORAGE_KEY = 'dmf_career_demo_applications_v1';

const PROCESS_STEPS = ['Applied', 'Shortlisted', 'Interview', 'Selected'];

const DEMO_JOBS = [
  {
    id: 'job-frontend',
    title: 'Junior Frontend Developer',
    company: 'DMF Digital Lab',
    location: 'Dhaka',
    type: 'Full-time',
    salary: '৳25,000 - ৳35,000',
    category: 'Tech',
    description: 'React, UI implementation, reusable component building এবং API data integration নিয়ে কাজ।',
    requirements: ['React basics', 'Responsive UI', 'Team communication'],
  },
  {
    id: 'job-support',
    title: 'Student Support Executive',
    company: 'Dar Al Muttaqin',
    location: 'Chattogram',
    type: 'Remote',
    salary: '৳18,000 - ৳24,000',
    category: 'Support',
    description: 'শিক্ষার্থী ও অভিভাবকদের guide করা, application help দেওয়া এবং daily follow-up manage করা।',
    requirements: ['Communication', 'Google Sheets', 'Problem solving'],
  },
  {
    id: 'job-designer',
    title: 'Graphics & Social Media Designer',
    company: 'DMF Media Wing',
    location: 'Sylhet',
    type: 'Contract',
    salary: '৳20,000 - ৳28,000',
    category: 'Design',
    description: 'Social post, event banner, campaign creative এবং short-form visual asset design।',
    requirements: ['Canva/Figma', 'Brand sense', 'File handoff'],
  },
  {
    id: 'job-coordinator',
    title: 'Program Coordinator',
    company: 'DMF Scholarship Cell',
    location: 'Khulna',
    type: 'Full-time',
    salary: '৳30,000 - ৳40,000',
    category: 'Operations',
    description: 'Program planning, field coordination, volunteer sync এবং report preparation।',
    requirements: ['Planning', 'MS Office', 'Leadership'],
  },
];

function badgeTone(category) {
  switch (category) {
    case 'Tech':
      return { bg: '#dbeafe', text: '#1d4ed8' };
    case 'Support':
      return { bg: '#fef3c7', text: '#b45309' };
    case 'Design':
      return { bg: '#fce7f3', text: '#be185d' };
    default:
      return { bg: '#dcfce7', text: '#166534' };
  }
}

function buildApplication(job) {
  return {
    applicationId: `app-${job.id}`,
    jobId: job.id,
    statusIndex: 0,
    statusLabel: PROCESS_STEPS[0],
    appliedAt: 'Today',
    nextAction: 'CV review চলছে',
    note: 'আপনার profile demo shortlist pool-এ যোগ হয়েছে।',
  };
}

export default function CareerScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const [applications, setApplications] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('All');

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const raw = await AsyncStorage.getItem(CAREER_STORAGE_KEY);
        if (cancelled || !raw) return;
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) setApplications(parsed);
      } catch {
        /* ignore demo storage issues */
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const saveApplications = useCallback((next) => {
    setApplications(next);
    AsyncStorage.setItem(CAREER_STORAGE_KEY, JSON.stringify(next)).catch(() => {});
  }, []);

  const categories = useMemo(
    () => ['All', ...Array.from(new Set(DEMO_JOBS.map((job) => job.category)))],
    []
  );

  const visibleJobs = useMemo(() => {
    if (selectedCategory === 'All') return DEMO_JOBS;
    return DEMO_JOBS.filter((job) => job.category === selectedCategory);
  }, [selectedCategory]);

  const appliedJobIds = useMemo(
    () => new Set(applications.map((item) => item.jobId)),
    [applications]
  );

  const appliedCount = applications.length;
  const inProgressCount = applications.filter((item) => item.statusIndex < PROCESS_STEPS.length - 1).length;
  const selectedCount = applications.filter((item) => item.statusIndex === PROCESS_STEPS.length - 1).length;

  const applyToJob = useCallback(
    (job) => {
      if (appliedJobIds.has(job.id)) return;
      const next = [buildApplication(job), ...applications];
      saveApplications(next);
      Alert.alert('Application submitted', `${job.title} এর জন্য demo application submit হয়েছে।`);
    },
    [applications, appliedJobIds, saveApplications]
  );

  const advanceApplication = useCallback(
    (jobId) => {
      const next = applications.map((item) => {
        if (item.jobId !== jobId) return item;
        const nextIndex = Math.min(item.statusIndex + 1, PROCESS_STEPS.length - 1);
        const nextLabel = PROCESS_STEPS[nextIndex];
        const nextAction =
          nextIndex === 1
            ? 'Interview shortlist তৈরি হয়েছে'
            : nextIndex === 2
              ? 'Interview schedule confirmed'
              : 'Offer ready';
        const nextNote =
          nextIndex === PROCESS_STEPS.length - 1
            ? 'অভিনন্দন! Demo offer unlocked.'
            : 'নতুন stage update হয়েছে।';
        return {
          ...item,
          statusIndex: nextIndex,
          statusLabel: nextLabel,
          nextAction,
          note: nextNote,
        };
      });
      saveApplications(next);
    },
    [applications, saveApplications]
  );

  const withdrawApplication = useCallback(
    (jobId) => {
      const next = applications.filter((item) => item.jobId !== jobId);
      saveApplications(next);
    },
    [applications, saveApplications]
  );

  return (
    <View style={styles.screen}>
      <StatusBar style="dark" />
      <LinearGradient
        colors={['#ecfdf5', '#f8fafc', '#ffffff']}
        locations={[0, 0.55, 1]}
        style={[styles.hero, { paddingTop: Math.max(insets.top, 10) + 4 }]}
      >
        <View style={styles.headerRow}>
          <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()} activeOpacity={0.85}>
            <Ionicons name="chevron-back" size={22} color={GREEN.dark} />
          </TouchableOpacity>
          <View style={styles.headerText}>
            <Text style={styles.headerTitle}>Career Hub</Text>
            <Text style={styles.headerSub}>Demo jobs, apply flow এবং progress tracker</Text>
          </View>
          <View style={styles.headerSpacer} />
        </View>

        <View style={styles.summaryCard}>
          <View style={styles.summaryBlock}>
            <Text style={styles.summaryValue}>{appliedCount}</Text>
            <Text style={styles.summaryLabel}>Applied</Text>
          </View>
          <View style={styles.summaryDivider} />
          <View style={styles.summaryBlock}>
            <Text style={styles.summaryValue}>{inProgressCount}</Text>
            <Text style={styles.summaryLabel}>In Progress</Text>
          </View>
          <View style={styles.summaryDivider} />
          <View style={styles.summaryBlock}>
            <Text style={styles.summaryValue}>{selectedCount}</Text>
            <Text style={styles.summaryLabel}>Selected</Text>
          </View>
        </View>
      </LinearGradient>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 28 }]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Browse Jobs</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterRow}>
            {categories.map((category) => {
              const active = category === selectedCategory;
              return (
                <Pressable
                  key={category}
                  style={[styles.filterChip, active && styles.filterChipActive]}
                  onPress={() => setSelectedCategory(category)}
                >
                  <Text style={[styles.filterChipText, active && styles.filterChipTextActive]}>{category}</Text>
                </Pressable>
              );
            })}
          </ScrollView>

          {visibleJobs.map((job) => {
            const tone = badgeTone(job.category);
            const alreadyApplied = appliedJobIds.has(job.id);
            return (
              <View key={job.id} style={styles.jobCard}>
                <View style={styles.jobTopRow}>
                  <View style={styles.jobTitleWrap}>
                    <Text style={styles.jobTitle}>{job.title}</Text>
                    <Text style={styles.jobCompany}>{job.company}</Text>
                  </View>
                  <View style={[styles.categoryBadge, { backgroundColor: tone.bg }]}>
                    <Text style={[styles.categoryBadgeText, { color: tone.text }]}>{job.category}</Text>
                  </View>
                </View>

                <View style={styles.metaRow}>
                  <MetaPill icon="location-outline" label={job.location} />
                  <MetaPill icon="briefcase-outline" label={job.type} />
                  <MetaPill icon="cash-outline" label={job.salary} />
                </View>

                <Text style={styles.jobDesc}>{job.description}</Text>

                <View style={styles.requirementsRow}>
                  {job.requirements.map((item) => (
                    <View key={`${job.id}-${item}`} style={styles.reqChip}>
                      <Text style={styles.reqChipText}>{item}</Text>
                    </View>
                  ))}
                </View>

                <TouchableOpacity
                  style={[styles.primaryBtn, alreadyApplied && styles.primaryBtnMuted]}
                  activeOpacity={0.88}
                  onPress={() => {
                    if (alreadyApplied) return;
                    applyToJob(job);
                  }}
                >
                  <Ionicons
                    name={alreadyApplied ? 'checkmark-circle-outline' : 'paper-plane-outline'}
                    size={18}
                    color={alreadyApplied ? GREEN.dark : '#ffffff'}
                  />
                  <Text style={[styles.primaryBtnText, alreadyApplied && styles.primaryBtnTextMuted]}>
                    {alreadyApplied ? 'Application Submitted' : 'Apply Now'}
                  </Text>
                </TouchableOpacity>
              </View>
            );
          })}
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHead}>
            <Text style={styles.sectionTitle}>My Applications</Text>
            <Text style={styles.sectionHint}>Step-by-step demo process</Text>
          </View>

          {applications.length === 0 ? (
            <View style={styles.emptyCard}>
              <View style={styles.emptyIconWrap}>
                <Ionicons name="briefcase-outline" size={28} color={GREEN.main} />
              </View>
              <Text style={styles.emptyTitle}>এখনও কোনো application নেই</Text>
              <Text style={styles.emptySub}>উপরে থাকা job card থেকে apply করলে progress tracker এখানে দেখা যাবে।</Text>
            </View>
          ) : (
            applications.map((application) => {
              const job = DEMO_JOBS.find((item) => item.id === application.jobId);
              if (!job) return null;
              const progressWidth = `${((application.statusIndex + 1) / PROCESS_STEPS.length) * 100}%`;

              return (
                <View key={application.applicationId} style={styles.applicationCard}>
                  <View style={styles.applicationHeader}>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.applicationTitle}>{job.title}</Text>
                      <Text style={styles.applicationSub}>{job.company} • Applied {application.appliedAt}</Text>
                    </View>
                    <View style={styles.statusBadge}>
                      <Text style={styles.statusBadgeText}>{application.statusLabel}</Text>
                    </View>
                  </View>

                  <View style={styles.progressTrack}>
                    <View style={[styles.progressFill, { width: progressWidth }]} />
                  </View>

                  <View style={styles.stepsRow}>
                    {PROCESS_STEPS.map((step, index) => {
                      const done = index <= application.statusIndex;
                      return (
                        <View key={`${application.applicationId}-${step}`} style={styles.stepItem}>
                          <View style={[styles.stepDot, done && styles.stepDotDone]}>
                            {done ? <Ionicons name="checkmark" size={11} color="#fff" /> : null}
                          </View>
                          <Text style={[styles.stepLabel, done && styles.stepLabelDone]}>{step}</Text>
                        </View>
                      );
                    })}
                  </View>

                  <View style={styles.infoPanel}>
                    <InfoLine icon="sparkles-outline" text={application.nextAction} />
                    <InfoLine icon="document-text-outline" text={application.note} />
                  </View>

                  <View style={styles.actionRow}>
                    <TouchableOpacity
                      style={[
                        styles.secondaryBtn,
                        application.statusIndex === PROCESS_STEPS.length - 1 && styles.secondaryBtnDisabled,
                      ]}
                      activeOpacity={0.88}
                      onPress={() => {
                        if (application.statusIndex === PROCESS_STEPS.length - 1) return;
                        advanceApplication(application.jobId);
                      }}
                    >
                      <Ionicons name="trending-up-outline" size={16} color={GREEN.dark} />
                      <Text style={styles.secondaryBtnText}>
                        {application.statusIndex === PROCESS_STEPS.length - 1 ? 'Completed' : 'Next Stage'}
                      </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={styles.ghostBtn}
                      activeOpacity={0.88}
                      onPress={() => withdrawApplication(application.jobId)}
                    >
                      <Ionicons name="close-circle-outline" size={16} color="#b91c1c" />
                      <Text style={styles.ghostBtnText}>Withdraw</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              );
            })
          )}
        </View>
      </ScrollView>
    </View>
  );
}

function MetaPill({ icon, label }) {
  return (
    <View style={styles.metaPill}>
      <Ionicons name={icon} size={14} color={GREEN.dark} />
      <Text style={styles.metaPillText}>{label}</Text>
    </View>
  );
}

function InfoLine({ icon, text }) {
  return (
    <View style={styles.infoLine}>
      <Ionicons name={icon} size={15} color={GREEN.main} />
      <Text style={styles.infoLineText}>{text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#f8fafc' },
  hero: { paddingHorizontal: 16, paddingBottom: 16 },
  headerRow: { flexDirection: 'row', alignItems: 'center' },
  backBtn: {
    width: 42,
    height: 42,
    borderRadius: 14,
    backgroundColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#dcfce7',
  },
  headerText: { flex: 1, marginLeft: 12 },
  headerTitle: { fontSize: 20, fontWeight: '900', color: GREEN.dark },
  headerSub: { marginTop: 3, fontSize: 12, fontWeight: '600', color: '#475569' },
  headerSpacer: { width: 42 },
  summaryCard: {
    marginTop: 18,
    borderRadius: 24,
    paddingVertical: 18,
    paddingHorizontal: 16,
    backgroundColor: '#166534',
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#166534',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.18,
    shadowRadius: 20,
    elevation: 5,
  },
  summaryBlock: { flex: 1, alignItems: 'center' },
  summaryValue: { fontSize: 24, fontWeight: '900', color: '#ffffff' },
  summaryLabel: { marginTop: 4, fontSize: 12, fontWeight: '700', color: '#dcfce7' },
  summaryDivider: { width: 1, height: 36, backgroundColor: 'rgba(255,255,255,0.18)' },
  scroll: { flex: 1 },
  content: { paddingHorizontal: 16, paddingTop: 16 },
  section: { marginBottom: 16 },
  sectionHead: {
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  sectionTitle: { fontSize: 18, fontWeight: '900', color: NEUTRAL.text, marginBottom: 10 },
  sectionHint: { fontSize: 12, fontWeight: '700', color: '#64748b' },
  filterRow: { paddingBottom: 8 },
  filterChip: {
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 999,
    marginRight: 8,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  filterChipActive: {
    backgroundColor: '#166534',
    borderColor: '#166534',
  },
  filterChipText: { fontSize: 13, fontWeight: '800', color: '#334155' },
  filterChipTextActive: { color: '#ffffff' },
  jobCard: {
    backgroundColor: '#ffffff',
    borderRadius: 22,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    shadowColor: '#0f172a',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.05,
    shadowRadius: 14,
    elevation: 3,
  },
  jobTopRow: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 10 },
  jobTitleWrap: { flex: 1, paddingRight: 10 },
  jobTitle: { fontSize: 17, fontWeight: '900', color: NEUTRAL.text },
  jobCompany: { marginTop: 4, fontSize: 13, fontWeight: '700', color: '#475569' },
  categoryBadge: { borderRadius: 999, paddingHorizontal: 10, paddingVertical: 6 },
  categoryBadgeText: { fontSize: 11, fontWeight: '800' },
  metaRow: { flexDirection: 'row', flexWrap: 'wrap', marginBottom: 10 },
  metaPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 999,
    backgroundColor: '#f0fdf4',
    marginRight: 8,
    marginBottom: 8,
  },
  metaPillText: { marginLeft: 6, fontSize: 11, fontWeight: '700', color: GREEN.dark },
  jobDesc: { fontSize: 13, lineHeight: 20, color: '#475569' },
  requirementsRow: { flexDirection: 'row', flexWrap: 'wrap', marginTop: 12, marginBottom: 14 },
  reqChip: {
    borderRadius: 10,
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    paddingHorizontal: 10,
    paddingVertical: 7,
    marginRight: 8,
    marginBottom: 8,
  },
  reqChipText: { fontSize: 11, fontWeight: '700', color: '#334155' },
  primaryBtn: {
    height: 46,
    borderRadius: 14,
    backgroundColor: GREEN.main,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  primaryBtnMuted: { backgroundColor: '#dcfce7' },
  primaryBtnText: { marginLeft: 8, fontSize: 14, fontWeight: '800', color: '#ffffff' },
  primaryBtnTextMuted: { color: GREEN.dark },
  emptyCard: {
    backgroundColor: '#ffffff',
    borderRadius: 22,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    padding: 20,
    alignItems: 'center',
  },
  emptyIconWrap: {
    width: 56,
    height: 56,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#dcfce7',
    marginBottom: 12,
  },
  emptyTitle: { fontSize: 16, fontWeight: '900', color: NEUTRAL.text },
  emptySub: {
    marginTop: 6,
    fontSize: 13,
    lineHeight: 20,
    textAlign: 'center',
    color: '#64748b',
  },
  applicationCard: {
    backgroundColor: '#ffffff',
    borderRadius: 22,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    padding: 16,
    marginBottom: 12,
  },
  applicationHeader: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 12 },
  applicationTitle: { fontSize: 16, fontWeight: '900', color: NEUTRAL.text },
  applicationSub: { marginTop: 4, fontSize: 12, fontWeight: '700', color: '#64748b' },
  statusBadge: {
    marginLeft: 10,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: '#ecfdf5',
  },
  statusBadgeText: { fontSize: 11, fontWeight: '800', color: GREEN.dark },
  progressTrack: {
    height: 8,
    borderRadius: 999,
    backgroundColor: '#e2e8f0',
    overflow: 'hidden',
    marginBottom: 14,
  },
  progressFill: { height: '100%', borderRadius: 999, backgroundColor: GREEN.main },
  stepsRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 14 },
  stepItem: { alignItems: 'center', flex: 1 },
  stepDot: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#cbd5e1',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  stepDotDone: { backgroundColor: GREEN.main },
  stepLabel: { fontSize: 10, fontWeight: '700', color: '#94a3b8' },
  stepLabelDone: { color: GREEN.dark },
  infoPanel: {
    borderRadius: 16,
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    padding: 12,
    marginBottom: 14,
  },
  infoLine: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  infoLineText: { flex: 1, marginLeft: 8, fontSize: 12, fontWeight: '700', color: '#334155' },
  actionRow: { flexDirection: 'row' },
  secondaryBtn: {
    flex: 1,
    height: 42,
    borderRadius: 13,
    backgroundColor: '#dcfce7',
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    marginRight: 8,
  },
  secondaryBtnDisabled: { opacity: 0.7 },
  secondaryBtnText: { marginLeft: 7, fontSize: 13, fontWeight: '800', color: GREEN.dark },
  ghostBtn: {
    width: 120,
    height: 42,
    borderRadius: 13,
    backgroundColor: '#fef2f2',
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  ghostBtnText: { marginLeft: 7, fontSize: 13, fontWeight: '800', color: '#b91c1c' },
});
