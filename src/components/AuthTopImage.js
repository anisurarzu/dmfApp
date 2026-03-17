import { View, ImageBackground, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { GREEN } from '../theme/colors';

export default function AuthTopImage({ onBack }) {
  return (
    <View style={styles.authTopWrap}>
      <ImageBackground
        source={require('../../assets/top-bg.jpg')}
        style={styles.authTopBg}
        resizeMode="cover"
      >
        <View style={styles.authTopOverlay} />
        <TouchableOpacity
          style={styles.authBackBtn}
          activeOpacity={0.8}
          onPress={onBack}
          disabled={!onBack}
        >
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
      </ImageBackground>
    </View>
  );
}

const styles = StyleSheet.create({
  authTopWrap: {
    height: 200,
    width: '100%',
  },
  authTopBg: {
    flex: 1,
    width: '100%',
    justifyContent: 'flex-start',
  },
  authTopOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(22,101,52,0.75)',
  },
  authBackBtn: {
    position: 'absolute',
    top: 52,
    left: 20,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(220,252,231,0.95)',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: GREEN.dark,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
});

