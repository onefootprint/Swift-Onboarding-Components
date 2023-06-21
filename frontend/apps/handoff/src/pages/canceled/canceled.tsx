import { useTranslation } from '@onefootprint/hooks';
import { HeaderTitle, NavigationHeader } from '@onefootprint/idv-elements';
import styled from '@onefootprint/styled';
import React from 'react';

import useHandoffMachine from '../../hooks/use-handoff-machine';

const Canceled = () => {
  const [state] = useHandoffMachine();
  const { opener } = state.context;
  const { t } = useTranslation('pages.canceled');

  return (
    <>
      <NavigationHeader />
      <Aligner>
        <HeaderTitle
          title={t('title')}
          subtitle={
            opener === 'mobile' ? t('subtitle.mobile') : t('subtitle.desktop')
          }
        />
      </Aligner>
    </>
  );
};

const Aligner = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: calc(100% - 64px);
`;

export default Canceled;
