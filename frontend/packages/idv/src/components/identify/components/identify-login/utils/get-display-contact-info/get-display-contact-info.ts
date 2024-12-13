import type { IdentifyMachineContext } from '../../state';
import { SuccessfulIdentifier } from '../../state/types';

export const getDisplayPhone = (
  context: Pick<IdentifyMachineContext, 'phoneNumber' | 'identify'>,
): string | undefined => {
  const { identify, phoneNumber } = context;
  const value = phoneNumber?.value;
  const isLoginChallenge = !!identify.user;
  if (isLoginChallenge && !identify.successfulIdentifiers?.includes(SuccessfulIdentifier.phone)) {
    // The user was identified via something other the phone that was passed in, so we don't know
    // that the phoneNumber we have is the one on the vault. Instead, we'll use the scrubbed one
    // that belongs to the user
    return (
      identify.user?.scrubbedPhone
        ?.replace(/\*/g, '•')
        // Replace spaces with non-breaking spaces and hyphens with non-breaking hyphens
        .replace(/ /g, '\u00A0')
        .replace(/-/g, '\u2011')
    );
  }
  // Either we located the user with this phone number, or we're initiating a signup challenge to
  // this phone number
  const match = value?.match(/(\+\d{1,3} )?(.*)/);
  if (!match) {
    return undefined;
  }
  const countryCode = match[1] ? match[1] : '';
  const number = match[2];
  // Replace spaces with non-breaking spaces and hyphens with non-breaking hyphens
  return (countryCode + number).replace(/ /g, '\u00A0').replace(/-/g, '\u2011');
};

export const getDisplayEmail = (context: Pick<IdentifyMachineContext, 'identify' | 'email'>): string | undefined => {
  const { identify, email } = context;
  const value = email?.value;
  const isLoginChallenge = !!identify.user;

  if (isLoginChallenge && !identify.successfulIdentifiers?.includes(SuccessfulIdentifier.email)) {
    // The user was identified via something other the email that was passed in, so we don't know
    // that the email we have is the one on the vault. Instead, we'll use the scrubbed email if
    // available
    return identify.user?.scrubbedEmail?.replace(/\*/g, '•');
  }
  // Either we located the user with this email, or we're initiating a signup challenge to this email
  return value;
};
