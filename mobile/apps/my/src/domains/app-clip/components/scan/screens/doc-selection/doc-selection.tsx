import { DEFAULT_COUNTRY } from '@onefootprint/global-constants';
import {
  IcoCar24,
  IcoIdCard24,
  IcoIdGeneric40,
  IcoPassport24,
} from '@onefootprint/icons';
import {
  Box,
  Button,
  Container,
  CountrySelect,
  Divider,
  RadioSelect,
  Typography,
} from '@onefootprint/ui';
import React, { useState } from 'react';

import useTranslation from '@/hooks/use-translation';
import type { ScreenProps } from '@/scan/scan.types';

import PermissionsDialog from './components/permissions-dialog';

type DocSelectionProps = ScreenProps<'DocSelection'>;

const DocSelection = ({ navigation }: DocSelectionProps) => {
  const { t } = useTranslation('components.scan.doc-selection');
  const [docType, setDocType] = useState('driversLicense');
  const [country, setCountry] = useState<any>(DEFAULT_COUNTRY);

  const handlePress = () => {
    navigation.push('DriversLicense');
  };

  return (
    <Container>
      <Box center marginBottom={7} marginTop={8}>
        <IcoIdGeneric40 />
        <Typography variant="heading-3">{t('title')}</Typography>
        <Typography variant="body-3">{t('subtitle')}</Typography>
      </Box>
      <Box justifyContent="space-between" flex={1}>
        <Box>
          <CountrySelect onChange={setCountry} value={country} />
          <Divider marginVertical={7} />
          <RadioSelect
            value={docType}
            onChange={setDocType}
            marginBottom={7}
            options={[
              {
                title: t('options.dl.title'),
                description: t('options.dl.description'),
                value: 'driversLicense',
                IconComponent: IcoCar24,
              },
              {
                title: t('options.id.title'),
                description: t('options.id.description'),
                value: 'idCard',
                IconComponent: IcoIdCard24,
              },
              {
                title: t('options.passport.title'),
                description: t('options.passport.description'),
                value: 'passport',
                IconComponent: IcoPassport24,
              },
            ]}
          />
        </Box>
        <PermissionsDialog>
          <Button onPress={handlePress}>{t('cta')}</Button>
        </PermissionsDialog>
      </Box>
    </Container>
  );
};

export default DocSelection;
