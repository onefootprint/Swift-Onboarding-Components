import footprint, {
  FootprintAppearance,
  UserData,
} from '@onefootprint/footprint-js';
import React from 'react';

export type FootprintButtonProps = {
  appearance?: FootprintAppearance;
  label?: string;
  onCanceled?: () => void;
  onClick?: (event: React.MouseEvent<HTMLButtonElement>) => void;
  onCompleted?: (validationToken: string) => void;
  publicKey: string;
  testID?: string;
  userData?: UserData;
};

const FootprintButton = ({
  appearance,
  label = 'Verify with Footprint',
  onCanceled,
  onClick,
  onCompleted,
  publicKey,
  testID,
  userData,
}: FootprintButtonProps) => {
  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    onClick?.(event);
    footprint.show({
      appearance,
      onCanceled,
      onCompleted,
      publicKey,
      userData,
    });
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

export default FootprintButton;
