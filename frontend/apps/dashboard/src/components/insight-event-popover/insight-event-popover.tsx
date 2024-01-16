import { useTranslation } from '@onefootprint/hooks';
import styled, { css, keyframes } from '@onefootprint/styled';
import type { InsightEvent } from '@onefootprint/types';
import { createFontStyles, Grid, Stack, Typography } from '@onefootprint/ui';
import * as Popover from '@radix-ui/react-popover';
import React from 'react';
import { displayForUserAgent } from 'src/utils/user-agent';

import getRegion from './utils/get-region';

export type InsightEventPopoverProps = {
  insightEvent: InsightEvent;
  children: React.ReactNode;
};

const InsightEventPopover = ({
  insightEvent,
  children,
}: InsightEventPopoverProps) => {
  const { t } = useTranslation('components.insight-event-popover');
  const { city, country, ipAddress, region, userAgent, postalCode } =
    insightEvent;
  const fullRegion = getRegion(city, region);
  const insightList = [
    {
      label: 'region',
      value: fullRegion,
    },
    {
      label: 'country',
      value: country,
    },
    {
      label: 'postal-code',
      value: postalCode,
    },
    {
      label: 'ip-address',
      value: ipAddress,
    },
    {
      label: 'device-os',
      value: userAgent && displayForUserAgent(userAgent),
    },
  ];

  return (
    <Popover.Root>
      <UnderlinedTrigger>{children}</UnderlinedTrigger>
      <Popover.Portal>
        <Popover.Content asChild align="start" sideOffset={6}>
          <Content
            direction="column"
            gap={5}
            padding={5}
            backgroundColor="primary"
            borderRadius="default"
            borderColor="tertiary"
            borderWidth={1}
          >
            <Typography variant="label-3">{t('insights')}</Typography>
            <Stack direction="column" gap={3}>
              {insightList.map(({ label, value }) =>
                label && value ? (
                  <Grid.Container columns={['180px', '180px']} key={label}>
                    <Grid.Item>
                      <Typography variant="label-3" color="tertiary">
                        {t(label)}
                      </Typography>
                    </Grid.Item>
                    <Grid.Item>
                      <Typography variant="label-3" color="tertiary">
                        {value}
                      </Typography>
                    </Grid.Item>
                  </Grid.Container>
                ) : null,
              )}
            </Stack>
          </Content>
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  );
};

const UnderlinedTrigger = styled(Popover.Trigger)`
  ${({ theme }) => css`
    all: unset;
    ${createFontStyles('label-3')}
    cursor: pointer;
    color: ${theme.color.primary};
    position: relative;

    &::after {
      content: '';
      display: block;
      width: 90%;
      height: 1.5px;
      border-bottom: ${theme.borderWidth[2]} dashed ${theme.color.primary};
      position: absolute;
      bottom: -${theme.spacing[1]};
      left: 50%;
      transform: translateX(-50%);
    }

    &:hover {
      color: ${theme.color.tertiary};
    }
  `}
`;

const popOverEnter = keyframes`
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`;

const popOverExit = keyframes`
  from {
    opacity: 1;
    transform: translateY(0);
  }
  to {
    opacity: 0;
    transform: translateY(-10px);
  }
`;

const Content = styled(Stack)`
  &[data-state='open'] {
    animation: ${popOverEnter} 0.2s ease-out;
  }

  &[data-state='closed'] {
    animation: ${popOverExit} 0.2s ease-out;
  }
`;

export default InsightEventPopover;
