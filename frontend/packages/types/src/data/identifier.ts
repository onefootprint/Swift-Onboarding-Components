export type PhoneIdentifier = { phoneNumber: string };
export type EmailIdentifier = { email: string };
export type AuthTokenIdentifier = { authToken: string };

export type EmailOrPhoneIdentifier = PhoneIdentifier | EmailIdentifier;

export type Identifier = PhoneIdentifier | EmailIdentifier | AuthTokenIdentifier;
