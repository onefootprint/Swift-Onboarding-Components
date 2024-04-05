import type { IdentifyContext } from '../../state/types';
import { SuccessfulIdentifier } from '../../state/types';
import { getDisplayEmail, getDisplayPhone } from './get-display-contact-info';

describe('getDisplayEmail', () => {
  it.each([
    // Identified via email, show full email
    {
      identify: {
        user: { scrubbedEmail: 'a**@b**.com' },
        successfulIdentifiers: [SuccessfulIdentifier.email],
      },
      email: 'aaa@bbb.com',
      x: 'aaa@bbb.com',
    },
    // Email not used to identify, so must display scrubbed
    {
      identify: {
        user: { scrubbedEmail: 'a**@b**.com' },
        successfulIdentifiers: [SuccessfulIdentifier.phone],
      },
      email: 'aaa@bbb.com',
      x: 'a••@b••.com',
    },
    {
      identify: {
        user: { scrubbedEmail: undefined },
        successfulIdentifiers: [SuccessfulIdentifier.phone],
      },
      email: 'aaa@bbb.com',
      x: undefined,
    },
    // Signup challenge, show full email
    {
      identify: {
        user: undefined,
      },
      email: 'aaa@bbb.com',
      x: 'aaa@bbb.com',
    },
  ])('case %#', ({ identify, email, x }) => {
    const result = getDisplayEmail({
      identify: identify as IdentifyContext,
      email: { value: email, isBootstrap: false },
    });
    expect(result).toEqual(x);
  });
});

describe('getDisplayPhone', () => {
  it.each([
    // Identified via phone, show full phone
    {
      identify: {
        user: { scrubbedPhone: '+1 (***) ***-**00' },
        successfulIdentifiers: [SuccessfulIdentifier.phone],
      },
      phoneNumber: '+1 (555) 555-0100',
      x: '+1\u00A0(555)\u00A0555\u20110100',
    },
    // Phone not used to identify, so must display scrubbed
    {
      identify: {
        user: { scrubbedPhone: '+1 (***) ***-**00' },
        successfulIdentifiers: [SuccessfulIdentifier.email],
      },
      phoneNumber: '+1 (555) 555-0100',
      x: '+1\u00A0(•••)\u00A0•••\u2011••00',
    },
    {
      identify: {
        user: { scrubbedPhone: undefined },
        successfulIdentifiers: [SuccessfulIdentifier.email],
      },
      phoneNumber: '+1 (555) 555-0100',
      x: undefined,
    },
    // Signup challenge, show full email
    {
      identify: {
        user: undefined,
      },
      phoneNumber: '+1 (555) 555-0100',
      x: '+1\u00A0(555)\u00A0555\u20110100',
    },
  ])('case %#', ({ identify, phoneNumber, x }) => {
    const result = getDisplayPhone({
      identify: identify as IdentifyContext,
      phoneNumber: { value: phoneNumber, isBootstrap: false },
    });
    expect(result).toEqual(x);
  });
});
