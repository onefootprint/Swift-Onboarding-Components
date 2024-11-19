import type { CountryRecord } from '@onefootprint/global-constants';
import { COUNTRIES } from '@onefootprint/global-constants';
import { IcoTrash16 } from '@onefootprint/icons';
import type { CountryCode, SupportedIdDocTypes } from '@onefootprint/types';
import { Button, CountrySelect, Divider, LinkButton, Stack } from '@onefootprint/ui';
import { useState } from 'react';
import { useFormContext } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import styled, { css } from 'styled-components';

import CheckboxChip from './components/checkbox-chip';
import useIdDocOptions from './hooks/use-id-doc-options';
import useSelectedDocuments from './hooks/use-selected-documents';

import type { GovDocsFormData } from '../../../../../../gov-docs.types';

type PickerProps = {
  editingCountryDocMap?: Partial<Record<CountryCode, SupportedIdDocTypes[]>>;
  onSave: (country: CountryCode, docs: SupportedIdDocTypes[]) => void;
  onRemove: (country: CountryCode) => void;
  onCancel: () => void;
};

const Picker = ({ editingCountryDocMap, onSave, onRemove, onCancel }: PickerProps) => {
  const { t } = useTranslation('common');
  const { watch } = useFormContext<GovDocsFormData>();
  const countryDocMap = watch('gov.country');
  const globalDocs = watch('gov.global');
  const editingCountry = editingCountryDocMap ? Object.keys(editingCountryDocMap)[0] : null;
  const editingCountryRecord = COUNTRIES.find(country => country.value === editingCountry);
  const editingDocs = editingCountryDocMap ? editingCountryDocMap[editingCountry as CountryCode] : null;
  const existingCountries = Object.keys(countryDocMap);
  const countryOptions = COUNTRIES.filter(
    country => country.value === editingCountry || !existingCountries.includes(country.value),
  );
  const [selectedCountry, setSelectedCountry] = useState<CountryRecord>(editingCountryRecord ?? countryOptions[0]);
  const documentOptions = useIdDocOptions();
  const globalDocOptions = documentOptions.filter(doc => globalDocs?.includes(doc.value));
  let preselectedDocs = documentOptions.filter(
    doc => selectedCountry.value === editingCountry && editingDocs?.includes(doc.value),
  );
  if (preselectedDocs.length === 0) {
    preselectedDocs = globalDocOptions;
  }
  const { selectedDocuments, setSelectedDocuments } = useSelectedDocuments(preselectedDocs, selectedCountry);

  const handleCountryChange = (field: CountryRecord) => {
    setSelectedCountry(field);
  };

  const handleSave = () => {
    onSave(
      selectedCountry.value,
      selectedDocuments.map(d => d.value),
    );
  };

  const handleCheckboxChange = (doc: {
    value: SupportedIdDocTypes;
    label: string;
  }) => {
    const isSelected = selectedDocuments.some(selectedDoc => selectedDoc.value === doc.value);
    if (isSelected) {
      setSelectedDocuments(selectedDocuments.filter(d => d.value !== doc.value));
    } else {
      setSelectedDocuments([...selectedDocuments, { ...doc }]);
    }
  };

  return (
    <Container direction="column">
      <Stack direction="column" paddingTop={2} paddingBottom={2}>
        <CountrySelectContainer paddingTop={4} paddingBottom={4} paddingLeft={5} paddingRight={5} width="100%">
          <CountrySelect
            data-dd-privacy="mask"
            label="Country"
            onChange={field => handleCountryChange(field as CountryRecord)}
            options={countryOptions}
            value={selectedCountry}
          />
        </CountrySelectContainer>
        <Stack
          direction="row"
          flexWrap="wrap"
          gap={3}
          paddingTop={4}
          paddingBottom={5}
          paddingLeft={5}
          paddingRight={5}
        >
          {documentOptions.map(doc => {
            const isSelected = selectedDocuments.some(selectedDoc => selectedDoc.value === doc.value);
            return (
              <CheckboxChip
                key={doc.value}
                isSelected={isSelected}
                onChange={() => handleCheckboxChange(doc)}
                label={doc.label}
                value={doc.value}
              />
            );
          })}
        </Stack>
      </Stack>
      <Divider variant="secondary" />
      <Stack align="center" justify="space-between" paddingTop={4} paddingBottom={4} paddingLeft={5} paddingRight={5}>
        <Stack gap={3}>
          <Button onClick={handleSave} variant="primary" disabled={selectedDocuments.length === 0}>
            {t('save')}
          </Button>
          <Button onClick={onCancel} variant="secondary">
            {t('cancel')}
          </Button>
        </Stack>
        <LinkButton
          iconComponent={IcoTrash16}
          iconPosition="left"
          onClick={() => onRemove(selectedCountry.value)}
          destructive
        >
          {t('remove')}
        </LinkButton>
      </Stack>
    </Container>
  );
};

const Container = styled(Stack)`
  ${({ theme }) => css`
    border: ${theme.borderColor.tertiary} solid ${theme.borderWidth[1]};
    border-radius: ${theme.borderRadius.default};
  `};
`;

const CountrySelectContainer = styled(Stack)`
  & > div {
    width: 100%;
  }
`;

export default Picker;
