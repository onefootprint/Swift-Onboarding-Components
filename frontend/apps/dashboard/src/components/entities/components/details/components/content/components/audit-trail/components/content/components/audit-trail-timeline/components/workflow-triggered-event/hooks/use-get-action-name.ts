import type { WorkflowRequestConfig } from '@onefootprint/types';
import { DocumentRequestKind, TriggerKind } from '@onefootprint/types';
import { useTranslation } from 'react-i18next';

const useGetActionName = () => {
  const { t } = useTranslation('common', {
    keyPrefix: 'pages.entity.audit-trail.timeline.workflow-triggered-event',
  });

  const getActionName = (config: WorkflowRequestConfig) => {
    let action;
    if (config.kind === TriggerKind.Onboard) {
      action = t(`actions.onboard`);
    } else if (config.kind === TriggerKind.RedoKyc) {
      action = t(`actions.redo_kyc`);
    } else if (config.kind === TriggerKind.Document) {
      // TODO when we start supporting requesting multiple documents, adjust the timeline event
      // accordingly
      const { configs } = config.data;
      const customConfig = configs.find(
        c => c.kind === DocumentRequestKind.Custom,
      );
      if (configs.some(c => c.kind === DocumentRequestKind.ProofOfAddress)) {
        action = t(`actions.proof_of_address`);
      } else if (configs.some(c => c.kind === DocumentRequestKind.ProofOfSsn)) {
        action = t(`actions.proof_of_ssn`);
      } else if (customConfig && 'name' in customConfig.data) {
        action = t(`actions.custom_document`, {
          docName: customConfig.data.name,
        });
      } else if (configs.some(c => c.kind === DocumentRequestKind.Identity)) {
        action = t(`actions.id_document`);
      }
    }
    return action;
  };
  return getActionName;
};

export default useGetActionName;
