const generateElevation = (shadowColorVar: string) => ({
  flat: `0px 0px 0px 0px rgba(${shadowColorVar}, 0);`,
  low: `0px 1px 4px 0px rgba(${shadowColorVar}, 0.12);`,
  medium: `0px 1px 8px 0px rgba(${shadowColorVar}, 0.14);`,
  high: `0px 1px 12px 0px rgba(${shadowColorVar}, 0.18);`,
  extraHigh: `0px 10px 8px rgba(${shadowColorVar}, 0.20);`,
});
const shadowColorLight = '5, 5, 5';
const shadowColorDark = '0, 0, 0';

export const elevationLight = generateElevation(shadowColorLight);
export const elevationDark = generateElevation(shadowColorDark);
