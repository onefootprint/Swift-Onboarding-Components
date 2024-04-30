import { IcoFileText16 } from '@onefootprint/icons';
import { Stack, Text } from '@onefootprint/ui';
import React from 'react';
import { useTranslation } from 'react-i18next';

import Section from '../section';

const Ocr = () => {
  const { t } = useTranslation('entity-documents', {
    keyPrefix: 'ocr',
  });

  return (
    <Section title={t('title')} IconComponent={IcoFileText16} id={t('title')}>
      <Stack gap={3} direction="column">
        <Stack justifyContent="space-between">
          <Text variant="body-1" color="tertiary">
            Full name
          </Text>
          <Text variant="body-1">Michelle Marie</Text>
        </Stack>
        <Stack justifyContent="space-between">
          <Text variant="body-1" color="tertiary">
            Date of birth
          </Text>
          <Text variant="body-1">10/31/1990</Text>
        </Stack>
        <Stack justifyContent="space-between">
          <Text variant="body-1" color="tertiary">
            Gender
          </Text>
          <Text variant="body-1">Female</Text>
        </Stack>
        <Stack justifyContent="space-between">
          <Text variant="body-1" color="tertiary">
            Address
          </Text>
          <Text variant="body-1">2345 Anywhere Street, Albany, 12222</Text>
        </Stack>
        <Stack justifyContent="space-between">
          <Text variant="body-1" color="tertiary">
            Document number
          </Text>
          <Text variant="body-1">123456789</Text>
        </Stack>
        <Stack justifyContent="space-between">
          <Text variant="body-1" color="tertiary">
            Issued at
          </Text>
          <Text variant="body-1">03/07/2022</Text>
        </Stack>
        <Stack justifyContent="space-between">
          <Text variant="body-1" color="tertiary">
            Expire at
          </Text>
          <Text variant="body-1">10/31/2029</Text>
        </Stack>
        <Stack justifyContent="space-between">
          <Text variant="body-1" color="tertiary">
            Issuing country
          </Text>
          <Text variant="body-1">United States</Text>
        </Stack>
        <Stack justifyContent="space-between">
          <Text variant="body-1" color="tertiary">
            Issuing state
          </Text>
          <Text variant="body-1">New York</Text>
        </Stack>
        <Stack justifyContent="space-between">
          <Text variant="body-1" color="tertiary">
            Ref number
          </Text>
          <Text variant="body-1">1234134145</Text>
        </Stack>
      </Stack>
    </Section>
  );
};

export default Ocr;
