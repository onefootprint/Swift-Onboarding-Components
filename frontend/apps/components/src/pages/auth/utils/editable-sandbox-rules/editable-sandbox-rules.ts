import { IdDI } from '@onefootprint/types';

type Obj = Record<string, unknown>;

const isEmailStep = (x: unknown) => x === 'emailIdentification';
const isPhoneStep = (x: unknown) => x === 'phoneIdentification';
const isSmsStep = (x: unknown) => x === 'smsChallenge';

const hasOwn = (o: Obj, k: string) => o && Object.hasOwn(o, k) && Boolean(o[k]);
const hasIdEmail = (obj: Obj) => hasOwn(obj, IdDI.email);
const hasIdPhone = (obj: Obj) => hasOwn(obj, IdDI.phoneNumber);

const sandboxIdEditRules =
  (obj: Obj) =>
  (step: string): boolean =>
    (isEmailStep(step) && !hasIdEmail(obj) && !hasIdPhone(obj)) ||
    (isEmailStep(step) && !hasIdEmail(obj) && hasIdPhone(obj)) ||
    (isPhoneStep(step) && hasIdEmail(obj)) ||
    (isSmsStep(step) && hasIdEmail(obj) && hasIdPhone(obj));

export default sandboxIdEditRules;
