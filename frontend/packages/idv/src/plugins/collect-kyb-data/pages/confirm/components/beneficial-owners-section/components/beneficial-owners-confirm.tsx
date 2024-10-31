import type { HostedBusinessOwner } from '@onefootprint/request-types';
import type { PublicOnboardingConfig } from '@onefootprint/types';
import { IdDI } from '@onefootprint/types';
import { useTranslation } from 'react-i18next';
import EditBosForm from '../../../../manage-bos/components/edit-bos-form';
import type { NewBusinessOwner } from '../../../../manage-bos/manage-bos.types';

type BeneficialOwnersConfirmProps = {
  authToken: string;
  bos: HostedBusinessOwner[];
  config?: PublicOnboardingConfig;
  onDone: () => void;
};

const BeneficialOwnersConfirm = ({ authToken, bos, config, onDone }: BeneficialOwnersConfirmProps) => {
  const { t } = useTranslation('idv', { keyPrefix: 'kyb.pages.confirm' });
  const defaultFormValues: NewBusinessOwner[] = bos.map(bo => ({
    uuid: bo.uuid,
    email: bo.decryptedData[IdDI.email],
    phoneNumber: bo.decryptedData[IdDI.phoneNumber],
    firstName: bo.decryptedData[IdDI.firstName],
    lastName: bo.decryptedData[IdDI.lastName],
    ownershipStake: bo.ownershipStake,
  }));

  const confirmProps = {
    onCancel: onDone,
    ctaLabel: t('summary.save'),
  };

  return (
    <EditBosForm
      authToken={authToken}
      existingBos={bos}
      onDone={onDone}
      confirmProps={confirmProps}
      defaultFormValues={defaultFormValues}
      isLive={!!config?.isLive}
    />
  );
};

export default BeneficialOwnersConfirm;
