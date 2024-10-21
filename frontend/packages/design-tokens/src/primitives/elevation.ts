const generateLightElevation = (shadowColorVar: string) => ({
  flat: `0px 0px 0px 0px rgba(${shadowColorVar}, 0);`,
  low: `0px 2px 4px 0px rgba(${shadowColorVar}, ${0.12});`,
  medium: `0px 4px 8px 0px rgba(${shadowColorVar}, ${0.14});`,
  high: `0px 6px 12px 0px rgba(${shadowColorVar}, ${0.18});`,
  extraHigh: `0px 12px 16px rgba(${shadowColorVar}, ${0.2});`,
});

const generateDarkElevation = (shadowColorVar: string) => ({
  flat: `0px 0px 0px 0px rgba(${shadowColorVar}, 0);`,
  low: `0px 0px 2px 0px rgba(255, 255, 255, 0.2), 0px 1px 2px 0px rgba(${shadowColorVar}, 0.6), 0px 1px 3px 1px rgba(${shadowColorVar}, 0.2);`,
  medium: `0px 0px 2px 0px rgba(255, 255, 255, 0.2), 0px 2px 4px 0px rgba(${shadowColorVar}, 0.6), 0px 3px 6px 2px rgba(${shadowColorVar}, 0.2);`,
  high: `0px 0px 2px 0px rgba(255, 255, 255, 0.2), 0px 4px 8px 0px rgba(${shadowColorVar}, 0.6), 0px 6px 12px 4px rgba(${shadowColorVar}, 0.2);`,
  extraHigh: `0px 0px 2px 0px rgba(255, 255, 255, 0.2), 0px 8px 16px 0px rgba(${shadowColorVar}, 0.6), 0px 12px 24px 8px rgba(${shadowColorVar}, 0.2);`,
});

const shadowColorLight = '5, 5, 5';
const shadowColorDark = '0, 0, 0';

export const elevationLight = generateLightElevation(shadowColorLight);
export const elevationDark = generateDarkElevation(shadowColorDark);
