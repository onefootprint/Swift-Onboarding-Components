import { IcoArrowRightSmall16 } from '@onefootprint/icons';
import { Box, LinkButton, media, Stack, Text } from '@onefootprint/ui';
import React from 'react';
import { useTranslation } from 'react-i18next';
import styled, { css } from 'styled-components';

type QuoteFooterProps = {
  author: string;
  role: string;
  company: string;
  caseStudyLink: string;
};

const QuoteFooter = ({
  author,
  role,
  company,
  caseStudyLink,
}: QuoteFooterProps) => {
  const { t } = useTranslation('common', {
    keyPrefix: 'pages.industries.components',
  });
  return (
    <FooterContainer>
      <Stack direction="column" gap={2}>
        <Text variant="label-2" color="primary">
          {author}
        </Text>
        <Stack direction="row" gap={2}>
          <Text variant="label-2" color="tertiary">
            {role}
          </Text>
          <Text variant="label-2" color="tertiary">
            {`@ ${company}`}
          </Text>
        </Stack>
      </Stack>
      <LinkButton
        variant="label-2"
        iconComponent={IcoArrowRightSmall16}
        iconPosition="right"
        target="_blank"
        href={caseStudyLink}
      >
        {t('read-case-study')}
      </LinkButton>
    </FooterContainer>
  );
};

const FooterContainer = styled(Box)`
  ${({ theme }) => css`
    display: flex;
    flex-direction: column;
    gap: ${theme.spacing[3]};

    ${media.greaterThan('md')`
      flex-direction: row;
      justify-content: space-between;
      align-items: flex-end;
    `}
  `}
`;

export default QuoteFooter;
