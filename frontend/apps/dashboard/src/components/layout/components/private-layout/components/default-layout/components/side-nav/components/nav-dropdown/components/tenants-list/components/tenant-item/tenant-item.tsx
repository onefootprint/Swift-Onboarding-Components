import { IcoCheckSmall16 } from '@onefootprint/icons';
import type { GetAuthRolesOrg } from '@onefootprint/types';
import { Dropdown, Tooltip } from '@onefootprint/ui';
import { useTranslation } from 'react-i18next';
import styled, { css } from 'styled-components';

type TenantItemProps = {
  tenant: GetAuthRolesOrg;
  onClick: () => void;
  isSelected?: boolean;
};

const TenantItem = ({ tenant, onClick, isSelected }: TenantItemProps) => {
  const { t } = useTranslation('common', {
    keyPrefix: 'components.private-layout.nav.tenants-list',
  });

  return (
    <ItemContainer data-testid="tenant-item">
      <Tooltip
        text={t('errors.auth-method-not-supported', {
          tenantName: tenant.name,
        })}
        position="right"
        disabled={tenant.isAuthMethodSupported}
      >
        <TenantCheckmarkContainer>
          <EllipsisButton
            disabled={!tenant.isAuthMethodSupported}
            onClick={onClick}
            type="button"
            $isSelected={!!isSelected}
          >
            {tenant.name}
          </EllipsisButton>
          {isSelected && <IcoCheckSmall16 />}
        </TenantCheckmarkContainer>
      </Tooltip>
    </ItemContainer>
  );
};

const ItemContainer = styled(Dropdown.Item)`
  div[data-tooltip-trigger='true'] {
    width: 100%;
  }
`;

const TenantCheckmarkContainer = styled.div`
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const EllipsisButton = styled.button<{ $isSelected: boolean }>`
  ${({ $isSelected }) => css`
    width: ${$isSelected ? '90%' : '100%'};
    background: none;
    border: none;
    padding: 0;
    cursor: pointer;
    font: inherit;
    text-align: left;
    white-space: nowrap;
    text-overflow: ellipsis;
    overflow: hidden;
  `}
`;

export default TenantItem;
