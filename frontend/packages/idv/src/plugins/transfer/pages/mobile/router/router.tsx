import React, { useEffect } from 'react';
import { useTranslation } from 'react-i18next';

import useLogStateMachine from '../../../../../hooks/ui/use-log-state-machine';
import MobileProcessing from '../../../components/mobile-processing';
import useMobileMachine from '../../../hooks/mobile/use-mobile-machine';
import useRequirementsTitle from '../../../hooks/use-requirements-title-translation-key';
import NewTabRequest from '../new-tab-request';
import Sms from '../sms';

type RouterProps = {
  onDone: () => void;
};

const Router = ({ onDone }: RouterProps) => {
  const [state] = useMobileMachine();
  const { missingRequirements } = state.context;
  const isDone = state.matches('complete');
  useLogStateMachine('transfer-mobile', state);
  const { t } = useTranslation('idv');
  const title = useRequirementsTitle(missingRequirements);

  useEffect(() => {
    if (isDone) {
      onDone();
    }
  }, [isDone, onDone]);

  return (
    <>
      {state.matches('newTabRequest') && <NewTabRequest />}
      {state.matches('newTabProcessing') && (
        <MobileProcessing
          title={title}
          subtitle={t('transfer.pages.mobile.new-tab-processing.subtitle')}
          cta={t('transfer.pages.mobile.new-tab-processing.cancel')}
        />
      )}
      {state.matches('sms') && <Sms />}
      {state.matches('smsProcessing') && (
        <MobileProcessing
          title={title}
          subtitle={t('transfer.pages.mobile.sms-processing.subtitle')}
          cta={t('transfer.pages.mobile.sms-processing.cancel')}
        />
      )}
    </>
  );
};

export default Router;
