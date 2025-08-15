import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
} from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../types/navigation';

type HomeScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Home'>;

interface Props {
  navigation: HomeScreenNavigationProp;
}

export const HomeScreen: React.FC<Props> = ({ navigation }) => {
  const handleNewGame = () => {
    navigation.navigate('Game', {});
  };

  const handleJoinGame = () => {
    // TODO: Implement join game flow
    console.log('Join game pressed');
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Tak</Text>
        <Text style={styles.subtitle}>The Beautiful Game</Text>

        <View style={styles.buttonContainer}>
          <TouchableOpacity style={styles.button} onPress={handleNewGame}>
            <Text style={styles.buttonText}>New Game</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.button} onPress={handleJoinGame}>
            <Text style={styles.buttonText}>Join Game</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.description}>
          Tak is a two-player board game where you build roads of stones to connect opposite sides of the board.
        </Text>
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
    alignItems: 'center',
    padding: 20,
  },
  title: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#ecf0f1',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 18,
    color: '#bdc3c7',
    marginBottom: 40,
  },
  buttonContainer: {
    width: '100%',
    marginBottom: 40,
  },
  button: {
    backgroundColor: '#3498db',
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  description: {
    fontSize: 14,
    color: '#95a5a6',
    textAlign: 'center',
    lineHeight: 20,
  },
});