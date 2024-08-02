import creditcardutils from 'creditcardutils';
import { isPast, isSameMonth, isValid, parse } from 'date-fns';

export const isCardNumberValid = (cardNumber: string) => cardNumber && creditcardutils.validateCardNumber(cardNumber);

export const isCardExpiryValid = (dateValue: string) => {
  if (!dateValue) {
    return false;
  }
  const parsedDate = parse(dateValue, 'MM/yy', new Date());
  const isCurrentMonth = isSameMonth(parsedDate, new Date());
  return (!isPast(parsedDate) || isCurrentMonth) && isValid(parsedDate);
};

enum CvcLength {
  three = 3,
  four = 4,
}

export const isCardCvcValid = (cvc: string, length: CvcLength) => {
  if (!cvc || !Number.isFinite(Number(cvc))) {
    return false;
  }
  if (length === CvcLength.three) {
    return cvc.length === 3;
  }
  if (length === CvcLength.four) {
    return cvc.length === 4;
  }
  return false;
};
