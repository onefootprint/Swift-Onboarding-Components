import { IcoPlusSmall16 } from '@onefootprint/icons';
import type { CountrySpecificDocumentMapping, IdDocKind } from '@onefootprint/request-types/dashboard';

import type { CountryCode } from '@onefootprint/types';
import { LinkButton, Stack, Text } from '@onefootprint/ui';
import { useState } from 'react';
import { useFormContext } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

import ExistingCountryDocMappings from './components/existing-country-doc-mappings';
import Picker from './components/picker';

import type { GovDocsFormData } from '../../../../gov-docs.types';

const CountrySpecificIdDocPicker = () => {
  const { t } = useTranslation('playbooks', {
    keyPrefix: 'create.gov-docs.country-specific',
  });
  const { t: allT } = useTranslation('common');
  const { watch, setValue } = useFormContext<GovDocsFormData>();
  const countryDocMap = watch('gov.country');
  const existingCountries = Object.keys(countryDocMap);
  const isEmptyMap = existingCountries.length === 0;
  const [showPicker, setShowPicker] = useState(false);
  const [editingCountryDocMap, setEditingCountryDocMap] = useState<CountrySpecificDocumentMapping>();

  const handleEdit = (country: CountryCode) => {
    const selectedDocs = countryDocMap[country];
    setEditingCountryDocMap({ [country]: selectedDocs });
    const newMap = { ...countryDocMap };
    delete newMap[country];
    setValue('gov.country', newMap);
    setShowPicker(true);
  };

  const handleAdd = () => {
    setEditingCountryDocMap(undefined);
    setShowPicker(true);
  };

  const handleSave = (newCountry: CountryCode, newDocs: IdDocKind[]) => {
    setShowPicker(false);
    const newMap = { ...countryDocMap, [newCountry]: newDocs };
    setEditingCountryDocMap(undefined);
    setValue('gov.country', newMap);
  };

  const handleCancel = () => {
    setShowPicker(false);
    const newMap = { ...countryDocMap, ...editingCountryDocMap };
    setEditingCountryDocMap(undefined);
    setValue('gov.country', newMap);
  };

  const handleRemove = (country: CountryCode) => {
    setShowPicker(false);
    const newMap = { ...countryDocMap };
    delete newMap[country];
    setEditingCountryDocMap(undefined);
    setValue('gov.country', newMap);
  };

  return (
    <>
      <Stack direction="column" gap={1}>
        <Text variant="label-3">{t('title')}</Text>
        <Text variant="body-3">{t('subtitle')}</Text>
      </Stack>
      <Stack direction="column" gap={4}>
        {!isEmptyMap && <ExistingCountryDocMappings countryDocMappings={countryDocMap} onEdit={handleEdit} />}
        {showPicker ? (
          <Picker
            editingCountryDocMap={editingCountryDocMap}
            onSave={handleSave}
            onCancel={handleCancel}
            onRemove={handleRemove}
          />
        ) : (
          <LinkButton onClick={handleAdd} iconComponent={IcoPlusSmall16} iconPosition="left">
            {isEmptyMap ? allT('add') : allT('add-more')}
          </LinkButton>
        )}
      </Stack>
    </>
  );
};

export default CountrySpecificIdDocPicker;
