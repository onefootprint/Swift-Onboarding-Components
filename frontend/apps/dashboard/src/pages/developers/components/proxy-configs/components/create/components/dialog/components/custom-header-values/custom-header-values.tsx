import { useTranslation } from '@onefootprint/hooks';
import { IcoPlusSmall16 } from '@onefootprint/icons';
import {
  Box,
  Checkbox,
  Grid,
  LinkButton,
  TextInput,
  Typography,
} from '@onefootprint/ui';
import React from 'react';

const CustomHeaderValues = () => {
  const { t } = useTranslation('pages.proxy-configs.create.form.custom-header');

  return (
    <Box>
      <Typography variant="label-2" sx={{ marginBottom: 5 }}>
        {t('title')}
      </Typography>
      <Box sx={{ display: 'grid', gap: 5, marginBottom: 7 }}>
        <Box>
          <Grid.Row>
            <Grid.Column col={6}>
              <TextInput
                label={t('name.label')}
                placeholder={t('name.label')}
              />
            </Grid.Column>
            <Grid.Column col={6}>
              <TextInput
                label={t('value.label')}
                placeholder={t('value.label')}
              />
            </Grid.Column>
          </Grid.Row>
        </Box>
        <Box>
          <Checkbox label={t('secret.label')} />
        </Box>
      </Box>
      <Box>
        <LinkButton
          iconComponent={IcoPlusSmall16}
          iconPosition="left"
          size="compact"
        >
          {t('add-more')}
        </LinkButton>
      </Box>
    </Box>
  );
};

export default CustomHeaderValues;
