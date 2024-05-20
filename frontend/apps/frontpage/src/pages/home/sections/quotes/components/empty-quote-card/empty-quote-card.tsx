import { LinkButton, Stack, Text } from '@onefootprint/ui';
import React from 'react';
import { useTranslation } from 'react-i18next';
import styled, { css } from 'styled-components';

const EmptyQuoteCard = () => {
  const { t } = useTranslation('common', {
    keyPrefix: 'pages.home.quotes.empty-quote',
  });
  return (
    <Container align="center" justify="center" direction="column" gap={5}>
      <Text
        variant="body-3"
        maxWidth="320px"
        textAlign="center"
        color="tertiary"
      >
        {t('title')}
        <LinkButton variant="label-3" $paddingLeft={2}>
          {t('cta')}
        </LinkButton>
      </Text>
    </Container>
  );
};

const Container = styled(Stack)`
  ${({ theme }) => css`
    width: 100%;
    height: 100%;
    border-radius: ${theme.borderRadius.default};
    border: ${theme.borderWidth[1]} dashed ${theme.borderColor.tertiary};
    background-color: var(--custom-gray);
  `}
`;

export default EmptyQuoteCard;
