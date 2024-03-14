// 0000 is not allowed, has to be 4 digits long
const pattern = /^((?!(0000))\d{4})$/;

const isSSN4 = (value: string): boolean => pattern.test(value);

export default isSSN4;
