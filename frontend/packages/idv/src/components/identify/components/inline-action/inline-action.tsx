import { LinkButton, Text } from '@onefootprint/ui';
import React from 'react';

type InlineActionProps = {
  isDisabled?: boolean | undefined;
  label: string;
  labelCta: string;
  onClick: (
    event:
      | React.KeyboardEvent<HTMLAnchorElement>
      | React.KeyboardEvent<HTMLButtonElement>
      | React.MouseEvent<HTMLAnchorElement, MouseEvent>,
  ) => void;
  className?: string;
};

const InlineAction = ({
  className,
  isDisabled,
  label,
  labelCta,
  onClick,
}: InlineActionProps): JSX.Element => (
  <Text
    tag="span"
    className={className}
    color="tertiary"
    isPrivate
    variant="caption-1"
  >
    {label}&nbsp;
    <LinkButton
      disabled={isDisabled}
      onClick={isDisabled ? undefined : onClick}
      size="tiny"
    >
      {labelCta}
    </LinkButton>
  </Text>
);

export default InlineAction;
