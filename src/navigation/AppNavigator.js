import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { View, ActivityIndicator, Image, StyleSheet } from 'react-native';
import { useAuth } from '../context/AuthContext';
import { GREEN } from '../theme/colors';
import LoginScreen from '../screens/LoginScreen';
import RegisterScreen from '../screens/RegisterScreen';
import DashboardScreen from '../screens/DashboardScreen';
import ProfileScreen from '../screens/ProfileScreen';
import MenuScreen from '../screens/MenuScreen';
import ResultScreen from '../screens/ResultScreen';
import EditProfileScreen from '../screens/EditProfileScreen';
import ChangePasswordScreen from '../screens/ChangePasswordScreen';
import PrayerScreen from '../screens/PrayerScreen';
import DuaScreen from '../screens/DuaScreen';
import QuizListScreen from '../screens/QuizListScreen';
import QuizPrepScreen from '../screens/QuizPrepScreen';
import QuizPlayScreen from '../screens/QuizPlayScreen';
import QuizLeaderboardScreen from '../screens/QuizLeaderboardScreen';
import EducationAllScreen from '../screens/EducationAllScreen';
import ScanScreen from '../screens/ScanScreen';
import BloodDonationScreen from '../screens/BloodDonationScreen';

const Stack = createNativeStackNavigator();

function BootScreen() {
  return (
    <View style={bootStyles.root}>
      <Image
        source={require('../../assets/dmf-loading-icon.png')}
        style={bootStyles.logo}
        resizeMode="contain"
        accessibilityLabel="Dar Al Muttaqin"
      />
      <ActivityIndicator size="large" color={GREEN.main} style={bootStyles.spinner} />
    </View>
  );
}

const bootStyles = StyleSheet.create({
  root: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#ffffff',
  },
  logo: { width: 160, height: 160 },
  spinner: { marginTop: 24 },
});

export default function AppNavigator() {
  const { token, isBooting } = useAuth();

  if (isBooting) return <BootScreen />;

  return (
    <NavigationContainer>
      {token ? (
        <Stack.Navigator screenOptions={{ headerShown: false }}>
          <Stack.Screen name="Dashboard" component={DashboardScreen} />
          <Stack.Screen name="Profile" component={ProfileScreen} />
          <Stack.Screen name="Menu" component={MenuScreen} />
          <Stack.Screen name="Results" component={ResultScreen} />
          <Stack.Screen name="EditProfile" component={EditProfileScreen} />
          <Stack.Screen name="ChangePassword" component={ChangePasswordScreen} />
          <Stack.Screen name="Prayer" component={PrayerScreen} />
          <Stack.Screen name="Dua" component={DuaScreen} />
          <Stack.Screen name="QuizList" component={QuizListScreen} />
          <Stack.Screen name="QuizPrep" component={QuizPrepScreen} />
          <Stack.Screen name="QuizPlay" component={QuizPlayScreen} />
          <Stack.Screen name="QuizLeaderboard" component={QuizLeaderboardScreen} />
          <Stack.Screen name="EducationAll" component={EducationAllScreen} />
          <Stack.Screen name="Scan" component={ScanScreen} />
          <Stack.Screen name="BloodDonation" component={BloodDonationScreen} />
        </Stack.Navigator>
      ) : (
        <Stack.Navigator screenOptions={{ headerShown: false }}>
          <Stack.Screen name="Login" component={LoginScreen} />
          <Stack.Screen name="Register" component={RegisterScreen} />
        </Stack.Navigator>
      )}
    </NavigationContainer>
  );
}

