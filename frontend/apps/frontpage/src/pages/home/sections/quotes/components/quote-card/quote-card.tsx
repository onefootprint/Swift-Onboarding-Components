import { Box, Stack, Text } from '@onefootprint/ui';
import type { ParseKeys } from 'i18next';
import Image from 'next/image';
import React from 'react';
import { useTranslation } from 'react-i18next';
import styled, { css } from 'styled-components';

import type { Companies } from '../../quotes';
import QuoteIcon from './components/quote-icon';

type QuoteCardProps = {
  company: Companies;
};

const QuoteCard = ({ company }: QuoteCardProps) => {
  const { t } = useTranslation('common', {
    keyPrefix: 'pages.home.quotes.quote-list',
  });

  return (
    <CardContainer>
      <LogoContainer>
        <Image
          src={`/home/quotes/${company}/logo.png`}
          alt={`${company.charAt(0).toUpperCase() + company.slice(1)}'s logo`}
          width={200}
          height={200}
        />
      </LogoContainer>
      <Stack flex={1} position="relative">
        <PositionedQuoteIcon />
        <Text variant="body-3" zIndex={1} paddingTop={3} tag="blockquote">
          {t(`${company}.quote` as unknown as ParseKeys<'common'>)}&quot;
        </Text>
      </Stack>
      <Stack direction="column" align="flex-start" justify="flex-start" position="relative" gap={2}>
        <Text variant="label-3" tag="h4">
          {t(`${company}.name` as unknown as ParseKeys<'common'>)}
        </Text>
        <Text variant="body-3" color="tertiary" tag="h5">
          {t(`${company}.role` as unknown as ParseKeys<'common'>)}
        </Text>
        <AuthorImageContainer>
          <Image
            src={`/home/quotes/${company}/author.png`}
            alt={`${t(`${company}.name` as unknown as ParseKeys<'common'>)}'s headshot`}
            width={200}
            height={200}
          />
        </AuthorImageContainer>
      </Stack>
    </CardContainer>
  );
};

const CardContainer = styled(Stack)`
  ${({ theme }) => css`
    flex-direction: column;
    gap: ${theme.spacing[9]};
    width: 100%;
    height: 100%;
    background-color: ${theme.backgroundColor.primary};
    border-radius: ${theme.borderRadius.default};
    padding: ${theme.spacing[7]};
    border: ${theme.borderWidth[1]} solid ${theme.borderColor.tertiary};
  `}
`;

const AuthorImageContainer = styled(Box)`
  ${({ theme }) => css`
    position: absolute;
    transform: translateY(-50%) rotate(-5deg);
    top: 50%;
    right: 0;
    border-radius: calc(${theme.borderRadius.default} + 2px);
    overflow: hidden;
    padding: ${theme.spacing[2]};
    background-color: ${theme.backgroundColor.primary};
    box-shadow: ${theme.elevation[1]};
    width: 70px;
    height: 70px;

    img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      border-radius: ${theme.borderRadius.default};
      filter: saturate(0.8);
    }
  `}
`;

const LogoContainer = styled(Box)`
  img {
    width: 80px;
    height: auto;
    object-fit: contain;
  }
`;

const PositionedQuoteIcon = styled(QuoteIcon)`
  position: absolute;
  top: -4px;
  left: -8px;
  z-index: 0;
  opacity: 0.2;
  transform: scale(0.75);
`;

export default QuoteCard;
