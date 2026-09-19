const { withAppBuildGradle } = require('expo/config-plugins');
const { readFileSync } = require('node:fs');
const { join } = require('node:path');

const marker = '// Gotak production signing';

module.exports = function withAndroidReleaseSigning(config) {
  return withAppBuildGradle(config, (mod) => {
    if (mod.modResults.language !== 'groovy') {
      throw new Error('Gotak release signing requires a Groovy app build.gradle');
    }
    if (!mod.modResults.contents.includes(marker)) {
      const signing = readFileSync(join(__dirname, 'release-signing.gradle'), 'utf8');
      mod.modResults.contents += `\n${marker}\n${signing}`;
    }
    return mod;
  });
};
