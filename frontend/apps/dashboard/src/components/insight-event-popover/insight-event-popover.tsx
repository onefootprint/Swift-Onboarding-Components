import type { InsightEvent } from '@onefootprint/types';
import { Box, Grid, LinkButton, Stack, Text } from '@onefootprint/ui';
import { AnimatePresence, motion } from 'framer-motion';
import { useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { displayForUserAgent } from 'src/utils/user-agent';
import styled, { css, keyframes } from 'styled-components';
import { useOnClickOutside } from 'usehooks-ts';

import getRegion from './utils/get-region';

export type InsightEventPopoverProps = {
  insightEvent: InsightEvent;
  children: string;
};

const InsightEventPopover = ({ insightEvent, children }: InsightEventPopoverProps) => {
  const [showPopover, setShowPopover] = useState(false);
  const popOverRef = useRef(null);
  const { t } = useTranslation('common', {
    keyPrefix: 'components.insight-event-popover',
  });
  const { city, country, ipAddress, region, userAgent, postalCode } = insightEvent;
  const fullRegion = getRegion(city, region);
  const insightList = [
    {
      label: t('region'),
      value: fullRegion,
    },
    {
      label: t('country'),
      value: country,
    },
    {
      label: t('postal-code'),
      value: postalCode,
    },
    {
      label: t('ip-address'),
      value: ipAddress,
    },
    {
      label: t('device-os'),
      value: userAgent && displayForUserAgent(userAgent),
    },
  ];

  const handleShowPopover = () => {
    setShowPopover(!showPopover);
  };

  useOnClickOutside(popOverRef, () => {
    setShowPopover(false);
  });

  return (
    <Box position="relative">
      <LinkButton onClick={handleShowPopover}>{children}</LinkButton>
      <AnimatePresence>
        {showPopover && (
          <Content
            ref={popOverRef}
            direction="column"
            gap={5}
            padding={5}
            backgroundColor="primary"
            borderRadius="default"
            position="absolute"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
          >
            <Text variant="label-3">{t('insights')}</Text>
            <Stack direction="column" gap={3}>
              {insightList.map(({ label, value }) =>
                label && value ? (
                  <Grid.Container columns={['180px', '180px']} key={label}>
                    <Grid.Item>
                      <Text variant="label-3" color="tertiary">
                        {label}
                      </Text>
                    </Grid.Item>
                    <Grid.Item>
                      <Text variant="label-3" color="tertiary">
                        {value}
                      </Text>
                    </Grid.Item>
                  </Grid.Container>
                ) : null,
              )}
            </Stack>
          </Content>
        )}
      </AnimatePresence>
    </Box>
  );
};

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

const Content = styled(motion(Stack))`
  ${({ theme }) => css`
    border: ${theme.borderWidth[1]} solid ${theme.borderColor.tertiary};
    box-shadow: ${theme.elevation[3]};
    z-index: ${theme.zIndex.popover};

    &[data-state='open'] {
      animation: ${popOverEnter} 0.2s ease-out;
    }

    &[data-state='closed'] {
      animation: ${popOverExit} 0.2s ease-out;
    }
  `}
`;

export default InsightEventPopover;
