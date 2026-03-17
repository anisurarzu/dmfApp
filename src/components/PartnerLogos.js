import { View, Image, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { GREEN } from '../theme/colors';

function LogoCard({ children, colors }) {
  return (
    <View style={styles.logoCard}>
      <LinearGradient colors={colors} style={styles.logoCardGradient}>
        {children}
      </LinearGradient>
    </View>
  );
}

function PartnerCard({ source }) {
  return (
    <View style={styles.logoCard}>
      <View style={styles.logoCardPartnerBg}>
        <Image source={source} style={styles.smallLogo} resizeMode="contain" />
      </View>
    </View>
  );
}

export default function PartnerLogos() {
  return (
    <View style={styles.wrap}>
      <View style={styles.logosRow}>
        <LogoCard colors={['#f0fdf4', '#dcfce7']}>
          <Image source={require('../../assets/logo.png')} style={styles.smallLogo} resizeMode="contain" />
        </LogoCard>
        <LogoCard colors={['#f0fdf4', '#dcfce7']}>
          <Image source={require('../../assets/logo-dmf.png')} style={styles.smallLogo} resizeMode="contain" />
        </LogoCard>
        <LogoCard colors={['#f0fdf4', '#dcfce7']}>
          <Image source={require('../../assets/logo-dmf-scholarship.png')} style={styles.smallLogo} resizeMode="contain" />
        </LogoCard>
      </View>

      <View style={styles.logosRowGap} />

      <View style={styles.logosRow}>
        <PartnerCard source={require('../../assets/logo-partner-soft.png')} />
        <PartnerCard source={require('../../assets/logo-partner-invest.png')} />
        <PartnerCard source={require('../../assets/logo-partner-youth.png')} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    marginTop: 28,
    paddingHorizontal: 16,
  },
  logosRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
  },
  logosRowGap: {
    height: 16,
    width: '100%',
  },
  logoCard: {
    width: 80,
    height: 80,
    marginHorizontal: 10,
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: GREEN.dark,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 6,
  },
  logoCardGradient: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 20,
    padding: 8,
  },
  logoCardPartnerBg: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 20,
    padding: 8,
    backgroundColor: '#f0fdf4',
  },
  smallLogo: {
    width: 64,
    height: 64,
  },
});

