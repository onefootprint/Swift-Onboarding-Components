import { IcoPencil16, IcoPlusSmall16 } from '@onefootprint/icons';
import { LinkButton } from '@onefootprint/ui';
import { useTranslation } from 'react-i18next';

type CardTitleProps = {
  children: string;
  type?: 'edit' | 'add';
  onClick?: () => void;
};

const CardTitle = ({ children, type = 'edit', onClick }: CardTitleProps) => {
  const { t } = useTranslation('common', {
    keyPrefix: 'pages.home.control.illustration',
  });
  return (
    <div className="flex flex-row justify-between">
      <p className="text-label-3">{children}</p>
      <LinkButton
        variant="label-3"
        iconPosition="left"
        iconComponent={type === 'add' ? IcoPlusSmall16 : IcoPencil16}
        onClick={onClick}
      >
        {type === 'add' ? t('add') : t('edit')}
      </LinkButton>
    </div>
  );
};

export default CardTitle;
