import { IcoUserCircle24 } from '@onefootprint/icons';
import { BusinessDI } from '@onefootprint/types';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { Box, useToast } from '@onefootprint/ui';
import type { TFunction } from 'i18next';
import type { SectionAction } from '../../../../../../components/confirm-collected-data';
import { Section, SectionItem } from '../../../../../../components/confirm-collected-data';
import { useStepUp } from '../../../../../../hooks';
import { useDecryptBusiness } from '../../../../../../queries';
import { FPCustomEvents, getLogger, sendCustomEvent } from '../../../../../../utils';
import useCollectKybDataMachine from '../../../../hooks/use-collect-kyb-data-machine';
import { formatTin, isScrubbed } from '../../../../utils/utils';
import TaxIdentificationForm from './tax-identification-form';

type T = TFunction<'idv', 'kyb.pages'>;

const { logError, logWarn } = getLogger({ location: 'kyb-identity-section' });

const showUnableToRevealTinToast = (t: T, toast: ReturnType<typeof useToast>) => {
  toast.show({
    title: t('confirm.something-went-wrong'),
    description: t('confirm.unable-to-reveal-tin'),
    variant: 'error',
  });
};

const IdentitySection = () => {
  const { t } = useTranslation('idv', { keyPrefix: 'kyb.pages' });
  const [state, send] = useCollectKybDataMachine();
  const toast = useToast();
  const mutDecryptBusiness = useDecryptBusiness();
  const [isEditing, setIsEditing] = useState(false);
  const [isHiding, setIsHiding] = useState(true);

  const { data } = state.context;
  const tinValue = data[BusinessDI.tin];

  const isTinNotScrubbed = !!tinValue && !isScrubbed(tinValue);
  const isTinHiddenOrScrubbed = isHiding || isScrubbed(tinValue);

  const stopEditing = () => setIsEditing(false);

  const {
    canStepUp: isServerAndDeviceReady,
    isLoading: isStepUpLoading,
    stepUp,
  } = useStepUp({
    authToken: state.context.idvContext.authToken,
    device: state.context.idvContext.device,
    onSuccess: (newAuthToken: string) => {
      send({ type: 'stepUpAuthTokenCompleted', payload: newAuthToken });
      sendCustomEvent(FPCustomEvents.stepUpCompleted, { authToken: newAuthToken });

      if (mutDecryptBusiness.isPending || isTinNotScrubbed) return;
      mutDecryptBusiness.mutate(
        { authToken: newAuthToken, fields: [BusinessDI.tin] },
        {
          onSuccess: payload => {
            setIsHiding(false);
            send({ type: 'stepUpDecryptionCompleted', payload });
          },
          onError: (error: unknown) => {
            logError('Decrypting TIN after step up failed', error);
            showUnableToRevealTinToast(t, toast);
          },
        },
      );
    },
    onError: (error: unknown) => {
      logWarn('useStepUp hook in kyb confirm page failed', error);
      showUnableToRevealTinToast(t, toast);
    },
  });

  const actions: SectionAction[] = [];
  if (!isEditing) {
    if (isServerAndDeviceReady && isScrubbed(tinValue)) {
      actions.push({
        actionTestID: 'kyb-basic-data-reveal-btn',
        isLoading: isStepUpLoading,
        label: t('confirm.reveal'),
        onClick: () => {
          if (isStepUpLoading || isTinNotScrubbed) return;
          stepUp();
        },
      });
    } else if (isTinNotScrubbed) {
      actions.push({
        actionTestID: isHiding ? 'kyb-basic-data-show-btn' : 'kyb-basic-data-hide-btn',
        label: t(`${isHiding ? 'confirm.reveal' : 'confirm.hide'}`),
        onClick: () => setIsHiding(!isHiding),
      });
    }

    actions.push({
      label: t('confirm.summary.edit'),
      onClick: () => setIsEditing(true),
    });
  }

  return (
    <Section
      testID="identity-section"
      title={t('confirm.identity.title')}
      actions={actions}
      IconComponent={IcoUserCircle24}
      content={
        !isEditing ? (
          <Box display="flex" flexDirection="column" gap={6}>
            <SectionItem
              text={t('confirm.basic-data.tin')}
              subtext={isTinHiddenOrScrubbed ? '•••••••••' : formatTin(tinValue)}
            />
          </Box>
        ) : (
          <TaxIdentificationForm ctaLabel={t('confirm.summary.save')} onComplete={stopEditing} onCancel={stopEditing} />
        )
      }
    />
  );
};

export default IdentitySection;
