import { useIntl, useTranslation } from '@onefootprint/hooks';
import styled, { css } from '@onefootprint/styled';
import { Document } from '@onefootprint/types';
import { Select, Typography } from '@onefootprint/ui';
import React from 'react';

import { getDocumentVersion } from '../../../../utils';

export type SessionSelectProps = {
  documents: Document[];
  activeDocumentVersion: string;
  onActiveDocumentVersionChange: (version: string) => void;
};

const SessionSelect = ({
  documents,
  activeDocumentVersion,
  onActiveDocumentVersionChange,
}: SessionSelectProps) => {
  const { formatUtcDate } = useIntl();
  const { t } = useTranslation(
    'pages.entity.fieldset.document.drawer.session-selector',
  );
  const documentOptions = documents.map((document, index) => ({
    label: `${t('session')} ${index + 1} (${formatUtcDate(
      new Date(document.startedAt),
    )})`,
    value: getDocumentVersion(document, documents),
  }));

  const currentOption = documentOptions.find(
    option => option.value === activeDocumentVersion,
  );

  return (
    <SelectContainer>
      <Typography variant="label-2">{t('title')}</Typography>
      <Select
        placeholder={currentOption?.label || ''}
        options={documentOptions}
        onChange={newOption => onActiveDocumentVersionChange(newOption.value)}
        value={currentOption}
      />
    </SelectContainer>
  );
};

const SelectContainer = styled.div`
  ${({ theme }) => css`
    display: flex;
    align-items: center;
    width: 100%;
    justify-content: space-between;
    background-color: ${theme.backgroundColor.secondary};
    margin-top: -${theme.borderWidth[1]};
    border: ${theme.borderWidth[1]} ${theme.borderColor.tertiary} solid;
    padding: ${theme.spacing[4]} ${theme.spacing[5]};
  `};
`;

export default SessionSelect;
