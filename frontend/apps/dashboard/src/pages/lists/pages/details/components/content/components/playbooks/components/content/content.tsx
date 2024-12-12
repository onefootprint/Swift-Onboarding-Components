import { IcoArrowTopRight16 } from '@onefootprint/icons';
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
    <div className="flex flex-col gap-6">
      {list.playbooks?.map(playbook => (
        <div className="flex flex-col gap-2 px-4 py-3 border border-solid rounded border-tertiary" key={playbook.id}>
          <div className="flex flex-row items-center gap-2" id="playbook">
            <label className="text-label-3 text-tertiary" htmlFor="playbook">
              {t('playbook')}
            </label>
            <LinkButton
              onClick={() => handleClickPlaybook(playbook.id)}
              variant="label-3"
              iconComponent={IcoArrowTopRight16}
            >
              {playbook.name}
            </LinkButton>
          </div>

          <div className="flex flex-col items-baseline gap-2">
            <label className="text-label-3 text-tertiary" htmlFor="rules">
              {t('in-rule')}
            </label>
            <div className="flex flex-col gap-2" id="rules">
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
