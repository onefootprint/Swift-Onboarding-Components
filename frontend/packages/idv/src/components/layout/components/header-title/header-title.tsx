import type { Icon } from '@onefootprint/icons';
import { Stack, Text } from '@onefootprint/ui';
import type { ComponentProps } from 'react';

type StackProps = ComponentProps<typeof Stack>;

export const HEADER_TITLE_DEFAULT_ID = 'header-title';

export type HeaderTitleProps = {
  display?: StackProps['display'];
  flexDirection?: StackProps['flexDirection'];
  gap?: StackProps['gap'];
  icon?: Icon;
  marginBottom?: StackProps['marginBottom'];
  marginTop?: StackProps['marginTop'];
  subtitle?: string | JSX.Element;
  title: string | JSX.Element;
  titleElementId?: string;
  zIndex?: StackProps['zIndex'];
};

const HeaderTitle = ({
  display,
  flexDirection,
  gap = 3,
  icon: Icon,
  marginTop = 0,
  marginBottom = 0,
  subtitle,
  title,
  titleElementId = HEADER_TITLE_DEFAULT_ID,
  zIndex,
}: HeaderTitleProps) => (
  <Stack
    align="center"
    direction="column"
    display={display}
    flexDirection={flexDirection}
    gap={gap}
    marginBottom={marginBottom}
    marginTop={marginTop}
    textAlign="center"
    zIndex={zIndex}
  >
    {Icon && <Icon />}
    <Stack direction="column" align="center" gap={3}>
      <Text tag="h2" color="primary" variant="heading-3" id={titleElementId}>
        {title}
      </Text>
      {subtitle && (
        <Text variant="body-2" color="secondary" tag="h3">
          {subtitle}
        </Text>
      )}
    </Stack>
  </Stack>
);

export default HeaderTitle;
