// Numbers with all zeros in any digit group (000-##-####, ###-00-####, ###-##-0000) are not allowed.
// Numbers with 666 or 900–999 in the first digit group are not allowed.
// Also validates length & formatting.
const patternSsn9 = /^(?!(000|666|9))(\d{3}-(?!(00))\d{2}-(?!(0000))\d{4})$/;
export const isSSN9 = (value: string): boolean => patternSsn9.test(value);

// 0000 is not allowed, has to be 4 digits long
const patternSsn4 = /^((?!(0000))\d{4})$/;
export const isSSN4 = (value: string): boolean => patternSsn4.test(value);
