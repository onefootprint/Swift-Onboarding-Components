import { LinkButton, Text } from '@onefootprint/ui';
import type { ComponentProps } from 'react';
import React from 'react';

type TextProps = ComponentProps<typeof Text>;

type InlineActionProps = {
  isDisabled?: boolean | undefined;
  label: string;
  labelCta: string;
  sx?: TextProps['sx'];
  onClick: (
    event:
      | React.KeyboardEvent<HTMLAnchorElement>
      | React.KeyboardEvent<HTMLButtonElement>
      | React.MouseEvent<HTMLAnchorElement, MouseEvent>,
  ) => void;
};

const InlineAction = ({
  isDisabled,
  label,
  labelCta,
  onClick,
  sx,
}: InlineActionProps): JSX.Element => (
  <Text isPrivate variant="caption-1" color="tertiary" as="span" sx={sx}>
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
