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
  showTriggeredRules: boolean;
};

const OnboardingRules = ({ ruleSetResultId, showTriggeredRules }: OnboardingRulesProps) => {
  const { t } = useTranslation('entity-details', {
    keyPrefix: 'onboardings.data.rules',
  });
  const entityId = useEntityId();
  const { data, isPending, error } = useQuery({
    ...getEntitiesByFpIdRuleSetResultByRuleSetResultIdOptions({
      path: { fpId: entityId, ruleSetResultId },
    }),
    enabled: Boolean(entityId) && Boolean(ruleSetResultId),
  });

  return (
    <>
      {isPending && <Loading />}
      {error && <ErrorComponent error={error} />}
      {data && data.ruleResults.length > 0 && (
        <Content
          ruleResults={groupRuleResults(data.ruleResults)[showTriggeredRules ? 'triggered' : 'notTriggered']}
          showTriggered={showTriggeredRules}
        />
      )}
      {data?.ruleResults.length === 0 && <ErrorComponent error={t('no-rule-results')} />}
    </>
  );
};

export default OnboardingRules;
