import React, { useEffect } from 'react';
import { useTranslation } from 'react-i18next';

import useLogStateMachine from '../../../../hooks/ui/use-log-state-machine';
import Processing from '../../components/processing';
import useTransferMachine from '../../hooks/use-machine';
import useRequirementsTitle from '../../hooks/use-requirements-title-translation-key';
import ConfirmContinueOnDesktop from '../confirm-continue-on-desktop';
import NewTabRequest from '../new-tab-request';
import QRRegister from '../qr-register';
import Sms from '../sms';

type RouterProps = {
  onDone: () => void;
};

const Router = ({ onDone }: RouterProps) => {
  const [state] = useTransferMachine();
  const { missingRequirements, isContinuingOnDesktop } = state.context;
  const isDone = state.matches('complete');
  useLogStateMachine('transfer-mobile', state);
  const { t } = useTranslation('idv');
  const { title } = useRequirementsTitle(missingRequirements, !!isContinuingOnDesktop);

  useEffect(() => {
    if (isDone) {
      onDone();
    }
  }, [isDone, onDone]);

  return (
    <>
      {state.matches('qrRegister') && <QRRegister />}
      {state.matches('qrProcessing') && (
        <Processing
          title={title}
          subtitle={t('transfer.pages.qr-processing.subtitle')}
          cta={t('transfer.pages.qr-processing.cancel')}
        />
      )}
      {state.matches('confirmContinueOnDesktop') && <ConfirmContinueOnDesktop />}
      {state.matches('newTabRequest') && <NewTabRequest />}
      {state.matches('newTabProcessing') && (
        <Processing
          title={title}
          subtitle={t('transfer.pages.new-tab-processing.subtitle')}
          cta={t('transfer.pages.new-tab-processing.cancel')}
        />
      )}
      {state.matches('sms') && <Sms />}
      {state.matches('smsProcessing') && (
        <Processing
          title={title}
          subtitle={t('transfer.pages.sms-processing.subtitle')}
          cta={t('transfer.pages.sms-processing.cancel')}
        />
      )}
    </>
  );
};

export default Router;
