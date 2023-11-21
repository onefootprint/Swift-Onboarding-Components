import type { FootprintAuthProps } from '@onefootprint/footprint-js';
import footprint, { FootprintComponentKind } from '@onefootprint/footprint-js';
import React, { forwardRef } from 'react';

export type AuthButtonProps = Omit<FootprintAuthProps, 'kind' | 'variant'> & {
  dialogVariant?: 'modal' | 'drawer';
  label?: string;
  onClick?: (event: React.MouseEvent<HTMLButtonElement>) => void;
  testID?: string;
};

const AuthButton = (
  {
    appearance,
    dialogVariant,
    l10n,
    label = 'Auth with Footprint',
    onCancel,
    onClick,
    onClose,
    onComplete,
    options,
    publicKey,
    testID,
    userData,
  }: AuthButtonProps,
  ref: React.Ref<HTMLButtonElement> = null,
) => {
  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    const config: FootprintAuthProps = {
      kind: FootprintComponentKind.Auth,
      appearance,
      l10n,
      onCancel,
      onClose,
      onComplete,
      options,
      publicKey,
      userData,
      variant: dialogVariant,
    };
    const component = footprint.init(config);
    component.render();
    onClick?.(event);
  };

  return (
    <button
      className="footprint-auth-button"
      type="button"
      onClick={handleClick}
      data-testid={testID}
      ref={ref}
    >
      <svg
        width="24"
        height="24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        role="img"
        aria-hidden="true"
      >
        <path
          d="M14.66 14h2.666v-2.36a2.666 2.666 0 1 1 0-4.614V4H6.66v16h4.666v-2.666A3.333 3.333 0 0 1 14.66 14Z"
          fill="#76fb8f"
        />
      </svg>
      {label}
    </button>
  );
};

export default forwardRef<HTMLButtonElement, AuthButtonProps>(AuthButton);
