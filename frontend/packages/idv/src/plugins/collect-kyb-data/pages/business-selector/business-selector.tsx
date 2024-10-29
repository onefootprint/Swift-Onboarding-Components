import { Badge, Button, Divider, Stack, Text } from '@onefootprint/ui';
import { useTranslation } from 'react-i18next';
import styled, { css } from 'styled-components';
import HeaderTitle from '../../../../components/layout/components/header-title';
import type { Business } from './business-selector.types';

export type BusinessSelectorProps = {
  businesses: Business[];
  onSelect: (business: Business) => void;
  onAddNew: () => void;
};

const BusinessSelector = ({ businesses, onSelect, onAddNew }: BusinessSelectorProps) => {
  const { t } = useTranslation('idv', { keyPrefix: 'kyb.pages.business-selector' });

  return (
    <Stack direction="column" rowGap={7} justifyContent="center" alignItems="center">
      <HeaderTitle title={t('title')} subtitle={t('subtitle')} />
      <Stack direction="column" gap={5} width="100%">
        <Stack direction="column" gap={4} width="100%">
          {businesses.map(business => {
            return (
              <Trigger key={business.id} onClick={() => onSelect(business)}>
                <Stack justifyContent="space-between" marginBottom={3}>
                  <Text variant="caption-1" color="tertiary">
                    Last activity at 10/19/2024
                  </Text>
                  <Badge variant="warning">{t('status.incomplete')}</Badge>
                </Stack>
                <Stack justifyContent="space-between" marginBottom={5}>
                  <Text variant="label-3">{business.name}</Text>
                </Stack>
                <Divider />
                <Stack>
                  <Text variant="caption-1" color="tertiary" marginTop={3}>
                    {t('created-at', { date: '10/19/2024' })}
                  </Text>
                </Stack>
              </Trigger>
            );
          })}
        </Stack>
        <Stack gap={4} width="100%" center>
          <Divider />
          <Text variant="body-3" color="tertiary">
            {t('or')}
          </Text>
          <Divider />
        </Stack>
        <Button onClick={onAddNew} fullWidth size="large">
          {t('cta')}
        </Button>
      </Stack>
    </Stack>
  );
};

const Trigger = styled.button`
  ${({ theme }) => css`
    background: ${theme.backgroundColor.primary};
    border: 1px solid ${theme.borderColor.tertiary};
    padding: ${theme.spacing[5]};
    width: 100%;
    display: block;
    border-radius: ${theme.borderRadius.default};
    cursor: pointer;
  `}
`;

export default BusinessSelector;
