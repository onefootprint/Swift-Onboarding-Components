export const MAX_VALID_AGE = 110;

const validateDob = (dob: string) => {
  const dobDate = new Date(dob).getFullYear();
  const now = new Date().getFullYear();
  return now - dobDate >= 0 && now - dobDate <= MAX_VALID_AGE;
};

export default validateDob;
