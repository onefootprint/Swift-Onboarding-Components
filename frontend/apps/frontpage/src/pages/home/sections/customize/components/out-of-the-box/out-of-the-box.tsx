import { useTranslation } from 'react-i18next';

import { LinkButton } from '@onefootprint/ui';

type OutOfTheBoxProps = {
  onClick: () => void;
};

const OutOfTheBox = ({ onClick }: OutOfTheBoxProps) => {
  const { t } = useTranslation('common', {
    keyPrefix: 'pages.home.customize.components.out-of-the-box',
  });

  return (
    <p className="flex flex-wrap items-center justify-center gap-1 text-label-2 text-primary">
      {t('first-part')}
      <LinkButton onClick={onClick} variant="label-2">
        {t('cta')}
      </LinkButton>
      {t('second-part')}
    </p>
  );
};

export default OutOfTheBox;
