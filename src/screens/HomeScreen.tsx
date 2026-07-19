import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  TextInput,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../types/navigation';
import { useAuth } from '../context/AuthContext';
import { gotakAPI } from '../services/api';
import { GameMode } from '../types/game';

type HomeScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Home'>;

interface Props {
  navigation: HomeScreenNavigationProp;
}

const BOARD_SIZES = [4, 5, 6, 7, 8];

export const HomeScreen: React.FC<Props> = ({ navigation }) => {
  const { user, logout } = useAuth();
  const [boardSize, setBoardSize] = useState(5);
  const [joinSlug, setJoinSlug] = useState('');
  const [busy, setBusy] = useState(false);

  const startGame = async (mode: GameMode) => {
    setBusy(true);
    try {
      const connected = await gotakAPI.testConnection();
      if (!connected) {
        Alert.alert('Connection Error', 'Cannot reach the game server.');
        return;
      }
      const game = await gotakAPI.createGame(boardSize, mode);
      navigation.navigate('Game', { gameId: game.Slug, mode });
    } catch (error) {
      Alert.alert('Error', gotakAPI.formatError(error, 'Failed to create game'));
    } finally {
      setBusy(false);
    }
  };

  const handleJoin = async () => {
    const slug = joinSlug.trim();
    if (!slug) {
      Alert.alert('Join Game', 'Enter a game slug to join.');
      return;
    }
    setBusy(true);
    try {
      await gotakAPI.joinGame(slug);
      navigation.navigate('Game', { gameId: slug, mode: 'human' });
    } catch (error) {
      Alert.alert('Error', gotakAPI.formatError(error, 'Failed to join game'));
    } finally {
      setBusy(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Tak</Text>
        <Text style={styles.subtitle}>The Beautiful Game</Text>
        <Text style={styles.userLine}>Signed in as {user?.name || user?.email}</Text>

        <Text style={styles.sectionLabel}>Board size</Text>
        <View style={styles.sizeRow}>
          {BOARD_SIZES.map((size) => (
            <TouchableOpacity
              key={size}
              style={[styles.sizeChip, boardSize === size && styles.sizeChipActive]}
              onPress={() => setBoardSize(size)}
            >
              <Text
                style={[
                  styles.sizeChipText,
                  boardSize === size && styles.sizeChipTextActive,
                ]}
              >
                {size}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <TouchableOpacity
          style={[styles.button, busy && styles.buttonDisabled]}
          onPress={() => startGame('human')}
          disabled={busy}
        >
          <Text style={styles.buttonText}>New vs Human</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, styles.buttonSecondary, busy && styles.buttonDisabled]}
          onPress={() => startGame('ai')}
          disabled={busy}
        >
          <Text style={styles.buttonText}>New vs AI</Text>
        </TouchableOpacity>

        <Text style={styles.sectionLabel}>Join by slug</Text>
        <TextInput
          style={styles.input}
          placeholder="game-slug"
          placeholderTextColor="#95a5a6"
          autoCapitalize="none"
          value={joinSlug}
          onChangeText={setJoinSlug}
        />
        <TouchableOpacity
          style={[styles.button, styles.buttonJoin, busy && styles.buttonDisabled]}
          onPress={handleJoin}
          disabled={busy}
        >
          {busy ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>Join Game</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity style={styles.logout} onPress={() => void logout()}>
          <Text style={styles.logoutText}>Sign out</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#2c3e50',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
  },
  title: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#ecf0f1',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 18,
    color: '#bdc3c7',
    textAlign: 'center',
    marginBottom: 8,
  },
  userLine: {
    color: '#95a5a6',
    textAlign: 'center',
    marginBottom: 24,
  },
  sectionLabel: {
    color: '#bdc3c7',
    marginBottom: 8,
    marginTop: 8,
  },
  sizeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  sizeChip: {
    flex: 1,
    marginHorizontal: 4,
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: '#34495e',
    alignItems: 'center',
  },
  sizeChipActive: {
    backgroundColor: '#3498db',
  },
  sizeChipText: {
    color: '#bdc3c7',
    fontWeight: '600',
  },
  sizeChipTextActive: {
    color: '#fff',
  },
  input: {
    backgroundColor: '#34495e',
    color: '#ecf0f1',
    borderRadius: 8,
    padding: 14,
    marginBottom: 12,
    fontSize: 16,
  },
  button: {
    backgroundColor: '#3498db',
    padding: 16,
    borderRadius: 8,
    marginBottom: 12,
    alignItems: 'center',
  },
  buttonSecondary: {
    backgroundColor: '#9b59b6',
  },
  buttonJoin: {
    backgroundColor: '#27ae60',
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  logout: {
    marginTop: 24,
    alignItems: 'center',
  },
  logoutText: {
    color: '#e74c3c',
    fontSize: 16,
  },
});
