import { useIntl } from '@onefootprint/hooks';
import type { Document } from '@onefootprint/types';
import { SelectCustom, Text } from '@onefootprint/ui';
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
      <SelectCustom.Root value={selected.startedAt} onValueChange={onChange}>
        <SelectCustom.Input disabled={options.length === 1} size="compact">
          {getLabel(selected)}
        </SelectCustom.Input>
        <SelectCustom.Content>
          <SelectCustom.Group>
            {options.map(doc => (
              <SelectCustom.Item key={doc.startedAt} value={doc.startedAt || ''}>
                <Text variant="body-3">{getLabel(doc)}</Text>
              </SelectCustom.Item>
            ))}
          </SelectCustom.Group>
        </SelectCustom.Content>
      </SelectCustom.Root>
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
