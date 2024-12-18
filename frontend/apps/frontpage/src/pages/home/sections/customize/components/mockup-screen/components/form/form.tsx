import { TextInput } from '@onefootprint/ui';
import { cx } from 'class-variance-authority';
import { useTranslation } from 'react-i18next';

type FormProps = {
  borderRadius: string;
  backgroundColor: string;
};

const Form = ({ borderRadius, backgroundColor }: FormProps) => {
  const { t } = useTranslation('common', {
    keyPrefix: 'pages.home.customize.components.screen',
  });
  const generateComponentName = (name: string) => {
    const formattedName = name
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join('');
    return `<${`${formattedName}Input`} />`;
  };

  const componentBadgeClasses = cx(
    'text-label-3 rounded-full bg-secondary border border-tertiary text-secondary w-fit px-2 py-1 whitespace-nowrap shadow z-1',
  );

  return (
    <div className="flex flex-col items-center justify-center gap-5 overflow-visible border-t border-solid md:p-11 p-7 md:items-start md:w-full md:px-24 border-tertiary md:border-t-0">
      <div className="flex flex-col w-full gap-2">
        <p className="text-label-2">{t('title')}</p>
        <p className="text-body-2 text-secondary">{t('subtitle')}</p>
      </div>
      <div className="relative flex flex-col w-full gap-6">
        <div className="relative w-full overflow-visible">
          <TextInput type="text" label={t('first-name')} placeholder="Jane" />
          <div className="absolute right-0 -top-3 md:transform md:translate-x-1 md:-top-3 md:-right-10">
            <span className={componentBadgeClasses}>{generateComponentName(t('first-name'))}</span>
          </div>
        </div>
        <div className="relative w-full overflow-visible">
          <TextInput type="text" label={t('last-name')} placeholder="Doe" />
          <div className="absolute right-0 -top-3 md:transform md:translate-x-1 md:-top-3 md:-right-10">
            <span className={componentBadgeClasses}>{generateComponentName(t('last-name'))}</span>
          </div>
        </div>
        <div className="relative w-full overflow-visible">
          <TextInput
            type="text"
            label={t('date-of-birth')}
            mask={{
              date: true,
              delimiter: '/',
              datePattern: ['m', 'd', 'Y'],
            }}
            placeholder="MM/DD/YYYY"
          />
          <div className="absolute right-0 -top-3 md:transform md:translate-x-1 md:-top-3 md:-right-10">
            <span className={componentBadgeClasses}>{'<DOBInput />'}</span>
          </div>
        </div>
        <button
          type="button"
          className={cx('relative flex items-center justify-center flex-1 p-2 mt-5 text-quinary text-label-2')}
          style={{
            borderRadius: `${borderRadius}px`,
            backgroundColor: backgroundColor,
          }}
        >
          {t('cta')}
        </button>
      </div>
    </div>
  );
};

export default Form;
