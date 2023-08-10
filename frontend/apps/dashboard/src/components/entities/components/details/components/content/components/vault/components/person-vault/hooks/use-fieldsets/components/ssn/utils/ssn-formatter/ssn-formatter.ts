const ssnFormatter = (ssn: string) => {
  if (ssn.length !== 9) {
    return '';
  }
  return `${ssn.slice(0, 3)}-${ssn.slice(3, 5)}-${ssn.slice(5, 9)}`;
};

export default ssnFormatter;
