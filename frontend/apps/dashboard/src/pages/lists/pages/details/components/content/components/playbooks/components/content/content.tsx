// import Rule from './components/rule';
import type { ListDetails } from '@onefootprint/request-types/dashboard';
import { LinkButton } from '@onefootprint/ui';
import { useRouter } from 'next/router';
import { useTranslation } from 'react-i18next';
import Rule from './components/rule';

type ContentProps = {
  list: ListDetails;
};

const Content = ({ list }: ContentProps) => {
  const { t } = useTranslation('lists', { keyPrefix: 'details.playbooks' });
  const router = useRouter();

  const handleClickPlaybook = (playbookId: string) => {
    router.push({
      pathname: `/playbooks/${playbookId}`,
    });
  };

  return (
    <div className="flex flex-col gap-6 mt-3">
      {list.playbooks?.map(playbook => (
        <div className="flex flex-col gap-3" key={playbook.id}>
          <div className="flex flex-row gap-2 items-center">
            <span className="text-primary text-label-3">{playbook.name}</span>
            <span className="text-primary text-label-2">•</span>
            <LinkButton onClick={() => handleClickPlaybook(playbook.id)} variant="label-3">
              {t('details')}
            </LinkButton>
          </div>

          <div className="flex flex-row gap-2 items-baseline pl-4">
            <span className="text-tertiary text-label-3 min-w-[44px]">{t('in-rule')}</span>
            <div className="flex flex-col gap-2">
              {playbook.rules.map(rule => (
                <Rule key={rule.ruleId} rule={rule} />
              ))}
            </div>
          </div>
        </div>
      ))}

      {!list.playbooks?.length && <div className="text-body-3 text-tertiary">{t('empty')}</div>}
    </div>
  );
};

export default Content;
