import { IcoStore24, IcoUsers24 } from '@onefootprint/icons';
import type { OrgMetricsResponse } from '@onefootprint/request-types/dashboard';
import { useTranslation } from 'react-i18next';
import Section from './components/section';

type ContentProps = {
  metrics: OrgMetricsResponse;
};

const Content = ({ metrics }: ContentProps) => {
  const { t } = useTranslation('home');

  return (
    <div className="flex flex-col gap-10">
      <fieldset aria-label={t('users')}>
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-2">
            <IcoUsers24 />
            <h2 className="text-heading-5">{t('users')}</h2>
          </div>
          <Section metrics={metrics.user} />
        </div>
      </fieldset>
      {metrics.business.newVaults ? (
        <fieldset aria-label={t('businesses')}>
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-2">
              <IcoStore24 />
              <h2 className="text-heading-5">{t('businesses')}</h2>
            </div>
            <Section metrics={metrics.business} />
          </div>
        </fieldset>
      ) : null}
    </div>
  );
};

export default Content;
