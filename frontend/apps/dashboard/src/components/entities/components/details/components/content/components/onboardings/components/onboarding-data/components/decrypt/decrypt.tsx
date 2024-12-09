import { useTranslation } from 'react-i18next';

import useEntityId from '@/entities/components/details/hooks/use-entity-id';
import { useRequestErrorToast } from '@onefootprint/hooks';
import type { DataIdentifier, VaultValue } from '@onefootprint/types';
import { LinkButton, LoadingSpinner, Tooltip } from '@onefootprint/ui';
import { useState } from 'react';
import { useDecryptControls } from '../../../../../vault/components/vault-actions';
import type { VaultType } from '../onboarding-user-data/hooks/use-seqno-vault';

type DecryptProps = {
  canDecrypt: boolean;
  onboardingId: string;
  onDecryptSuccess: (vault: VaultType) => void;
  vaultData: VaultType | undefined;
};

const Decrypt = ({ canDecrypt, onDecryptSuccess, onboardingId, vaultData }: DecryptProps) => {
  const { t } = useTranslation('entity-details');
  const entityId = useEntityId();
  const decryptControls = useDecryptControls();
  const showRequestErrorToast = useRequestErrorToast();
  const isVaultEmpty = Object.keys(vaultData?.vault || {}).length === 0;
  const [isInProgress, setIsInProgress] = useState(false);

  const handleDecryptSubmit = () => {
    setIsInProgress(true);

    const dis = Object.keys(vaultData?.vault || {}).map(key => key as DataIdentifier);
    decryptControls.decryptWithoutMachine(
      {
        reason: `Examining onboarding ${onboardingId}`,
        dis,
        entityId: entityId,
        vaultData: vaultData?.vault as Partial<Record<DataIdentifier, VaultValue>>,
      },
      {
        onSuccess: newData => {
          onDecryptSuccess({ vault: newData, transforms: {} });
          setIsInProgress(false);
        },
        onError: (error: unknown) => {
          showRequestErrorToast(error);
          setIsInProgress(false);
        },
      },
    );
  };

  return isInProgress ? (
    <LoadingSpinner size={20} />
  ) : (
    <Tooltip
      disabled={canDecrypt}
      text={isVaultEmpty ? t('decrypt.vault-empty-not-allowed') : t('decrypt.not-allowed')}
    >
      <LinkButton disabled={!canDecrypt} onClick={handleDecryptSubmit}>
        {t('onboardings.user-data.decrypt-all')}
      </LinkButton>
    </Tooltip>
  );
};

export default Decrypt;
