import { StatusBar } from 'expo-status-bar';
import { useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  findNodeHandle,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { GREEN, NEUTRAL } from '../theme/colors';
import { useAuth } from '../context/AuthContext';
import { uploadToImgbb } from '../api/imgbb';
import { assertProfilePickSizeOk, prepareProfileImageForUpload } from '../utils/profileImagePrep';
import BottomNav from '../components/BottomNav';

function Field({ label, value, onChangeText, placeholder, keyboardType, onFocus, editable = true }) {
  return (
    <View style={{ marginBottom: 12 }}>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.inputWrap}>
        <TextInput
          style={styles.input}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={NEUTRAL.subtext}
          keyboardType={keyboardType}
          onFocus={onFocus}
          editable={editable}
        />
      </View>
    </View>
  );
}

export default function EditProfileScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const { me, isBusy, updateProfile } = useAuth();
  const [scrollRef, setScrollRef] = useState(null);

  // Backend updateUser finds user by email in body, so we must send email.
  const email = useMemo(() => (me?.email ? String(me.email).trim().toLowerCase() : ''), [me]);

  const [firstName, setFirstName] = useState(me?.firstName || '');
  const [lastName, setLastName] = useState(me?.lastName || '');
  const [username, setUsername] = useState(me?.username || '');
  const [phone, setPhone] = useState(me?.phone || '');
  const [profession, setProfession] = useState(me?.profession || '');
  const [currentAddress, setCurrentAddress] = useState(me?.currentAddress || '');
  const [permanentAddress, setPermanentAddress] = useState(me?.permanentAddress || '');
  const [image, setImage] = useState(me?.image || me?.avatar || me?.imageUrl || '');

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isUploadingImage, setIsUploadingImage] = useState(false);

  const onPickAndUploadImage = async () => {
    setError('');
    setSuccess('');

    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (perm.status !== 'granted') {
      setError('Please allow photo library permission to upload profile image.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.72,
    });

    if (result.canceled) return;

    const asset = result.assets?.[0];
    const uri = asset?.uri;
    if (!uri) {
      setError('Could not read selected image.');
      return;
    }

    setIsUploadingImage(true);
    try {
      assertProfilePickSizeOk(asset?.fileSize);
      const preparedUri = await prepareProfileImageForUpload(uri, {
        width: asset?.width,
        height: asset?.height,
      });
      const { url } = await uploadToImgbb({ uri: preparedUri, mimeType: 'image/jpeg' });
      setImage(url);
      setSuccess('Photo uploaded.');
    } catch (e) {
      setError(e?.message || 'Image upload failed');
    } finally {
      setIsUploadingImage(false);
    }
  };

  const onSave = async () => {
    setError('');
    setSuccess('');
    if (!email) {
      setError('Your account email is missing. Please login again.');
      return;
    }

    const payload = {
      email,
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      username: username.trim(),
      phone: phone.trim(),
      profession: profession.trim(),
      currentAddress: currentAddress.trim(),
      permanentAddress: permanentAddress.trim(),
      image: image.trim(),
    };

    const res = await updateProfile(payload);
    if (!res.ok) {
      setError(res.error || 'Update failed');
      return;
    }
    setSuccess('Profile updated successfully.');
    setTimeout(() => navigation.goBack(), 600);
  };

  const scrollToFocusedInput = (e) => {
    const node = findNodeHandle(e?.target);
    if (!node || !scrollRef) return;
    // Leaves room for keyboard + save button
    const extraOffset = 120;
    try {
      scrollRef.scrollResponderScrollNativeHandleToKeyboard(node, extraOffset, true);
    } catch {
      // ignore
    }
  };

  return (
    <View style={styles.screen}>
      <StatusBar style="light" />

      <View style={styles.top}>
        <View style={styles.topBgBubble} />
        <View style={[styles.topInner, { paddingTop: Math.max(insets.top, 8) + 8 }]}>
          <View style={styles.topRow}>
            <TouchableOpacity style={styles.iconBtn} activeOpacity={0.7} onPress={() => navigation.goBack()}>
              <Ionicons name="chevron-back" size={22} color="#fff" />
            </TouchableOpacity>
            <Text style={styles.topTitle}>Edit Profile</Text>
            <View style={{ width: 44 }} />
          </View>
          <Text style={styles.heroSub}>Update your basic details and contact info.</Text>
        </View>
      </View>

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 8 : 0}
      >
        <ScrollView
          ref={setScrollRef}
          style={styles.sheet}
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          automaticallyAdjustKeyboardInsets
        >
          <View style={styles.panel}>
          <View style={styles.profileHeader}>
            <View style={styles.avatarWrap}>
              {image ? (
                <Image source={{ uri: image }} style={styles.avatarImg} />
              ) : (
                <View style={styles.avatarFallback}>
                  <Ionicons name="person" size={22} color={GREEN.dark} />
                </View>
              )}
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.headerName}>
                {`${(firstName || '').trim()} ${(lastName || '').trim()}`.trim() || (username || '').trim() || 'Your profile'}
              </Text>
              <Text style={styles.headerSub}>{email || '—'}</Text>
              <View style={styles.headerBtns}>
                <TouchableOpacity
                  style={[styles.smallBtn, (isBusy || isUploadingImage) && { opacity: 0.7 }]}
                  activeOpacity={0.85}
                  onPress={onPickAndUploadImage}
                  disabled={isBusy || isUploadingImage}
                >
                  {isUploadingImage ? (
                    <ActivityIndicator size="small" color={GREEN.dark} />
                  ) : (
                    <Ionicons name="cloud-upload-outline" size={16} color={GREEN.dark} />
                  )}
                  <Text style={styles.smallBtnText}>{isUploadingImage ? 'Uploading…' : 'Change photo'}</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>

          <Field
            label="Email (read only)"
            value={email}
            onChangeText={() => {}}
            placeholder=""
            keyboardType="email-address"
            editable={false}
          />

          <Field label="First name" value={firstName} onChangeText={setFirstName} placeholder="First name" onFocus={scrollToFocusedInput} />
          <Field label="Last name" value={lastName} onChangeText={setLastName} placeholder="Last name" onFocus={scrollToFocusedInput} />
          <Field label="Username" value={username} onChangeText={setUsername} placeholder="Username" onFocus={scrollToFocusedInput} />
          <Field
            label="Phone"
            value={phone}
            onChangeText={setPhone}
            placeholder="Phone number"
            keyboardType="phone-pad"
            onFocus={scrollToFocusedInput}
          />
          <Field label="Profession" value={profession} onChangeText={setProfession} placeholder="Profession" onFocus={scrollToFocusedInput} />
          <Field
            label="Current address"
            value={currentAddress}
            onChangeText={setCurrentAddress}
            placeholder="Current address"
            onFocus={scrollToFocusedInput}
          />
          <Field
            label="Permanent address"
            value={permanentAddress}
            onChangeText={setPermanentAddress}
            placeholder="Permanent address"
            onFocus={scrollToFocusedInput}
          />

          {!!error && <Text style={styles.errorText}>{error}</Text>}
          {!!success && <Text style={styles.successText}>{success}</Text>}

          <TouchableOpacity
            style={[styles.saveBtn, (isBusy || isUploadingImage) && { opacity: 0.7 }]}
            activeOpacity={0.85}
            onPress={onSave}
            disabled={isBusy || isUploadingImage}
          >
            {isBusy ? <ActivityIndicator size="small" color="#fff" /> : <Ionicons name="save-outline" size={18} color="#fff" />}
            <Text style={styles.saveText}>{isBusy ? 'Saving…' : 'Save changes'}</Text>
          </TouchableOpacity>
          </View>

          <View style={{ height: 36 }} />
        </ScrollView>
      </KeyboardAvoidingView>
      <BottomNav navigation={navigation} active="profile" />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: GREEN.bg },
  flex: { flex: 1 },
  top: {
    height: 210,
    backgroundColor: GREEN.dark,
    overflow: 'hidden',
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
  },
  topBgBubble: {
    position: 'absolute',
    width: 280,
    height: 280,
    borderRadius: 140,
    backgroundColor: 'rgba(34,197,94,0.28)',
    top: -120,
    left: -90,
  },
  topInner: { flex: 1, paddingHorizontal: 20 },
  topRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  iconBtn: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.16)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.22)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  topTitle: { color: '#fff', fontWeight: '900', fontSize: 18 },
  heroSub: { marginTop: 12, color: 'rgba(234,255,240,0.9)', fontWeight: '700', fontSize: 13, lineHeight: 18 },

  sheet: {
    flex: 1,
    marginTop: -18,
    backgroundColor: '#fff',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
  },
  content: { paddingTop: 18, paddingHorizontal: 20 },
  panel: {
    borderRadius: 20,
    borderWidth: 1,
    borderColor: GREEN.pale,
    backgroundColor: '#fff',
    padding: 14,
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingBottom: 14,
    marginBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  avatarWrap: {
    width: 64,
    height: 64,
    borderRadius: 32,
    overflow: 'hidden',
    backgroundColor: GREEN.pale,
    borderWidth: 2,
    borderColor: 'rgba(22,163,74,0.25)',
    marginRight: 14,
  },
  avatarImg: { width: '100%', height: '100%', resizeMode: 'cover', borderRadius: 32 },
  avatarFallback: { width: '100%', height: '100%', alignItems: 'center', justifyContent: 'center' },
  headerName: { fontSize: 16, fontWeight: '900', color: '#0f172a' },
  headerSub: { marginTop: 2, fontSize: 12, fontWeight: '700', color: NEUTRAL.subtext },
  headerBtns: { flexDirection: 'row', marginTop: 10 },
  smallBtn: {
    height: 38,
    paddingHorizontal: 12,
    borderRadius: 14,
    backgroundColor: GREEN.bg,
    borderWidth: 1,
    borderColor: GREEN.pale,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    alignSelf: 'flex-start',
  },
  smallBtnText: { marginLeft: 8, fontSize: 13, fontWeight: '900', color: GREEN.dark },
  label: { fontSize: 12, fontWeight: '900', color: GREEN.dark, marginBottom: 6 },
  inputWrap: {
    borderRadius: 16,
    borderWidth: 1,
    borderColor: GREEN.pale,
    backgroundColor: GREEN.bg,
    paddingHorizontal: 12,
    paddingVertical: 12,
  },
  input: { fontSize: 15, fontWeight: '800', color: '#0f172a', paddingVertical: 0 },
  errorText: { marginTop: 6, color: '#b91c1c', fontWeight: '800', fontSize: 12 },
  successText: { marginTop: 6, color: GREEN.dark, fontWeight: '900', fontSize: 12 },
  saveBtn: {
    marginTop: 10,
    height: 50,
    borderRadius: 18,
    backgroundColor: GREEN.dark,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  saveText: { color: '#fff', fontWeight: '900', marginLeft: 10, fontSize: 15 },
});

