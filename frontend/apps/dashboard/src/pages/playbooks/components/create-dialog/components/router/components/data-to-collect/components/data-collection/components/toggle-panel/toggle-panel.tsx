import { IcoPlusSmall16, IcoTrash16 } from '@onefootprint/icons';
import { LinkButton, Text } from '@onefootprint/ui';
import React from 'react';
import { useTranslation } from 'react-i18next';
import styled, { css } from 'styled-components';

export type TogglePanelProps = {
  children: React.ReactNode;
  onAdd: () => void;
  onRemove: () => void;
  subtitle: string;
  title: string;
  value: boolean;
};

const TogglePanel = ({ value, children, onAdd, onRemove, title, subtitle }: TogglePanelProps) => {
  const { t } = useTranslation('playbooks', { keyPrefix: 'create.data-to-collect.toggle-panel' });

  return (
    <Container>
      <Header>
        <Text variant="label-3">{title}</Text>
        {value ? (
          <LinkButton iconComponent={IcoTrash16} iconPosition="left" onClick={onRemove} variant="label-4" destructive>
            {t('remove')}
          </LinkButton>
        ) : (
          <LinkButton iconComponent={IcoPlusSmall16} iconPosition="left" onClick={onAdd} variant="label-4">
            {t('add')}
          </LinkButton>
        )}
      </Header>
      {value ? (
        children
      ) : (
        <Text variant="body-3" color="tertiary">
          {subtitle}
        </Text>
      )}
    </Container>
  );
};

const Container = styled.div`
  ${({ theme }) => css`
    border-radius: ${theme.borderRadius.default};
    border: ${theme.borderColor.tertiary} ${theme.borderWidth[1]} solid;
    display: flex;
    flex-direction: column;
    gap: ${theme.spacing[6]};
    padding: ${theme.spacing[5]} ${theme.spacing[6]};
  `};
`;

const Header = styled.header`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  width: 100%;
`;

export default TogglePanel;
