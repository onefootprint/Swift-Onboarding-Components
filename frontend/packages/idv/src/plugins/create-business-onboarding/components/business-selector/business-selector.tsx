import { IcoBuilding16 } from '@onefootprint/icons';
import type { HostedBusiness } from '@onefootprint/request-types';
import { Badge, Button, Divider, Stack, Text } from '@onefootprint/ui';
import { format } from 'date-fns';
import { useTranslation } from 'react-i18next';
import styled, { css } from 'styled-components';
import { HeaderTitle, NavigationHeader } from '../../../../components';
import { useFormatRelative } from './business-selector.utils';

export type BusinessSelectorProps = {
  businesses: HostedBusiness[];
  onSelect: (id: string) => void;
  onAddNew: () => void;
  isBusy: boolean;
};

const BusinessSelector = ({ businesses, onSelect, onAddNew, isBusy }: BusinessSelectorProps) => {
  const { t } = useTranslation('idv', { keyPrefix: 'kyb.pages.business-selector' });
  const formatRelative = useFormatRelative();

  return (
    <Stack direction="column" rowGap={7} justifyContent="center" alignItems="center">
      <NavigationHeader leftButton={{ confirmClose: true, variant: 'close' }} />
      <HeaderTitle title={t('title', { count: businesses.length })} subtitle={t('subtitle')} />
      <Stack direction="column" gap={5} width="100%">
        <Stack direction="column" gap={4} width="100%">
          {businesses.map(business => {
            return (
              <Trigger key={business.id} onClick={() => onSelect(business.id)}>
                <Stack alignItems="center" justifyContent="space-between" marginBottom={3} height="20px">
                  <Text variant="caption-1" color="tertiary">
                    {formatRelative(business.lastActivityAt)}
                  </Text>
                  {business.isIncomplete ? <Badge variant="warning">{t('status.incomplete')}</Badge> : null}
                </Stack>
                <Stack gap={3} alignItems="center" marginBottom={5}>
                  <IcoBuilding16 />
                  <Text variant="label-3">{business.name}</Text>
                </Stack>
                <Divider />
                <Stack>
                  <Text variant="caption-1" color="tertiary" marginTop={3}>
                    {t('created-at', { date: format(new Date(business.createdAt), 'MM/dd/yyyy') })}
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
        <Button onClick={onAddNew} fullWidth size="large" loading={isBusy}>
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
    padding: ${theme.spacing[5]} ${theme.spacing[5]} ${theme.spacing[3]} ${theme.spacing[5]};
    width: 100%;
    display: block;
    border-radius: ${theme.borderRadius.default};
    cursor: pointer;

    &:hover {
      border-color: ${theme.borderColor.primary};
    }
  `}
`;

export default BusinessSelector;
