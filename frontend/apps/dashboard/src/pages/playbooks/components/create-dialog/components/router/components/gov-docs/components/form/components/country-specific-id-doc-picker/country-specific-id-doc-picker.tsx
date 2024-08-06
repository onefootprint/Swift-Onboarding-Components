// @ts-nocheck

import { type DataToCollectFormData } from '@/playbooks/utils/machine/types';
import { IcoPlusSmall16 } from '@onefootprint/icons';
import type { CountryCode, SupportedIdDocTypes } from '@onefootprint/types';
import { LinkButton, Stack, Text } from '@onefootprint/ui';
import { useState } from 'react';
import { useFormContext } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

import ExistingCountryDocMappings from './components/existing-country-doc-mappings';
import Picker from './components/picker';

const CountrySpecificIdDocPicker = () => {
  const { t } = useTranslation('playbooks', {
    keyPrefix: 'create.gov-docs.country-specific',
  });
  const { t: allT } = useTranslation('common');
  const { watch, setValue } = useFormContext<DataToCollectFormData>();
  const countryDocMap = watch('person.docs.gov.country');
  const existingCountries = Object.keys(countryDocMap);
  const isEmptyMap = existingCountries.length === 0;
  const [showPicker, setShowPicker] = useState(false);
  const [editingCountryDocMap, setEditingCountryDocMap] = useState<
    Partial<Record<CountryCode, SupportedIdDocTypes[]>> | undefined
  >();

  const handleEdit = (country: CountryCode) => {
    const selectedDocs = countryDocMap[country];
    setEditingCountryDocMap({ [country]: selectedDocs });
    const newMap = { ...countryDocMap };
    delete newMap[country];
    setValue('person.docs.gov.country', newMap);
    setShowPicker(true);
  };

  const handleAdd = () => {
    setEditingCountryDocMap(undefined);
    setShowPicker(true);
  };

  const handleSave = (newCountry: CountryCode, newDocs: SupportedIdDocTypes[]) => {
    setShowPicker(false);
    const newMap = { ...countryDocMap, [newCountry]: newDocs };
    setEditingCountryDocMap(undefined);
    setValue('person.docs.gov.country', newMap);
  };

  const handleCancel = () => {
    setShowPicker(false);
    const newMap = { ...countryDocMap, ...editingCountryDocMap };
    setEditingCountryDocMap(undefined);
    setValue('person.docs.gov.country', newMap);
  };

  const handleRemove = (country: CountryCode) => {
    setShowPicker(false);
    const newMap = { ...countryDocMap };
    delete newMap[country];
    setEditingCountryDocMap(undefined);
    setValue('person.docs.gov.country', newMap);
  };

  return (
    <>
      <Stack direction="column" gap={1}>
        <Text variant="label-3">{t('title')}</Text>
        <Text variant="body-4">{t('subtitle')}</Text>
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
