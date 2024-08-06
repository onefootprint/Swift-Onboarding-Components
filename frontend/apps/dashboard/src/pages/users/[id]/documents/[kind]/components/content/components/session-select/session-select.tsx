import { useIntl } from '@onefootprint/hooks';
import type { Document } from '@onefootprint/types';
import { SelectNew, Text } from '@onefootprint/ui';
import { useTranslation } from 'react-i18next';
import styled, { css } from 'styled-components';

type SessionSelectProps = {
  onChange: (value: string) => void;
  options: Document[];
  selected: Document;
};

const SessionSelect = ({ options, selected, onChange }: SessionSelectProps) => {
  const { t } = useTranslation('entity-documents', {
    keyPrefix: 'session-select',
  });
  const intl = useIntl();

  const getLabel = (doc: Document) => {
    if (!doc.startedAt) return '';
    const date = new Date(doc.startedAt);
    return intl.formatDateWithTime(date);
  };

  return (
    <Header>
      <Text variant="label-1">{t('label')}</Text>
      <SelectNew
        onChange={onChange}
        placeholder="Select"
        options={options.map(doc => ({
          label: getLabel(doc),
          value: doc.startedAt || '',
        }))}
        size="compact"
        value={selected.startedAt}
        disabled={options.length === 1}
      />
    </Header>
  );
};

const Header = styled.header`
  ${({ theme }) => css`
    align-items: center;
    display: inline-flex;
    gap: ${theme.spacing[3]};
    justify-content: space-between;
  `}
`;

export default SessionSelect;
