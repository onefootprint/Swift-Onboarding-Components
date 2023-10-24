import { useTranslation } from '@onefootprint/hooks';
import { HeaderTitle, NavigationHeader } from '@onefootprint/idv-elements';
import { Button, Grid } from '@onefootprint/ui';
import React from 'react';

import useHandoffMachine from '../../hooks/use-handoff-machine';

const Expired = () => {
  const { t } = useTranslation('pages.expired');
  const [state] = useHandoffMachine();
  const { opener } = state.context;

  const handleClick = () => {
    window.close();
  };

  return (
    <>
      <NavigationHeader />
      <Grid.Container as="form" rowGap={8}>
        <HeaderTitle
          title={t('title')}
          subtitle={
            opener === 'mobile' ? t('subtitle.mobile') : t('subtitle.desktop')
          }
        />
        {opener === 'mobile' && (
          <Button onClick={handleClick} fullWidth>
            {t('cta')}
          </Button>
        )}
      </Grid.Container>
    </>
  );
};

export default Expired;
