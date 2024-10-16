import { IcoPencil16 } from '@onefootprint/icons';
import { LinkButton } from '@onefootprint/ui';
import { useTranslation } from 'react-i18next';

type CtaProps = {
  onClick: () => void;
};

const Cta = ({ onClick }: CtaProps) => {
  const { t } = useTranslation('common');

  return (
    <LinkButton iconComponent={IcoPencil16} iconPosition="left" onClick={onClick} variant="label-3">
      {t('edit')}
    </LinkButton>
  );
};

export default Cta;
