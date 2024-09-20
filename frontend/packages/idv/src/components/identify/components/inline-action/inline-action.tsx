import { LinkButton, Stack, Text } from '@onefootprint/ui';
import type React from 'react';

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

const InlineAction = ({ className, isDisabled, label, labelCta, onClick }: InlineActionProps): JSX.Element => {
  const handleClick = (event: EventClickType) => {
    if (!isDisabled) {
      onClick(event);
    }
  };

  return (
    <Stack direction="row" gap={1} align="center" justify="center" width="100%" flexWrap="wrap">
      <Text tag="span" whiteSpace="nowrap" className={className} color="tertiary" isPrivate variant="label-3">
        {label}&nbsp;
      </Text>
      <LinkButton
        disabled={isDisabled}
        variant="label-3"
        onClick={event => handleClick(event as EventClickType)}
        data-dd-action-name={`inline-action:${labelCta}`}
      >
        {labelCta}
      </LinkButton>
    </Stack>
  );
};

export default InlineAction;
