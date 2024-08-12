import { IcoChevronDown16, IcoFlag16, IcoInfo16, IcoPlusSmall16 } from '@onefootprint/icons';
import { Entity } from '@onefootprint/types';
import { Dropdown, Stack, Tooltip, createFontStyles } from '@onefootprint/ui';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import styled, { css } from 'styled-components';
import useLabelText from './hooks/use-label-text';

type FraudLabelProps = {
  entity: Entity;
};

const FraudLabel = ({ entity }: FraudLabelProps) => {
  const { t } = useTranslation('common', { keyPrefix: 'pages.entity.header.fraud-label' });
  const labelT = useLabelText();
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const { label } = entity;
  const tooltip = (
    <Tooltip text={t('tooltip')}>
      <IcoInfo16 />
    </Tooltip>
  );

  const toggleDropdown = () => {
    setIsOpen(isOpen => !isOpen);
  };

  return (
    <Dropdown.Root open={isOpen} onOpenChange={toggleDropdown}>
      <Dropdown.Trigger>
        {label ? (
          <Stack align="center">
            <LabelContainer>
              <LabelText>
                <IcoFlag16 />
                {labelT(label)}
                {tooltip}
              </LabelText>
            </LabelContainer>
            {label && (
              <TriggerContainer onClick={toggleDropdown} data-is-open={isOpen}>
                <IcoChevronDown16 />
              </TriggerContainer>
            )}
          </Stack>
        ) : (
          <AddLabelContainer onClick={toggleDropdown} data-is-open={isOpen}>
            <IcoPlusSmall16 />
            {t('add-label')}
            {tooltip}
          </AddLabelContainer>
        )}
      </Dropdown.Trigger>
    </Dropdown.Root>
  );
};

const LabelContainer = styled(Stack)`
  ${({ theme }) => css`
    ${createFontStyles('caption-1')};
    padding: ${theme.spacing[2]} 0 ${theme.spacing[2]} ${theme.spacing[3]};
    background-color: ${theme.backgroundColor.secondary};
    border-top-left-radius: ${theme.borderRadius.full};
    border-bottom-left-radius: ${theme.borderRadius.full};
    white-space: nowrap;
  `};
  `;

const LabelText = styled(Stack)`
  ${({ theme }) => css`
    gap: ${theme.spacing[2]};
    align-items: center;
    padding-right: ${theme.spacing[2]};
    border-right: ${theme.borderWidth[1]} solid ${theme.borderColor.tertiary};
  `};
`;

const TriggerContainer = styled(Stack)`
  ${({ theme }) => css`
    align-items: center;
    padding: ${theme.spacing[2]};
    height: 100%;
    background-color: ${theme.backgroundColor.secondary};
    border-top-right-radius: ${theme.borderRadius.full};
    border-bottom-right-radius: ${theme.borderRadius.full};
    cursor: pointer;

    &[data-is-open='true'] {
      background-color: ${theme.backgroundColor.senary};
    }
  `};
`;

const AddLabelContainer = styled(Stack)`
  ${({ theme }) => css`
    ${createFontStyles('caption-1')};
    gap: ${theme.spacing[2]};
    align-items: center;
    padding: ${theme.spacing[2]} ${theme.spacing[3]};
    background-color: ${theme.backgroundColor.secondary};
    border-radius: ${theme.borderRadius.full};
    white-space: nowrap;
    cursor: pointer;

    &[data-is-open='true'] {
      background-color: ${theme.backgroundColor.senary};
    }
  `};
`;

export default FraudLabel;
