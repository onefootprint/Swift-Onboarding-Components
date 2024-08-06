import { IcoFileText24 } from '@onefootprint/icons';
import { BusinessDI, BusinessDIData } from '@onefootprint/types';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { Box, useToast } from '@onefootprint/ui';
import { TFunction } from 'i18next';
import type { SectionAction } from '../../../../../../components/confirm-collected-data';
import { Section, SectionItem } from '../../../../../../components/confirm-collected-data';
import type { SectionItemProps } from '../../../../../../components/confirm-collected-data/components/section-item';
import { useStepUp } from '../../../../../../hooks';
import { useDecryptBusiness } from '../../../../../../queries';
import { FPCustomEvents, getLogger, sendCustomEvent } from '../../../../../../utils';
import useCollectKybDataMachine from '../../../../hooks/use-collect-kyb-data-machine';
import BasicData from '../../../basic-data';

type T = TFunction<'idv', 'kyb.pages'>;

const { logError, logWarn } = getLogger({ location: 'kyc-confirm' });

const isDecrypted = (x: unknown): x is 'decrypted' => x === 'decrypted';

const formatTin = (str?: string): string => {
  if (!str) return '';
  const numbersOnly = str?.replace(/[^0-9]/g, '');
  return `${numbersOnly.slice(0, 2)}-${numbersOnly.slice(2)}`;
};

const showUnableToRevealTinToast = (t: T, toast: ReturnType<typeof useToast>) => {
  toast.show({
    title: t('confirm.something-went-wrong'),
    description: t('confirm.unable-to-reveal-tin'),
    variant: 'error',
  });
};

const getContentItems = (t: T, data: BusinessDIData, isHidden: boolean) => {
  const list = [];
  const name = data[BusinessDI.name];
  const doingBusinessAs = data[BusinessDI.doingBusinessAs];
  const tin = data[BusinessDI.tin];
  const corporationType = data[BusinessDI.corporationType];
  const website = data[BusinessDI.website];
  const phone = data[BusinessDI.phoneNumber];

  if (name) {
    list.push({ text: t('confirm.basic-data.business-name'), subtext: name });
  }
  if (doingBusinessAs) {
    list.push({ text: t('confirm.basic-data.doing-business-as'), subtext: doingBusinessAs });
  }
  if (tin) {
    list.push({
      text: t('confirm.basic-data.tin'),
      subtext: isHidden || isDecrypted(tin) ? '•••••••••' : formatTin(tin),
    });
  }
  if (corporationType) {
    list.push({
      text: t('confirm.basic-data.corporation-type'),
      subtext: t(`basic-data.form.corporation-type.mapping.${corporationType}` as unknown as TemplateStringsArray),
    });
  }
  if (website) {
    list.push({ text: t('confirm.basic-data.website'), subtext: website });
  }
  if (phone) {
    list.push({ text: t('confirm.basic-data.phone-number'), subtext: phone });
  }

  return list;
};

const BasicDataSection = () => {
  const { t } = useTranslation('idv', { keyPrefix: 'kyb.pages' });
  const [state, send] = useCollectKybDataMachine();
  const toast = useToast();
  const mutDecryptBusiness = useDecryptBusiness();
  const [isEditing, setIsEditing] = useState(false);
  const [isHiding, setIsHiding] = useState(false);

  const { data } = state.context;
  const tinValue = data[BusinessDI.tin];
  const hasNonDecryptedTin = !!tinValue && !isDecrypted(tinValue);
  const contentItems = getContentItems(t, data, isHiding);

  const stopEditing = () => setIsEditing(false);

  if (!contentItems.length) {
    return null;
  }

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

      if (!isDecrypted(tinValue)) return;
      if (mutDecryptBusiness.isLoading) return;
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

  const getSectionContent = () => {
    return !isEditing ? (
      <Box display="flex" flexDirection="column" gap={6}>
        {contentItems.map(({ text, subtext, textColor }: SectionItemProps) => (
          <SectionItem key={text} text={text} subtext={subtext} textColor={textColor} />
        ))}
      </Box>
    ) : (
      <BasicData hideHeader ctaLabel={t('confirm.summary.save')} onComplete={stopEditing} onCancel={stopEditing} />
    );
  };

  const actions: SectionAction[] = [];

  if (!isEditing) {
    if (isServerAndDeviceReady && isDecrypted(tinValue)) {
      actions.push({
        actionTestID: 'kyb-basic-data-reveal-btn',
        isLoading: isStepUpLoading,
        label: t('confirm.reveal'),
        onClick: () => {
          if (isStepUpLoading || !isDecrypted(tinValue)) return;
          stepUp();
        },
      });
    } else if (hasNonDecryptedTin) {
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
      testID="basic-data"
      title={t('confirm.basic-data.title')}
      actions={actions}
      IconComponent={IcoFileText24}
      content={getSectionContent()}
    />
  );
};

export default BasicDataSection;
