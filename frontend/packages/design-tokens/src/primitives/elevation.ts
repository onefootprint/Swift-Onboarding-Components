const generateElevation = (shadowColorVar: string) => ({
  flat: `0px 0px 0px 0px rgba(${shadowColorVar}, 0)`,
  low: `0px 1px 3px rgba(${shadowColorVar}, 0.1),
        0px 1px 3px rgba(${shadowColorVar}, 0.1),
        0px 2px 4px rgba(${shadowColorVar}, 0.1)`,
  medium: `0px 2px 3px rgba(${shadowColorVar}, 0.11),
           0px 2px 3px rgba(${shadowColorVar}, 0.11),
           0px 4px 6px rgba(${shadowColorVar}, 0.10)`,
  high: `0px 2px 4px rgba(${shadowColorVar}, 0.14),
         0px 2px 4px rgba(${shadowColorVar}, 0.13),
         0px 5px 7px rgba(${shadowColorVar}, 0.12)`,
  extraHigh: `0px 10px 8px rgba(${shadowColorVar}, 0.20),
              0px 12px 10px rgba(${shadowColorVar}, 0.18),
              0px 15px 12px rgba(${shadowColorVar}, 0.16)`,
});
const shadowColorLight = '5, 5, 50';
const shadowColorDark = '5, 5, 10';

export const elevationLight = generateElevation(shadowColorLight);
export const elevationDark = generateElevation(shadowColorDark);
