import { RoleScopeKind } from '@onefootprint/types';
import { LinkButton, Text } from '@onefootprint/ui';
import { useTranslation } from 'react-i18next';
import PermissionGate from 'src/components/permission-gate';

export type ValueProps = {
  children?: string | null;
  cta: {
    label: string;
    onClick: () => void;
  };
};

const Value = ({ children, cta }: ValueProps) => {
  const { t } = useTranslation('common', {
    keyPrefix: 'pages.settings.business-profile',
  });

  return children ? (
    <Text variant="body-3">{children}</Text>
  ) : (
    <PermissionGate scopeKind={RoleScopeKind.orgSettings} fallbackText={t('not-allowed')}>
      <LinkButton onClick={cta.onClick}>{cta.label}</LinkButton>
    </PermissionGate>
  );
};

export default Value;
