import React, { useState } from 'react';
import { ActivityIndicator, KeyboardAvoidingView, Platform, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../context/AuthContext';
import { gotakAPI } from '../services/api';
import { Banner, TextButton } from '../components/GamePanels';
import { color, radius, space, type } from '../theme';

export const LoginScreen: React.FC = () => {
  const { login, register } = useAuth();
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const ready = !!email && password.length >= 8 && !busy;

  const onSubmit = async () => {
    if (!ready) return;
    setError(null);
    setBusy(true);
    try {
      if (mode === 'login') {
        await login(email, password);
      } else {
        await register(email, password, name || email.split('@')[0]);
      }
    } catch (err) {
      setError(gotakAPI.formatError(err, 'Could not sign in. Check your email and password.'));
    } finally {
      setBusy(false);
    }
  };

  return (
    <SafeAreaView style={styles.screen}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.content}>
        <View style={styles.hero}>
          <Text style={styles.title}>Tak</Text>
          <Text style={type.label}>{mode === 'login' ? 'Sign in to play' : 'Create an account to play'}</Text>
        </View>

        <View style={styles.fields}>
          {mode === 'register' ? (
            <TextInput
              style={styles.input}
              placeholder="Name"
              placeholderTextColor={color.textDim}
              autoCapitalize="words"
              autoComplete="name"
              value={name}
              onChangeText={setName}
            />
          ) : null}
          <TextInput
            style={styles.input}
            placeholder="Email"
            placeholderTextColor={color.textDim}
            autoCapitalize="none"
            keyboardType="email-address"
            autoComplete="email"
            value={email}
            onChangeText={setEmail}
          />
          <TextInput
            style={styles.input}
            placeholder={mode === 'register' ? 'Password (8 or more characters)' : 'Password'}
            placeholderTextColor={color.textDim}
            secureTextEntry
            autoComplete={mode === 'register' ? 'new-password' : 'current-password'}
            returnKeyType="go"
            value={password}
            onChangeText={setPassword}
            onSubmitEditing={() => void onSubmit()}
          />
        </View>

        {error ? <Banner text={error} tone="error" /> : null}

        <View style={styles.row}>
          <TextButton
            label={mode === 'login' ? 'Sign in' : 'Create account'}
            primary
            disabled={!ready}
            onPress={() => void onSubmit()}
          />
        </View>
        {busy ? <ActivityIndicator color={color.accent} /> : null}

        <Pressable
          accessibilityRole="button"
          onPress={() => {
            setMode(mode === 'login' ? 'register' : 'login');
            setError(null);
          }}
          style={({ pressed }) => [styles.switch, pressed && styles.dim]}
        >
          <Text style={type.label}>
            {mode === 'login' ? 'New to Tak? Create an account' : 'Already have an account? Sign in'}
          </Text>
        </Pressable>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: color.ground },
  content: { flex: 1, justifyContent: 'center', padding: space.xl, gap: space.lg },
  hero: { gap: space.xs, marginBottom: space.sm },
  title: { fontSize: 56, fontWeight: '700', letterSpacing: -1.5, color: color.text },
  fields: { gap: space.sm },
  input: {
    minHeight: 48,
    borderRadius: radius.md,
    backgroundColor: color.surface,
    color: color.text,
    paddingHorizontal: space.lg,
    fontSize: 16,
  },
  row: { flexDirection: 'row' },
  dim: { opacity: 0.45 },
  switch: { alignSelf: 'center', minHeight: 48, justifyContent: 'center', paddingHorizontal: space.lg },
});
