import footprint, {
  FootprintComponentKind,
  FootprintVerifyProps,
} from '@onefootprint/footprint-js';
import React from 'react';

export type VerifyButtonProps = Omit<
  FootprintVerifyProps,
  'kind' | 'variant' | 'publicKey'
> & {
  publicKey?: string;
  testID?: string;
  label?: string;
  onClick?: (event: React.MouseEvent<HTMLButtonElement>) => void;
  dialogVariant?: 'modal' | 'drawer';
};

const VerifyButton = ({
  appearance,
  label = 'Verify with Footprint',
  onCancel,
  onClick,
  onComplete,
  onClose,
  publicKey,
  userData,
  options,
  dialogVariant,
  testID,
}: VerifyButtonProps) => {
  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    onClick?.(event);
    if (!publicKey) {
      return;
    }
    const component = footprint.init({
      kind: FootprintComponentKind.Verify,
      variant: dialogVariant,
      appearance,
      onCancel,
      onComplete,
      onClose,
      publicKey,
      userData,
      options,
    });
    component.render();
  };

  return (
    <button
      className="footprint-button"
      type="button"
      onClick={handleClick}
      data-testid={testID}
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

export default VerifyButton;
