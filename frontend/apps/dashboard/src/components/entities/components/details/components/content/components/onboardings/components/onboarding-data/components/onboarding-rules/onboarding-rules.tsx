import useEntityId from '@/entities/components/details/hooks/use-entity-id';
import { getEntitiesByFpIdRuleSetResultByRuleSetResultIdOptions } from '@onefootprint/axios/dashboard';
import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import ErrorComponent from 'src/components/error';
import Loading from '../../../loading';
import groupRuleResults from '../../utils/group-rule-results';
import Content from './components/content';

type OnboardingRulesProps = {
  ruleSetResultId: string;
};

const OnboardingRules = ({ ruleSetResultId }: OnboardingRulesProps) => {
  const { t } = useTranslation('entity-details', {
    keyPrefix: 'onboardings.data.rules',
  });
  const entityId = useEntityId();
  const { data, isPending, error } = useQuery(
    getEntitiesByFpIdRuleSetResultByRuleSetResultIdOptions({
      path: { fpId: entityId, ruleSetResultId },
    }),
  );

  return (
    <>
      {isPending && <Loading />}
      {error && <ErrorComponent error={error} />}
      {data && data.ruleResults.length > 0 && (
        <Content ruleResults={groupRuleResults(data.ruleResults).notTriggered} showTriggered={false} />
      )}
      {data?.ruleResults.length === 0 && <ErrorComponent error={t('no-rule-results')} />}
    </>
  );
};

export default OnboardingRules;
