export const MIN_VALID_AGE = 13;

const validateDob = (dob: string) => {
  if (new Date(dob).getFullYear() < 1900) return false;

  const dobTime = new Date(dob).getTime();
  const currentTime = new Date().getTime();
  const daysOnEarth = (currentTime - dobTime) / (1000 * 3600 * 24);
  return daysOnEarth / 365 >= MIN_VALID_AGE;
};

export default validateDob;
