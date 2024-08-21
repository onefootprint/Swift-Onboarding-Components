const isEmail = (input: string): boolean => {
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  const domainPart = input.split('@')[1];
  if (domainPart?.includes('..')) {
    return false;
  }

  return emailRegex.test(input);
};

export default isEmail;
