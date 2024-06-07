export const DOB_MIN_AGE = 18;
export const DOB_MAX_AGE = 120;

export const isValidDate = (date: string) => new Date(date).toString() !== 'Invalid Date';

export const isDobTooYoung = (date: string, today = new Date()) => {
  const age = today.getFullYear() - new Date(date).getFullYear();
  return age < DOB_MIN_AGE;
};

export const isDobTooOld = (date: string, today = new Date()) => {
  const age = today.getFullYear() - new Date(date).getFullYear();
  return age > DOB_MAX_AGE;
};

export const isDobInTheFuture = (date: string, today = new Date()) => new Date(date) >= today;

const isDob = (dob: string, today = new Date()) =>
  isValidDate(dob) && !isDobInTheFuture(dob, today) && !isDobTooYoung(dob, today) && !isDobTooOld(dob, today);

export default isDob;
