import React from 'react';
import { DarkTheme, LinkingOptions, NavigationContainer } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { color } from './src/theme';
import { createStackNavigator } from '@react-navigation/stack';
import { StatusBar } from 'expo-status-bar';
import { ActivityIndicator, View, StyleSheet } from 'react-native';
import { RootStackParamList } from './src/types/navigation';
import { AuthProvider, useAuth } from './src/context/AuthContext';
import { HomeScreen } from './src/screens/HomeScreen';
import { GameScreen } from './src/screens/GameScreen';
import { LoginScreen } from './src/screens/LoginScreen';
import { ReplayScreen } from './src/screens/ReplayScreen';

const Stack = createStackNavigator<RootStackParamList>();

// Game links open the board; GameScreen shows it read-only to anyone who is not a player.
const linking: LinkingOptions<RootStackParamList> = {
  prefixes: ['gotak://', 'https://gotak.app'],
  config: { initialRouteName: 'Home', screens: { Home: '', Game: 'game/:gameId' } },
};

function RootNavigator() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color={color.accent} />
      </View>
    );
  }

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {isAuthenticated ? (
        <>
          <Stack.Screen name="Home" component={HomeScreen} />
          <Stack.Screen name="Game" component={GameScreen} />
          <Stack.Screen name="Replay" component={ReplayScreen} />
        </>
      ) : (
        <Stack.Screen name="Login" component={LoginScreen} />
      )}
    </Stack.Navigator>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <AuthProvider>
        <NavigationContainer linking={linking} theme={{ ...DarkTheme, colors: { ...DarkTheme.colors, background: color.ground } }}>
          <StatusBar style="light" />
          <RootNavigator />
        </NavigationContainer>
      </AuthProvider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  loading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: color.ground,
  },
});
