import type React from 'react';
import { forwardRef } from 'react';

type InnerButtonProps = {
  className: string;
  label: string;
  onClick: React.MouseEventHandler<HTMLButtonElement> | undefined;
  testID?: string;
};

const InnerButton = ({ label, testID, className, onClick }: InnerButtonProps, ref?: React.Ref<HTMLButtonElement>) => (
  <button className={className} type="button" onClick={onClick} data-testid={testID} ref={ref}>
    <svg width="24" height="24" fill="none" xmlns="http://www.w3.org/2000/svg" role="img" aria-hidden="true">
      <path
        d="M14.66 14h2.666v-2.36a2.666 2.666 0 1 1 0-4.614V4H6.66v16h4.666v-2.666A3.333 3.333 0 0 1 14.66 14Z"
        fill="#76fb8f"
      />
    </svg>
    {label}
  </button>
);

export default forwardRef<HTMLButtonElement, InnerButtonProps>(InnerButton);
