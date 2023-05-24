import { FootprintAppearance } from '@onefootprint/footprint-js';

const CONTAINER_SIZE_SELECTORS = new Set([
  'max-height',
  'height',
  'min-height',
]);

const CONTAINER_POSITIONING_RULES: Record<string, string> = {
  position: 'absolute',
  top: '0',
  bottom: '0',
  margin: 'auto',
  overflow: 'hidden',
};

const hasCustomHeightInAppearance = (appearance: FootprintAppearance) => {
  const containerRules = appearance?.rules?.container;
  if (!containerRules) {
    return false;
  }

  const containerSizeRules = Object.entries(containerRules).filter(
    ([key, value]) => {
      if (CONTAINER_SIZE_SELECTORS.has(key)) {
        return true;
      }
      if (key in CONTAINER_POSITIONING_RULES) {
        return value === CONTAINER_POSITIONING_RULES[key];
      }
      return false;
    },
  );
  return containerSizeRules.length > 0;
};

export default hasCustomHeightInAppearance;
