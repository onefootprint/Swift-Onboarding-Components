import { IcoPlusSmall16 } from '@onefootprint/icons';
import { LinkButton } from '@onefootprint/ui';
import { useTranslation } from 'react-i18next';

type AddButtonProps = {
  onClick: () => void;
};

const AddButton = ({ onClick }: AddButtonProps) => {
  const { t } = useTranslation('onboarding', {
    keyPrefix: 'invite',
  });

  return (
    <LinkButton iconComponent={IcoPlusSmall16} iconPosition="left" onClick={onClick}>
      {t('add-more')}
    </LinkButton>
  );
};

export default AddButton;
