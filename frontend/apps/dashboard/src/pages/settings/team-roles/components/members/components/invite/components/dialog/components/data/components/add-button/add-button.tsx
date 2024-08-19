import { IcoPlusSmall16 } from '@onefootprint/icons';
import { LinkButton } from '@onefootprint/ui';
import { useTranslation } from 'react-i18next';

type AddButtonProps = {
  onClick: () => void;
};

const AddButton = ({ onClick }: AddButtonProps) => {
  const { t } = useTranslation('settings', {
    keyPrefix: 'pages.members.onboarding.invite',
  });

  return (
    <LinkButton iconComponent={IcoPlusSmall16} iconPosition="left" onClick={onClick} $marginTop={5}>
      {t('add-more')}
    </LinkButton>
  );
};

export default AddButton;
