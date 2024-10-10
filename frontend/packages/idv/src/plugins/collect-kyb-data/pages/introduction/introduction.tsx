import { IcoStore24, IcoUser24 } from '@onefootprint/icons';
import { Button, Stack } from '@onefootprint/ui';
import { useTranslation } from 'react-i18next';

import InfoBox from '../../../../components/info-box';
import HeaderTitle from '../../../../components/layout/components/header-title';
import CollectKybDataNavigationHeader from '../../components/collect-kyb-data-navigation-header';
import useCollectKybDataMachine from '../../hooks/use-collect-kyb-data-machine';

const Introduction = () => {
  const [, send] = useCollectKybDataMachine();
  const { t } = useTranslation('idv', { keyPrefix: 'kyb.pages' });

  const handleClick = () => {
    send({
      type: 'introductionCompleted',
    });
  };

  return (
    <Stack flexDirection="column" rowGap={7} justifyContent="center" alignItems="center">
      <CollectKybDataNavigationHeader />
      <HeaderTitle title={t('introduction.title')} subtitle={t('introduction.subtitle')} />
      <InfoBox
        items={[
          {
            title: t('introduction.guidelines.beneficial-owner.title'),
            description: t('introduction.guidelines.beneficial-owner.description'),
            Icon: IcoStore24,
          },
          {
            title: t('introduction.guidelines.bo-kyc.title'),
            description: t('introduction.guidelines.bo-kyc.description'),
            Icon: IcoUser24,
          },
        ]}
        variant="default"
      />
      <Button fullWidth onClick={handleClick} size="large">
        {t('cta.continue')}
      </Button>
    </Stack>
  );
};

export default Introduction;
