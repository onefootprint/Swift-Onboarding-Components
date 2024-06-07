import type {
  FootprintAuthProps,
  FootprintUpdateLoginMethodsProps,
  FootprintUserData,
  FootprintVerifyProps,
} from '@onefootprint/footprint-js';

export type SupportedProps = FootprintVerifyProps | FootprintAuthProps | FootprintUpdateLoginMethodsProps;

export type PublicKeyOnly = { authToken?: never; publicKey: string };
export type AuthTokenOnly = { authToken: string; publicKey?: never };
export type AuthPublicKeyOnly = PublicKeyOnly & { updateLoginMethods?: never };
export type AuthAuthTokenOnly = AuthTokenOnly & { updateLoginMethods: true };

export type VerifyConditional = 'publicKey' | 'authToken';
export type AuthConditional = 'publicKey' | 'authToken' | 'updateLoginMethods';

export type BaseSupportedProps = Omit<SupportedProps, 'variant' | 'kind'>;

export type UserDataEmailAndPhone = Pick<Partial<FootprintUserData>, 'id.email' | 'id.phone_number'>;

type ButtonProps = {
  className?: string;
  dialogVariant?: 'modal' | 'drawer';
  label?: string;
  onClick?: (event: React.MouseEvent<HTMLButtonElement>) => void;
  testID?: string;
};

export type FootprintButtonProps = SupportedProps & ButtonProps;
