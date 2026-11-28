import React, { useState } from 'react';
import { ActivityIndicator, KeyboardAvoidingView, Platform, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../types/navigation';
import { useAuth } from '../context/AuthContext';
import { gotakAPI } from '../services/api';
import { GameMode } from '../types/game';
import { Banner, TextButton } from '../components/GamePanels';
import { color, radius, space, type } from '../theme';

interface Props {
  navigation: StackNavigationProp<RootStackParamList, 'Home'>;
}

const BOARD_SIZES = [4, 5, 6, 7, 8];

export const HomeScreen: React.FC<Props> = ({ navigation }) => {
  const { user, logout } = useAuth();
  const [boardSize, setBoardSize] = useState(5);
  const [joinSlug, setJoinSlug] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const run = async (fn: () => Promise<void>, fallback: string) => {
    setBusy(true);
    setError(null);
    try {
      await fn();
    } catch (err) {
      setError(gotakAPI.formatError(err, fallback));
    } finally {
      setBusy(false);
    }
  };

  const startGame = (mode: GameMode) =>
    run(async () => {
      const game = await gotakAPI.createGame(boardSize, mode);
      navigation.navigate('Game', { gameId: game.Slug, mode });
    }, 'Could not start a game. Check your connection and try again.');

  const join = () =>
    run(async () => {
      const slug = joinSlug.trim();
      const game = await gotakAPI.getGame(slug);
      if (game.white_player_id !== user?.id && game.black_player_id !== user?.id) {
        await gotakAPI.joinGame(slug);
      }
      navigation.navigate('Game', { gameId: slug, mode: game.mode });
    }, 'Could not join that game. Check the code and try again.');

  return (
    <SafeAreaView style={styles.screen}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.content}>
        <View style={styles.hero}>
          <Text style={styles.title}>Tak</Text>
          <Text style={type.label}>Signed in as {user?.name || user?.email}</Text>
        </View>

        <View style={styles.section}>
          <Text style={type.label}>Board size</Text>
          <View style={styles.sizes}>
            {BOARD_SIZES.map((size) => (
              <Pressable
                key={size}
                accessibilityRole="button"
                accessibilityLabel={`${size} by ${size}`}
                accessibilityState={{ selected: boardSize === size }}
                onPress={() => setBoardSize(size)}
                style={[styles.size, boardSize === size && styles.sizeOn]}
              >
                <Text style={[styles.sizeText, boardSize === size && { color: color.onAccent }]}>{size}</Text>
              </Pressable>
            ))}
          </View>
          <View style={styles.row}>
            <TextButton label="Play the computer" icon="robot-outline" primary onPress={() => void startGame('ai')} />
          </View>
          <View style={styles.row}>
            <TextButton label="Play a friend" icon="account-multiple-outline" onPress={() => void startGame('human')} />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={type.label}>Have a game code?</Text>
          <View style={styles.row}>
            <TextInput
              style={styles.input}
              placeholder="Game code"
              placeholderTextColor={color.textDim}
              autoCapitalize="none"
              autoCorrect={false}
              returnKeyType="go"
              value={joinSlug}
              onChangeText={setJoinSlug}
              onSubmitEditing={() => joinSlug.trim() && void join()}
            />
            {joinSlug.trim() ? <TextButton label="Join" onPress={() => void join()} /> : null}
          </View>
        </View>

        {error ? <Banner text={error} tone="error" /> : null}
        {busy ? <ActivityIndicator color={color.accent} /> : null}

        <Pressable accessibilityRole="button" onPress={() => void logout()} style={styles.signOut}>
          <Text style={type.label}>Sign out</Text>
        </Pressable>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: color.ground },
  content: { flex: 1, justifyContent: 'center', padding: space.xl, gap: space.xl },
  hero: { gap: space.xs },
  title: { fontSize: 56, fontWeight: '700', letterSpacing: -1.5, color: color.text },
  section: { gap: space.sm },
  sizes: { flexDirection: 'row', gap: space.sm },
  size: {
    flex: 1,
    height: 48,
    borderRadius: radius.md,
    backgroundColor: color.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sizeOn: { backgroundColor: color.accent },
  sizeText: { fontSize: 16, fontWeight: '600', color: color.text, fontVariant: ['tabular-nums'] },
  row: { flexDirection: 'row', gap: space.sm },
  input: {
    flex: 2,
    minHeight: 48,
    borderRadius: radius.md,
    backgroundColor: color.surface,
    color: color.text,
    paddingHorizontal: space.lg,
    fontSize: 16,
  },
  signOut: { alignSelf: 'center', minHeight: 48, justifyContent: 'center', paddingHorizontal: space.lg },
});
