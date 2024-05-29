const generateElevation = (shadowColorVar: string) => ({
  flat: `0px 0px 0px 0px rgba(${shadowColorVar}, 0);`,
  low: `0px 2px 4px 0px rgba(${shadowColorVar}, ${0.12});`,
  medium: `0px 4px 8px 0px rgba(${shadowColorVar}, ${0.14});`,
  high: `0px 6px 12px 0px rgba(${shadowColorVar}, ${0.18});`,
  extraHigh: `0px 12px 16px rgba(${shadowColorVar}, ${0.2});`,
});
const shadowColorLight = '5, 5, 5';
const shadowColorDark = '0, 0, 0';

export const elevationLight = generateElevation(shadowColorLight);
export const elevationDark = generateElevation(shadowColorDark);
