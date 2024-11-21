import useEntityId from '@/entities/components/details/hooks/use-entity-id';
import { getEntitiesByFpIdRuleSetResultByRuleSetResultIdOptions } from '@onefootprint/axios/dashboard';
import { Text } from '@onefootprint/ui';
import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import ErrorComponent from 'src/components/error';
import Loading from '../../../loading';
import groupRuleResults from '../../utils/group-rule-results';

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
        <div>
          {Object.keys(groupRuleResults(data.ruleResults).notTriggered).map(action => (
            <Text variant="label-3">{action}</Text>
          ))}
        </div>
      )}
      {data?.ruleResults.length === 0 && <ErrorComponent error={t('no-rule-results')} />}
    </>
  );
};

export default OnboardingRules;
