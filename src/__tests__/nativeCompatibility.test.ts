/// <reference types="node" />

import { readFileSync } from 'node:fs';
import { join } from 'node:path';

const root = join(__dirname, '../..');
const packageVersion = (name: string): string => {
  const pkg = JSON.parse(readFileSync(join(root, 'node_modules', name, 'package.json'), 'utf8')) as { version: string };
  return pkg.version;
};

describe('native startup dependencies', () => {
  it('matches React to the version embedded in the native renderer', () => {
    const renderer = readFileSync(join(root, 'node_modules/react-native/Libraries/Renderer/implementations/ReactFabric-prod.js'), 'utf8');
    const version = renderer.match(/reconcilerVersion:\s*"([^"]+)"/);
    expect(version).not.toBeNull();
    expect(packageVersion('react')).toBe(version?.[1]);
  });

  it('uses SecureStore from the installed Expo SDK', () => {
    expect(packageVersion('expo-secure-store').split('.')[0]).toBe(packageVersion('expo').split('.')[0]);
  });
});
