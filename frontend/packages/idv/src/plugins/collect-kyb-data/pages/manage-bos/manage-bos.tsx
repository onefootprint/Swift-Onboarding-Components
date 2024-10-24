import { type BusinessOwner2, IdDI } from '@onefootprint/types';
import { Stack } from '@onefootprint/ui';
import { useTranslation } from 'react-i18next';
import HeaderTitle from '../../../../components/layout/components/header-title';
import CollectKybDataNavigationHeader from '../../components/collect-kyb-data-navigation-header';
import BosForm from './components/bos-form';
import BosList from './components/bos-list';

// TODO: Fetch from the backend
const mockBos: BusinessOwner2[] = [
  {
    id: 'bo_link_primary',
    hasLinkedUser: true,
    isAuthedUser: true,
    isMutable: true,
    decryptedData: {
      [IdDI.firstName]: 'Jane',
      [IdDI.lastName]: 'Doe',
      [IdDI.phoneNumber]: '+1234567890',
      [IdDI.email]: 'jane.doe@example.com',
    },
    populatedData: [IdDI.firstName, IdDI.lastName, IdDI.phoneNumber, IdDI.email],
    ownershipStake: 40,
  },
  {
    id: 'bo_link_secondary',
    hasLinkedUser: false,
    isAuthedUser: false,
    isMutable: true,
    decryptedData: {
      [IdDI.firstName]: 'John',
      [IdDI.lastName]: 'Smith',
      [IdDI.phoneNumber]: '+1987654321',
      [IdDI.email]: 'john.smith@example.com',
    },
    populatedData: [IdDI.firstName, IdDI.lastName, IdDI.phoneNumber, IdDI.email],
    ownershipStake: 35,
  },
];

const Manage = () => {
  const { t } = useTranslation('idv', { keyPrefix: 'kyb.pages.manage-bos' });

  return (
    <Stack direction="column" gap={5}>
      <CollectKybDataNavigationHeader />
      <HeaderTitle title={t('title')} subtitle={t('subtitle')} />
      <BosList
        /** // TODO: Change to existingBos */
        bos={mockBos}
        currentBo={mockBos[0]}
        onSubmit={() => {
          // TODO: Implement submit logic
        }}
      />
      <BosForm
        existingBos={mockBos}
        onSubmit={() => {
          // TODO: Implement submit logic
        }}
      />
    </Stack>
  );
};

export default Manage;
