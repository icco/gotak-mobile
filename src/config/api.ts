// API Configuration
export const API_CONFIG = {
  // Base URL for the API
  BASE_URL: process.env.EXPO_PUBLIC_API_URL || 'https://gotak.app',

  // Timeout for requests (in milliseconds)
  TIMEOUT: 10000,

  // Debug mode - set to true to enable detailed logging
  DEBUG: __DEV__,
};

// Log configuration in debug mode
if (API_CONFIG.DEBUG) {
  console.log('API Configuration:', API_CONFIG);
} 