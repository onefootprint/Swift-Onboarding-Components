import type { OnboardingConfig } from '@onefootprint/types';
import useSession from 'src/hooks/use-session';

import Content from './components/content';
import ErrorComponent from './components/error';
import Loading from './components/loading';
import useRules from './hooks/use-rules';

export type RulesProps = {
  playbook: OnboardingConfig;
  toggleDisableHeading: (disable: boolean) => void;
};

const Rules = ({ playbook, toggleDisableHeading }: RulesProps) => {
  const { data: response, isPending, error } = useRules(playbook.id);
  const isFirmEmployee = !!useSession().data.user?.isFirmEmployee;

  return (
    <>
      {response && (
        <Content
          hasRules={response.hasRules}
          playbook={playbook}
          shouldAllowEditing={playbook.isRulesEnabled || isFirmEmployee}
          actionRules={response.data}
          toggleDisableHeading={toggleDisableHeading}
        />
      )}
      {isPending && <Loading />}
      {error && <ErrorComponent error={error} />}
    </>
  );
};

export default Rules;
