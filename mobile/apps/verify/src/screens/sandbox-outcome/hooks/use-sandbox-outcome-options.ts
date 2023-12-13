import { IdDocOutcome, OverallOutcome } from '@onefootprint/types';

import useTranslation from '@/hooks/use-translation';

const useSandboxOutcomeOptions = () => {
  const { t } = useTranslation('pages.sandbox-outcome');

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
    value: OverallOutcome.documentDecision,
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
    value: IdDocOutcome.real,
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
    },
  };
};

export default useSandboxOutcomeOptions;
