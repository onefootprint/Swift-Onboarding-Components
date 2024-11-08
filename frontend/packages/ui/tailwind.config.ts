import type { Config } from 'tailwindcss';
import sharedConfig from '@onefootprint/tailwind-config';

const config: Pick<Config, 'content' | 'presets'> = {
  content: ['./src/**/*.{js,jsx,ts,tsx}', './.storybook/**/*.{js,ts}'],
  presets: [sharedConfig],
};

export default config;
