import { Button } from '@onefootprint/ui';
import React, { useState } from 'react';
import { useFormContext } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import styled, { css } from 'styled-components';

import Document from '../../../../../document';

type DocEditorProps = {
  onDone: () => void;
};

const DocEditor = ({ onDone }: DocEditorProps) => {
  const { t: allT } = useTranslation('common');
  const { watch, setValue } = useFormContext();
  const selectedGlobalDocs = watch('personal.idDocKind');
  const selectedCountrySpecificDocs = watch('personal.countrySpecificIdDocKind');
  const [initialDocs] = useState({
    selectedGlobalDocs,
    selectedCountrySpecificDocs,
  });
  const hasDocs = selectedGlobalDocs.length > 0 || Object.keys(selectedCountrySpecificDocs).length > 0;

  const handleCancel = () => {
    setValue('personal.idDocKind', initialDocs.selectedGlobalDocs);
    setValue('personal.countrySpecificIdDocKind', initialDocs.selectedCountrySpecificDocs);
    onDone();
  };

  const handleSave = () => {
    if (hasDocs) setValue('personal.idDoc', true);
    else setValue('personal.idDoc', false);
    onDone();
  };

  return (
    <>
      <Document />
      <ButtonContainer>
        <Button fullWidth variant="primary" onClick={handleSave}>
          {allT('save')}
        </Button>
        <Button variant="secondary" fullWidth onClick={handleCancel}>
          {allT('cancel')}
        </Button>
      </ButtonContainer>
    </>
  );
};

const ButtonContainer = styled.div`
  ${({ theme }) => css`
    display: flex;
    flex-direction: column;
    gap: ${theme.spacing[4]};
  `};
`;

export default DocEditor;
