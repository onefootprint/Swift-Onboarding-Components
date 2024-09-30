import { type Entity, hasEntityInvestorProfile } from '@onefootprint/types';
import { Stack, Tabs } from '@onefootprint/ui';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import GeneralInfoTab from './components/general-info-tab';
import InvestorProfileTab from './components/investor-profile-tab';

type PersonVaultFieldsetsProps = {
  entity: Entity;
};

const PersonVaultFieldsets = ({ entity }: PersonVaultFieldsetsProps) => {
  const { t } = useTranslation('entity-details', {
    keyPrefix: 'header-default.actions.edit-vault-drawer',
  });
  const hasInvestorProfile = hasEntityInvestorProfile(entity);
  const options = [
    { value: 'general-info', label: t('tabs.general-info') },
    { value: 'investor-profile', label: t('tabs.investor-profile') },
  ];
  const [tab, setTab] = useState(options[0].value);

  const handleChange = (value: string) => {
    setTab(value);
  };

  return hasInvestorProfile ? (
    <Stack direction="column" gap={7}>
      <Tabs options={options} onChange={handleChange} />
      {tab === 'general-info' && <GeneralInfoTab entity={entity} />}
      {tab === 'investor-profile' && <InvestorProfileTab entity={entity} />}
    </Stack>
  ) : (
    <GeneralInfoTab entity={entity} />
  );
};

export default PersonVaultFieldsets;
