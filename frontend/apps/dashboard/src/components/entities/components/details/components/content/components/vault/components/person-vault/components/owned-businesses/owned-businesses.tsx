import { IcoStore16 } from '@onefootprint/icons';
import { Box, Stack, Text } from '@onefootprint/ui';
import { format } from 'date-fns';
import Link from 'next/link';
import { useTranslation } from 'react-i18next';
import styled, { css } from 'styled-components';

import type { EntityOwnedBusinessInfo } from '@/entity/hooks/use-entity-owned-businesses';

type OwnedBusinessesProps = {
  businesses?: EntityOwnedBusinessInfo[];
};

const formatDate = (date: string) => {
  return format(new Date(date), 'MMM d, yyyy');
};

const OwnedBusinesses = ({ businesses }: OwnedBusinessesProps) => {
  const { t } = useTranslation('common', {
    keyPrefix: 'pages.user.vault.businesses',
  });

  if (!businesses?.length) {
    return null;
  }

  const sortedBusinesses = [...businesses].sort(
    (a, b) => new Date(b.startTimestamp).getTime() - new Date(a.startTimestamp).getTime(),
  );
  return (
    <Container aria-label="Businesses">
      <Box>
        <Header>
          <Title>
            <IcoStore16 />
            <Text variant="label-3">{t('title')}</Text>
          </Title>
        </Header>
        <Content>
          {sortedBusinesses.map(business => (
            <Field key={business.id}>
              <Stack direction="column" gap={1}>
                <Text variant="label-3" color="primary" tag="label" id={business.id}>
                  {business.name}
                </Text>
                <Stack direction="row" gap={2} align="center">
                  <Text variant="body-3" color="tertiary">
                    {t('last-activity-at')}
                  </Text>
                  <Text variant="label-3" color="secondary">
                    {formatDate(business.startTimestamp)}
                  </Text>
                </Stack>
              </Stack>
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
    height: 40px;
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
    padding: ${theme.spacing[5]};
  `};
`;

const Field = styled.div`
  display: flex;
  justify-content: space-between;
`;

export default OwnedBusinesses;
