import { isValidDate } from '../../validations/is-dob';

const dateToIso8601 = (dateString: string): string | undefined => {
  if (!isValidDate(dateString)) {
    return undefined;
  }
  const date = new Date(dateString);
  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const day = date.getDate().toString().padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export default dateToIso8601;
