import { IcoUserCircle24 } from '@onefootprint/icons';
import { getErrorMessage } from '@onefootprint/request';
import type { DecryptUserResponse } from '@onefootprint/types';
import { IdDI } from '@onefootprint/types';
import { useToast } from '@onefootprint/ui';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { TFunction } from 'i18next';
import type { SectionAction, SectionItemProps } from '../../../../../../components/confirm-collected-data';
import { Section, SectionItem } from '../../../../../../components/confirm-collected-data';
import { FPCustomEvents, sendCustomEvent } from '../../../../../../utils';
import { getLogger } from '../../../../../../utils/logger';
import useCollectKycDataMachine from '../../../../hooks/use-collect-kyc-data-machine';
import useDecryptUser from '../../../../hooks/use-decrypt-user';
import type { KycData } from '../../../../utils/data-types';
import {
  TaxIdDisplay,
  getTaxIdDataValue,
  getTaxIdFields,
  getTaxIdKind,
  getTypeOfTaxId,
  taxIdFormatter,
} from '../../../../utils/ssn-utils';
import type { TaxIdKind } from '../../../../utils/ssn-utils';
import isCountryUsOrTerritories from '../../../../utils/state-machine/utils/is-country-us-or-territories';
import Ssn from '../../../ssn';
import useStepUp from './hooks/use-step-up';

type T = TFunction<'idv', 'kyc.pages'>;
type TaxIdData = ReturnType<typeof getTaxIdDataValue>;

const getTaxIdVisualState = (data: TaxIdData) =>
  data?.value || data?.scrubbed ? TaxIdDisplay.hidden : TaxIdDisplay.skipped;

const getIdentitiesSections = (
  t: T,
  kind: TaxIdKind | undefined,
  value: string | undefined,
  display: TaxIdDisplay,
): SectionItemProps[] => {
  if (!kind) return [];
  const isHidden = display === TaxIdDisplay.hidden;
  const isSkipped = display === TaxIdDisplay.skipped;
  const subText = isSkipped ? t('confirm.identity.ssn-skipped-subtext') : taxIdFormatter(kind, value, isHidden);

  return [
    {
      subtext: subText,
      text:
        kind === 'ssn9'
          ? t('confirm.identity.ssn9')
          : kind === 'ssn4'
            ? t('confirm.identity.ssn4')
            : kind === 'itin'
              ? t('confirm.identity.itin')
              : t('confirm.identity.us-tax-id'),
    },
  ];
};

const showErrorToast = (t: T, toast: ReturnType<typeof useToast>) => {
  toast.show({
    title: t('confirm.summary.reveal-error.title'),
    description: t('confirm.summary.reveal-error.description'),
    variant: 'error',
  });
};

const { logError, logWarn } = getLogger({ location: 'kyc-confirm' });

const IdentitySection = () => {
  const { t } = useTranslation('idv', { keyPrefix: 'kyc.pages' });
  const [state, send] = useCollectKycDataMachine();
  const { authToken, device, data, requirement } = state.context;
  const isUsOrTerritories = isCountryUsOrTerritories(data);
  const taxIdKind = getTaxIdKind(requirement);
  const taxIdObj = getTaxIdDataValue(data, taxIdKind);
  const [taxIdVisual, setTaxIdVisual] = useState(() => getTaxIdVisualState(taxIdObj));
  const [editing, setEditing] = useState(false);
  const toast = useToast();
  const mutDecryptUser = useDecryptUser();
  const identity = getIdentitiesSections(t, getTypeOfTaxId(taxIdKind, taxIdObj?.value), taxIdObj?.value, taxIdVisual);

  useEffect(() => {
    if (taxIdObj?.decrypted) {
      // If newly decrypted, want to reveal immediately
      setTaxIdVisual(TaxIdDisplay.revealed);
    } else {
      setTaxIdVisual(getTaxIdVisualState(taxIdObj));
    }
  }, [taxIdObj]);

  const stopEditing = () => setEditing(false);

  const getSectionContent = () =>
    !editing ? (
      identity.map(({ text, subtext, textColor }: SectionItemProps) => (
        <SectionItem key={text} text={text} subtext={subtext} textColor={textColor} />
      ))
    ) : (
      <Ssn onCancel={stopEditing} onComplete={stopEditing} hideHeader hideDisclaimer />
    );

  const handleDecryptSuccess = (payload: DecryptUserResponse) => {
    const decryptedData: KycData = {};
    Object.entries(payload).forEach(([key, value]) => {
      // @ts-expect-error: fix-me Type 'string | string[]' is not assignable to type 'undefined'.
      decryptedData[key as IdDI] = { value: value ?? '', decrypted: true };
    });

    send({ type: 'decryptedData', payload: decryptedData });
  };

  const handleStepUpSuccess = (stepUpAuthToken: string) => {
    send({ type: 'stepUpCompleted', payload: { authToken: stepUpAuthToken } });
    sendCustomEvent(FPCustomEvents.stepUpCompleted, { authToken: stepUpAuthToken });

    // If the user has already decrypted their SSN, we don't need to do it again
    if (!taxIdObj?.scrubbed) return;
    if (mutDecryptUser.isLoading) return;

    mutDecryptUser.mutate(
      { authToken: stepUpAuthToken, fields: getTaxIdFields(taxIdKind) },
      {
        onSuccess: handleDecryptSuccess,
        onError: (error: unknown) => {
          logError(`Decrypting ${taxIdKind} after step up failed. ${getErrorMessage(error)}`, error);
          showErrorToast(t, toast);
        },
      },
    );
  };

  const {
    canStepUp,
    isLoading: isStepUpLoading,
    needsStepUp,
    stepUp,
  } = useStepUp({
    authToken,
    device,
    onSuccess: handleStepUpSuccess,
    onError: (error: unknown) => {
      logWarn(`useStepUp hook in kyc confirm page failed, ${getErrorMessage(error)}`);
      showErrorToast(t, toast);
    },
  });

  const shouldTriggerStepUp = taxIdObj?.scrubbed && needsStepUp && canStepUp;
  const handleReveal = () => {
    if (taxIdObj?.value) {
      setTaxIdVisual(TaxIdDisplay.revealed);
    } else if (shouldTriggerStepUp) {
      stepUp();
    } else {
      logError(`Attempted to reveal ${taxIdKind} on confirm page when step up is not available`);
    }
  };

  const actions: SectionAction[] = [];
  if (!editing) {
    actions.push({
      label: t('confirm.summary.edit'),
      onClick: () => setEditing(true),
      actionTestID: 'identity-edit-button',
    });

    const canReveal = taxIdObj?.value || isStepUpLoading || shouldTriggerStepUp;
    if (canReveal) {
      if (taxIdVisual === TaxIdDisplay.revealed) {
        actions.unshift({
          label: t('confirm.summary.hide'),
          onClick: () => setTaxIdVisual(TaxIdDisplay.hidden),
          actionTestID: 'identity-hide-button',
        });
      } else {
        actions.unshift({
          label: t('confirm.summary.reveal'),
          onClick: handleReveal,
          isLoading: isStepUpLoading,
          actionTestID: 'identity-reveal-button',
        });
      }
    }
  }

  if (!isUsOrTerritories || !identity.length) {
    return null;
  }

  return (
    <Section
      title={t('confirm.identity.title')}
      actions={actions}
      IconComponent={IcoUserCircle24}
      content={getSectionContent()}
      testID="identity-section"
    />
  );
};

export default IdentitySection;
