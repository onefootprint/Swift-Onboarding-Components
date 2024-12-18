import { Stack, Text } from '@onefootprint/ui';
import type { ParseKeys } from 'i18next';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import CardAppearContent from '../../components/card-appear-content';
import CardContainer from '../../components/card-container';
import CardRow from '../../components/card-row';
import CardTitle from '../../components/card-title';

type PersonalInformationCardProps = {
  className?: string;
};

const contentRows = [
  {
    title: 'basic-information',
    rows: [
      {
        title: 'email',
        value: true,
      },
      {
        title: 'phone-number',
        value: true,
      },
      {
        title: 'first-and-last-name',
        value: false,
      },
      {
        title: 'date-of-birth',
        value: true,
      },
      {
        title: 'country-of-birth',
        value: false,
      },
      {
        title: 'address',
        value: true,
      },
    ],
  },
  {
    title: 'us-residents',
    rows: [
      {
        title: 'legal-status',
        value: true,
      },
      {
        title: 'ssn',
        value: 'Full',
      },
      {
        title: 'id-doc',
        value: true,
      },
      {
        title: 'selfie',
        value: true,
      },
    ],
  },
  {
    title: 'non-us-residents',
    rows: [
      {
        title: 'restricted',
        value: 'Mexico',
      },
      {
        title: 'id-document-scan',
        value: 'Passport',
      },
      {
        title: 'selfie',
        value: true,
      },
    ],
  },
];

const PersonalInformationCard = ({ className }: PersonalInformationCardProps) => {
  const { t } = useTranslation('common', {
    keyPrefix: 'pages.home.control.illustration.personal-information',
  });
  const [isExtraContentVisible, setIsExtraContentVisible] = useState(false);
  return (
    <CardContainer className={className}>
      <CardTitle onClick={() => setIsExtraContentVisible(prev => !prev)}>{t('title')}</CardTitle>
      <CardAppearContent isVisible={isExtraContentVisible}>{t('extra-content')}</CardAppearContent>
      <Stack direction="column" gap={7}>
        {contentRows.map(section => (
          <Stack direction="column" gap={3} key={section.title}>
            <Text variant="label-3">{t(`${section.title}.title` as unknown as ParseKeys<'common'>)}</Text>
            <Stack direction="column" gap={3}>
              {section.rows.map(row => (
                <CardRow
                  key={row.title}
                  title={t(`${section.title}.${row.title}` as unknown as ParseKeys<'common'>)}
                  value={row.value}
                />
              ))}
            </Stack>
          </Stack>
        ))}
      </Stack>
    </CardContainer>
  );
};

export default PersonalInformationCard;
