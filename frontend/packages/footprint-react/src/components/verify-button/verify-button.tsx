import type { FootprintVerifyProps } from '@onefootprint/footprint-js';
import footprint, { FootprintComponentKind } from '@onefootprint/footprint-js';
import React, { forwardRef } from 'react';

type NoToken = { authToken?: never; publicKey?: never };
type PublicKeyOnly = { authToken?: never; publicKey: string };
type AuthTokenOnly = { authToken: string; publicKey?: never };

export type VerifyButtonProps = Omit<FootprintVerifyProps, 'kind' | 'variant' | 'publicKey' | 'authToken'> & {
  testID?: string;
  label?: string;
  onClick?: (event: React.MouseEvent<HTMLButtonElement>) => void;
  dialogVariant?: 'modal' | 'drawer';
} & (NoToken | PublicKeyOnly | AuthTokenOnly);

const VerifyButton = (
  {
    appearance,
    authToken = undefined,
    bootstrapData,
    dialogVariant,
    l10n,
    label = 'Verify with Footprint',
    onAuth,
    onCancel,
    onClick,
    onClose,
    onComplete,
    options,
    publicKey = undefined,
    testID,
    userData /** deprecated after 3.11.0 */,
  }: VerifyButtonProps,
  ref?: React.Ref<HTMLButtonElement>,
): JSX.Element => {
  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    onClick?.(event);

    let tokenProps = {};
    if (authToken) {
      tokenProps = { authToken };
    } else if (publicKey) {
      tokenProps = { publicKey };
    } else {
      return;
    }

    const component = footprint.init({
      ...tokenProps,
      appearance,
      bootstrapData: bootstrapData || userData,
      kind: FootprintComponentKind.Verify,
      l10n,
      onAuth,
      onCancel,
      onClose,
      onComplete,
      options,
      variant: dialogVariant,
    } as FootprintVerifyProps);

    component.render();
  };

  return (
    <button className="footprint-verify-button" type="button" onClick={handleClick} data-testid={testID} ref={ref}>
      <svg width="24" height="24" fill="none" xmlns="http://www.w3.org/2000/svg" role="img" aria-hidden="true">
        <path
          d="M14.66 14h2.666v-2.36a2.666 2.666 0 1 1 0-4.614V4H6.66v16h4.666v-2.666A3.333 3.333 0 0 1 14.66 14Z"
          fill="#76fb8f"
        />
      </svg>
      {label}
    </button>
  );
};

export default forwardRef<HTMLButtonElement, VerifyButtonProps>(VerifyButton);
