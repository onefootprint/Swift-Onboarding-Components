import { useTranslation } from '@onefootprint/hooks';
import { Typography } from '@onefootprint/ui';
import Link from 'next/link';
import React from 'react';
import { Trans } from 'react-i18next';
import styled, { css } from 'styled-components';

const Terms = () => {
  const { t } = useTranslation('components.selfie-consent.terms');

  return (
    <Container>
      <Item>
        <Typography color="secondary" variant="body-2">
          {t('collection')}
        </Typography>
      </Item>
      <Item>
        <Typography color="secondary" variant="body-2">
          {t('use')}
        </Typography>
      </Item>
      <Item>
        <Typography color="secondary" variant="body-2">
          <Trans
            i18nKey="components.selfie-consent.terms.share"
            components={{
              a: (
                <Link
                  href="https://www.onefootprint.com/privacy-policy"
                  rel="noopener noreferrer"
                  target="_blank"
                />
              ),
            }}
          />
        </Typography>
      </Item>
    </Container>
  );
};

const Container = styled.ul`
  ${({ theme }) => css`
    background: ${theme.backgroundColor.secondary};
    border-radius: ${theme.borderRadius.default};
    display: grid;
    gap: ${theme.spacing[3]};
    padding: ${theme.spacing[5]};
  `}
`;

const Item = styled.li`
  ${({ theme }) => css`
    list-style-type: disc;
    margin-left: ${theme.spacing[5]};
  `}
`;

export default Terms;
