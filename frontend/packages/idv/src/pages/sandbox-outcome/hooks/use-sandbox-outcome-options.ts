import { IdDocOutcome, OverallOutcome } from '@onefootprint/types';
import { IdVerificationOutcome } from '@onefootprint/types/src/data/sandbox-outcomes-type';
import { useTranslation } from 'react-i18next';

const useSandboxOutcomeOptions = () => {
  const { t } = useTranslation('idv', {
    keyPrefix: 'global.pages.sandbox-outcome',
  });

  const overallOutcomeSuccess = {
    label: t('overall-outcome.outcome.options.success.title'),
    value: OverallOutcome.success,
  };
  const overallOutcomeFail = {
    label: t('overall-outcome.outcome.options.fail.title'),
    value: OverallOutcome.fail,
  };
  const overallOutcomeManualReview = {
    label: t('overall-outcome.outcome.options.manual-review.title'),
    value: OverallOutcome.manualReview,
  };
  const overallOutcomeStepUp = {
    label: t('overall-outcome.outcome.options.step-up.title'),
    value: OverallOutcome.stepUp,
    description: t('overall-outcome.outcome.options.step-up.description'),
  };
  const overallOutcomeDocumentDecision = {
    label: t('overall-outcome.outcome.options.document-decision.title'),
    value: OverallOutcome.useRulesOutcome,
  };

  const idDocOutcomeSuccess = {
    label: t('id-doc-outcome.simulated-outcome.options.success.title'),
    value: IdDocOutcome.success,
  };
  const idDocOutcomeFail = {
    label: t('id-doc-outcome.simulated-outcome.options.fail.title'),
    value: IdDocOutcome.fail,
  };
  const idDocOutcomeReal = {
    label: t('id-doc-outcome.real-outcome.title'),
    value: IdVerificationOutcome.real,
  };

  const idDocOutcomeSimulated = {
    label: t('id-doc-outcome.simulated-outcome.title'),
    value: IdVerificationOutcome.simulated,
  };

  return {
    overallOutcomeOptions: {
      overallOutcomeSuccess,
      overallOutcomeFail,
      overallOutcomeManualReview,
      overallOutcomeStepUp,
      overallOutcomeDocumentDecision,
    },
    idDocOutcomeOptions: {
      simulatedOutcomeOptions: {
        idDocOutcomeSuccess,
        idDocOutcomeFail,
      },
      idDocOutcomeReal,
      idDocOutcomeSimulated,
    },
  };
};

export default useSandboxOutcomeOptions;
