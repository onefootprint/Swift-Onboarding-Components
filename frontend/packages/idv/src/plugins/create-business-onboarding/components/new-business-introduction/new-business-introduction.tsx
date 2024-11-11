import { IcoStore24, IcoUser24 } from '@onefootprint/icons';
import { Button, Stack } from '@onefootprint/ui';
import { useTranslation } from 'react-i18next';
import { HeaderTitle, InfoBox, NavigationHeader } from '../../../../components';

export type NewBusinessIntroductionProps = {
  onDone: () => void;
};

const NewBusinessIntroduction = ({ onDone }: NewBusinessIntroductionProps) => {
  const { t } = useTranslation('idv', { keyPrefix: 'kyb.pages' });

  return (
    <Stack flexDirection="column" rowGap={7} justifyContent="center" alignItems="center">
      <NavigationHeader
        leftButton={{
          confirmClose: true,
          variant: 'close',
        }}
      />
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
      <Button fullWidth onClick={onDone} size="large">
        {t('cta.continue')}
      </Button>
    </Stack>
  );
};

export default NewBusinessIntroduction;
