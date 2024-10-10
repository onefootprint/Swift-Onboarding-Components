import type { WorkflowRequestConfig } from '@onefootprint/types';
import { DocumentRequestKind, TriggerKind } from '@onefootprint/types';
import { useTranslation } from 'react-i18next';

const useGetActionName = () => {
  const { t } = useTranslation('entity-details', {
    keyPrefix: 'audit-trail.timeline.workflow-triggered-event',
  });

  const getActionName = (config: WorkflowRequestConfig) => {
    if (config.kind === TriggerKind.Onboard) {
      return t('actions.onboard');
    }
    if (config.kind === TriggerKind.RedoKyc) {
      return t('actions.redo_kyc');
    }
    if (config.kind === TriggerKind.Document) {
      const { configs, businessConfigs = [] } = config.data;
      const docConfigs = [...configs, ...businessConfigs];
      const docConfigKindMap = {
        [DocumentRequestKind.ProofOfAddress]: t('actions.proof_of_address'),
        [DocumentRequestKind.ProofOfSsn]: t('actions.proof_of_ssn'),
        [DocumentRequestKind.Identity]: t('actions.id_document'),
      };
      const actions = docConfigs.map(dc =>
        dc.kind === DocumentRequestKind.Custom ? dc.data.name : docConfigKindMap[dc.kind],
      );
      if (actions.length === 1) {
        return t('actions.document', { docConfigs: actions[0] });
      }
      const lastAction = actions.pop();
      return t('actions.document', { docConfigs: `${actions.join(', ')}, and ${lastAction}` });
    }
  };

  return getActionName;
};

export default useGetActionName;
