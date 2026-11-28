export type RootStackParamList = {
  Login: undefined;
  Home: undefined;
  Game: {
    gameId?: string;
    mode?: 'human' | 'ai';
  };
  Analysis: { gameId: string };
};
