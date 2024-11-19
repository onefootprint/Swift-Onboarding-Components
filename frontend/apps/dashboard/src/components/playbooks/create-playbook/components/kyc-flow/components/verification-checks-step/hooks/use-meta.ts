import { useTranslation } from 'react-i18next';
import useSession from 'src/hooks/use-session';

type MetaProps = {
  allowInternationalResident: boolean;
  canEdit: boolean;
  collectsDocs: boolean;
  collectsPhone: boolean;
  collectsSsn9: boolean;
  isProdNeuroEnabled: boolean;
  isProdSentilinkEnabled: boolean;
};

const useMeta = ({
  allowInternationalResident,
  canEdit,
  collectsDocs,
  collectsPhone,
  collectsSsn9,
  isProdNeuroEnabled,
  isProdSentilinkEnabled,
}: MetaProps) => {
  const { t } = useTranslation('playbooks', { keyPrefix: 'create.verification-checks' });
  const session = useSession();
  const canRunKyc = !allowInternationalResident;
  const showSkipKyc = !allowInternationalResident;
  const sentilinkHasAllData = collectsPhone && collectsSsn9;
  const hasNeuroPermission = !session.isLive || isProdNeuroEnabled;
  const hasSentilinkPermission = !session.isLive || isProdSentilinkEnabled;

  const getNeuroDisabledText = () => {
    if (!hasNeuroPermission) {
      return t('fraud-checks.neuro.no-live-permission');
    }
    if (!canEdit) {
      return t('cannot-edit');
    }
    return '';
  };

  const getSentilinkDisabledText = () => {
    if (!hasNeuroPermission) {
      return t('fraud-checks.sentilink.no-live-permission');
    }
    if (!canEdit) {
      return t('cannot-edit');
    }
    return '';
  };

  return {
    kyc: {
      canRun: canRunKyc,
      showSkip: showSkipKyc,
      disabled: !collectsDocs || !canEdit,
    },
    aml: {
      disabled: !canEdit,
      disableText: t('cannot-edit'),
    },
    neuro: {
      disabled: !hasNeuroPermission || !canEdit,
      disabledText: getNeuroDisabledText(),
      hasPermission: hasNeuroPermission,
    },
    sentilink: {
      disabled: !hasSentilinkPermission || !sentilinkHasAllData || !canEdit,
      disabledText: getSentilinkDisabledText(),
      hasPermission: hasSentilinkPermission,
      hasAllData: sentilinkHasAllData,
    },
  };
};

export default useMeta;
