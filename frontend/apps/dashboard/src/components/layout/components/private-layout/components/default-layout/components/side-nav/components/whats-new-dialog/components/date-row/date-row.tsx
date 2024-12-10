import { FRONTPAGE_BASE_URL } from '@onefootprint/global-constants';
import { IcoArrowUpRight16 } from '@onefootprint/icons';
import { LinkButton } from '@onefootprint/ui';
import { useTranslation } from 'react-i18next';

type DateRowProps = {
  publishedAt: string;
  slug: string;
};

const DateRow: React.FC<DateRowProps> = ({ publishedAt, slug }) => {
  const { t } = useTranslation('common', { keyPrefix: 'components.private-layout.nav' });

  return (
    <div className="flex flex-row justify-between w-full">
      <p className="text-label-2 text-tertiary">{publishedAt}</p>
      <LinkButton variant="label-2" iconComponent={IcoArrowUpRight16} href={`${FRONTPAGE_BASE_URL}/changelog/${slug}`}>
        {t('whats-new.more-details')}
      </LinkButton>
    </div>
  );
};

export default DateRow;
