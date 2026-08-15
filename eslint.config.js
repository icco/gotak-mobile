// https://docs.expo.dev/guides/using-eslint/
const { defineConfig } = require('eslint/config');
const expoConfig = require("eslint-config-expo/flat");

module.exports = defineConfig([
  expoConfig,
  {
    // eslint-plugin-react's version autodetection crashes on ESLint 10, so state it.
    settings: { react: { version: "19.2" } },
  },
  {
    ignores: ["dist/*"],
  }
]);
