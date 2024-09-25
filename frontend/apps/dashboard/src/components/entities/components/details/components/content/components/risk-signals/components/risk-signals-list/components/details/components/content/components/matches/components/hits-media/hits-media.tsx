import { useIntl } from '@onefootprint/hooks';
import { IcoArrowRightSmall16 } from '@onefootprint/icons';
import type { AmlHitMedia } from '@onefootprint/types';
import { LinkButton, Stack, Text, createFontStyles } from '@onefootprint/ui';
import { AnimatePresence, motion } from 'framer-motion';
import { useRef } from 'react';
import { useTranslation } from 'react-i18next';
import styled, { css } from 'styled-components';
import { useEffectOnce } from 'usehooks-ts';

import TruncatedText from '@/entities/components/details/components/truncated-text';

type HitsMediaProps = {
  mediaList: AmlHitMedia[];
};

const HitsMedia = ({ mediaList }: HitsMediaProps) => {
  const { t } = useTranslation('entity-details', {
    keyPrefix: 'risk-signals.details.matches.hits-media',
  });
  const { formatDateWithShortMonth } = useIntl();

  const firstMediaRef = useRef<HTMLDivElement>(null);
  useEffectOnce(() => {
    firstMediaRef.current?.scrollIntoView();
  });

  const renderMediaRow = (label: string, value: string) => (
    <Stack display="flex" direction="column" gap={3}>
      <Text variant="body-3" color="tertiary">
        {label}
      </Text>
      <ValueContainer>{value}</ValueContainer>
    </Stack>
  );

  return (
    <AnimatePresence>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        {mediaList.map((media: AmlHitMedia, index: number) => {
          const { date, title, snippet, url } = media;
          return (
            <MediaItem key={JSON.stringify(media)} ref={index === 0 ? firstMediaRef : null} role="group">
              {renderMediaRow(t('date'), date ? formatDateWithShortMonth(new Date(date)) : '-')}
              {renderMediaRow(t('title'), title ?? '-')}
              {snippet && (
                <Stack direction="column" gap={3}>
                  <Text variant="body-3" color="tertiary" textAlign="left" width="fit-content">
                    {t('snippet')}
                  </Text>
                  <TruncatedText text={snippet} maxTextViewHeight={215} textFontVariant="body-3" />
                </Stack>
              )}
              {url && (
                <LinkButton iconComponent={IcoArrowRightSmall16} iconPosition="right" href={url} target="_blank">
                  {t('url')}
                </LinkButton>
              )}
            </MediaItem>
          );
        })}
      </motion.div>
    </AnimatePresence>
  );
};

const MediaItem = styled.div`
  ${({ theme }) => css`
    display: flex;
    flex-direction: column;
    gap: ${theme.spacing[5]};
    padding: ${theme.spacing[7]} 0 0;
    scroll-margin: ${theme.spacing[7]};
    ${createFontStyles('body-3')};

    &:not(:last-child) {
      border-bottom: ${theme.borderWidth[1]} solid ${theme.borderColor.tertiary};
      padding-bottom: ${theme.spacing[7]};
    }

    &:first-child {
      padding-top: 0;
    }
  `}
`;

const ValueContainer = styled.div`
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
`;

export default HitsMedia;
