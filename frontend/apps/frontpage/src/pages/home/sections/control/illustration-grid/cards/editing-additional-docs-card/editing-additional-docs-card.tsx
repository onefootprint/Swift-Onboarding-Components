import { Checkbox, Stack, Text } from '@onefootprint/ui';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';

import CardAppearContent from '../../components/card-appear-content';
import CardContainer from '../../components/card-container';

const EditingAdditionalDocsCard = () => {
  const { t } = useTranslation('common', {
    keyPrefix: 'pages.home.control.illustration.editing-additional-documents',
  });
  const [proofOfAddressChecked, setProofOfAddressChecked] = useState(false);
  const [proofOfSSNChecked, setProofOfSSNChecked] = useState(false);
  const [customDocChecked, setCustomDocChecked] = useState(false);

  const isExtraContentVisible =
    proofOfAddressChecked || proofOfSSNChecked || customDocChecked;

  return (
    <CardContainer>
      <Text variant="label-3">{t('title')}</Text>
      <Stack direction="column" gap={3} paddingBottom={3}>
        <Checkbox
          label={t('proof-of-address.title')}
          hint={t('proof-of-address.subtitle')}
          checked={proofOfAddressChecked}
          onChange={() => setProofOfAddressChecked(!proofOfAddressChecked)}
        />
        <Checkbox
          label={t('proof-of-ssn.title')}
          hint={t('proof-of-ssn.subtitle')}
          checked={proofOfSSNChecked}
          onChange={() => setProofOfSSNChecked(!proofOfSSNChecked)}
        />
        <Checkbox
          label={t('custom.title')}
          hint={t('custom.subtitle')}
          checked={customDocChecked}
          onChange={() => setCustomDocChecked(!customDocChecked)}
        />
      </Stack>
      <CardAppearContent isVisible={isExtraContentVisible}>
        {t('extra-content')}
      </CardAppearContent>
    </CardContainer>
  );
};

export default EditingAdditionalDocsCard;
