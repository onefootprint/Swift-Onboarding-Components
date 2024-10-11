import { FRONTPAGE_BASE_URL } from '@onefootprint/global-constants';
import { IcoArrowUpRight16 } from '@onefootprint/icons';
import { LinkButton, Stack, Text } from '@onefootprint/ui';
import { useTranslation } from 'react-i18next';

type DateRowProps = {
  publishedAt: string;
  slug: string;
};

const DateRow: React.FC<DateRowProps> = ({ publishedAt, slug }) => {
  const { t } = useTranslation('common', { keyPrefix: 'components.private-layout.nav' });

  return (
    <Stack direction="row" justifyContent="space-between" width="100%">
      <Text variant="label-2" color="tertiary">
        {publishedAt}
      </Text>
      <LinkButton variant="label-2" iconComponent={IcoArrowUpRight16} href={`${FRONTPAGE_BASE_URL}/changelog/${slug}`}>
        {t('whats-new.more-details')}
      </LinkButton>
    </Stack>
  );
};

export default DateRow;
