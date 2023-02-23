import { useTranslation } from '@onefootprint/hooks';
import { IcoPlusSmall16 } from '@onefootprint/icons';
import {
  Box,
  LinkButton,
  Select,
  TextInput,
  Typography,
} from '@onefootprint/ui';
import React from 'react';

const IngressVaulting = () => {
  const { t } = useTranslation(
    'pages.proxy-configs.create.form.ingress-vaulting',
  );

  return (
    <Box>
      <Typography variant="label-2" sx={{ marginBottom: 5 }}>
        {t('title')}
      </Typography>
      <Box sx={{ marginBottom: 8 }}>
        <Select
          label={t('content-type.label')}
          options={[{ label: 'application/json', value: 'JSON' }]}
        />
      </Box>
      <Box sx={{ marginBottom: 5 }}>
        <Typography variant="label-2" sx={{ marginBottom: 5 }}>
          {t('vaulting-rules.title')}
        </Typography>
        <Box sx={{ display: 'grid', gap: 5 }}>
          <TextInput
            label={t('vaulting-rules.token.label')}
            placeholder={t('vaulting-rules.token.placeholder')}
          />
          <TextInput
            label={t('vaulting-rules.target.label')}
            placeholder={t('vaulting-rules.target.placeholder')}
          />
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

export default IngressVaulting;
