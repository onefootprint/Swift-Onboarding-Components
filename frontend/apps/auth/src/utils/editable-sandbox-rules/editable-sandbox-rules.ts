import { IdDI } from '@onefootprint/types';

type Obj = Record<string, unknown>;

const isEmailStep = (x: unknown) => x === 'emailIdentification';
const isPhoneStep = (x: unknown) => x === 'phoneIdentification';
const isSmsStep = (x: unknown) => x === 'smsChallenge';

const hasEmail = (obj: Obj) => IdDI.email in obj && !!obj[IdDI.email];
const hasPhone = (obj: Obj) =>
  IdDI.phoneNumber in obj && !!obj[IdDI.phoneNumber];

const sandboxIdEditRules =
  (obj: Obj) =>
  (step: string): boolean =>
    (isEmailStep(step) && !hasEmail(obj) && !hasPhone(obj)) ||
    (isEmailStep(step) && !hasEmail(obj) && hasPhone(obj)) ||
    (isPhoneStep(step) && hasEmail(obj)) ||
    (isSmsStep(step) && hasEmail(obj) && hasPhone(obj));

export default sandboxIdEditRules;
