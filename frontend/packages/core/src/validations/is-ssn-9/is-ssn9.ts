// Numbers with all zeros in any digit group (000-##-####, ###-00-####, ###-##-0000) are not allowed.
// Numbers with 666 or 900–999 in the first digit group are not allowed.
// Also validates length & formatting.
const pattern = /^(?!(000|666|9))(\d{3}-(?!(00))\d{2}-(?!(0000))\d{4})$/;

const isSSN9 = (value: string): boolean => pattern.test(value);

export default isSSN9;
