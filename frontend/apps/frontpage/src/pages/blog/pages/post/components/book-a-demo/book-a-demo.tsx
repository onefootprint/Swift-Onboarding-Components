import { IcoSparkles24 } from '@onefootprint/icons';
import { Button, Stack, Text } from '@onefootprint/ui';
import Image from 'next/image';
import Link from 'next/link';
import { useCallback, useState } from 'react';
import { Trans, useTranslation } from 'react-i18next';
import ContactDialog from 'src/components/contact-dialog';
import styled from 'styled-components';

const BookADemo = () => {
  const { t } = useTranslation('common', { keyPrefix: 'components.demo' });
  const [showDialog, setShowDialog] = useState(false);

  const handleBookCall = useCallback(() => {
    setShowDialog(true);
  }, []);

  return (
    <Stack
      padding={7}
      style={{ backgroundColor: '#EDF3FC' }}
      position="relative"
      marginTop={10}
      borderRadius="default"
      overflow="hidden"
    >
      <Stack paddingRight={9} direction="column" gap={7}>
        <Stack gap={5} direction="column">
          <Stack direction="row" gap={2} alignItems="center">
            <IcoSparkles24 />
            <Text variant="label-2">{t('title')}</Text>
          </Stack>
          <Text variant="body-3">
            <Trans
              ns="common"
              i18nKey="components.demo.description"
              components={{
                linkedin: <Link href="https://www.linkedin.com/company/onefootprint">{t('linkedin')}</Link>,
                x: <Link href="https://twitter.com/footprint_hq">{t('x')}</Link>,
              }}
            />
          </Text>
        </Stack>
        <Button variant="primary" style={{ width: 'fit-content' }} onClick={handleBookCall}>
          {t('book-a-call')}
        </Button>
      </Stack>
      <PenguinImage src="/demo/penguin-wink.svg" alt="Penguin" width={117} height={79} />
      <ContactDialog open={showDialog} onClose={() => setShowDialog(false)} />
    </Stack>
  );
};

const PenguinImage = styled(Image)`
  ${({ theme }) => `
    position: absolute;
    bottom: -${theme.spacing[1]};
    right: ${theme.spacing[7]};
    transform-origin: bottom right;
  `}
`;

export default BookADemo;
