import { LinkButton, Text } from '@onefootprint/ui';
import React from 'react';

type InlineActionProps = {
  isDisabled?: boolean;
  label: string;
  labelCta: string;
  onClick: (
    event:
      | React.MouseEvent<HTMLButtonElement | HTMLAnchorElement>
      | React.KeyboardEvent<HTMLButtonElement | HTMLAnchorElement>,
  ) => void;
  className?: string;
};

type EventClickType = React.MouseEvent<HTMLButtonElement | HTMLAnchorElement>;

const InlineAction = ({
  className,
  isDisabled,
  label,
  labelCta,
  onClick,
}: InlineActionProps): JSX.Element => {
  const handleClick = (event: EventClickType) => {
    if (!isDisabled) {
      onClick(event);
    }
  };

  return (
    <Text
      tag="span"
      className={className}
      color="tertiary"
      isPrivate
      variant="label-4"
    >
      {label}&nbsp;
      <LinkButton
        disabled={isDisabled}
        variant="label-4"
        onClick={event => handleClick(event as EventClickType)}
        data-dd-action-name={`inline-action:${labelCta}`}
      >
        {labelCta}
      </LinkButton>
    </Text>
  );
};

export default InlineAction;
