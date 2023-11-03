export type EmailOrPhoneIdentifier =
  | { email: string }
  | { phoneNumber: string };

export type Identifier = EmailOrPhoneIdentifier | { authToken: string };
