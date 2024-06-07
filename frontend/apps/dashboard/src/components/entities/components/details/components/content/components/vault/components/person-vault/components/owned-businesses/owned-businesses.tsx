import { IcoStore24 } from '@onefootprint/icons';
import { Box, Text } from '@onefootprint/ui';
import Link from 'next/link';
import React from 'react';
import { useTranslation } from 'react-i18next';
import styled, { css } from 'styled-components';

import type { EntityOwnedBusinessInfo } from '@/entity/hooks/use-entity-owned-businesses';

type OwnedBusinessesProps = {
  businesses?: EntityOwnedBusinessInfo[];
};

const OwnedBusinesses = ({ businesses }: OwnedBusinessesProps) => {
  const { t } = useTranslation('common', {
    keyPrefix: 'pages.user.vault.businesses',
  });

  if (!businesses?.length) {
    return null;
  }

  return (
    <Container aria-label="Businesses">
      <Box>
        <Header>
          <Title>
            <IcoStore24 />
            <Text variant="label-3">{t('title')}</Text>
          </Title>
        </Header>
        <Content>
          {businesses.map(business => (
            <Field>
              <Text variant="body-3" color="tertiary" tag="label" id={business.id}>
                {business.name}
              </Text>
              <Text color="accent" variant="label-3">
                <Link target="_blank" href={`/businesses/${business.id}`}>
                  {t('link')}
                </Link>
              </Text>
            </Field>
          ))}
        </Content>
      </Box>
    </Container>
  );
};

const Container = styled.fieldset`
  ${({ theme }) => css`
    border-radius: ${theme.spacing[2]};
    border: ${theme.borderWidth[1]} solid ${theme.borderColor.tertiary};
    display: flex;
    flex-direction: column;
    width: 100%;
    height: 100%;
    justify-content: space-between;
  `};
`;

const Header = styled.header`
  ${({ theme }) => css`
    background-color: ${theme.backgroundColor.secondary};
    border-bottom: 1px solid ${theme.borderColor.tertiary};
    border-radius: ${theme.spacing[2]} ${theme.spacing[2]} 0 0;
    display: flex;
    justify-content: space-between;
    padding: ${theme.spacing[3]} ${theme.spacing[5]};
  `};
`;

const Title = styled.div`
  ${({ theme }) => css`
    display: flex;
    align-items: center;
    gap: ${theme.spacing[3]};
  `};
`;

const Content = styled.div`
  ${({ theme }) => css`
    display: flex;
    flex-direction: column;
    gap: ${theme.spacing[4]};
    padding: ${theme.spacing[5]} ${theme.spacing[7]};
  `};
`;

const Field = styled.div`
  display: flex;
  flex-direction: column wrap;
  justify-content: space-between;
  align-items: center;
`;

export default OwnedBusinesses;
