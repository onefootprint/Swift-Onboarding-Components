import useEntityId from '@/entity/hooks/use-entity-id';
import {
  IcoCheckSmall16,
  IcoChevronDown16,
  IcoFlag16,
  IcoInfo16,
  IcoPlusSmall16,
  IcoTrash16,
} from '@onefootprint/icons';
import { EntityLabel } from '@onefootprint/types';
import { Dropdown, Stack, Tooltip, createFontStyles } from '@onefootprint/ui';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import useLabel from 'src/hooks/use-label';
import styled, { css } from 'styled-components';
import useEditLabel from './hooks/use-edit-label';
import useLabelText from './hooks/use-label-text';

const FraudLabel = () => {
  const { t } = useTranslation('entity-details', { keyPrefix: 'header.fraud-label' });
  const labelT = useLabelText();
  const entityId = useEntityId();
  const { data: label, isLoading, error } = useLabel(entityId);
  const [isOpen, setIsOpen] = useState(false);
  const editLabelMutation = useEditLabel();

  const toggleDropdown = () => {
    setIsOpen(prev => !prev);
  };

  const handleEditLabel = (label: EntityLabel | null) => {
    editLabelMutation.mutate(
      { id: entityId, kind: label },
      {
        onSuccess: () => {
          setIsOpen(false);
        },
      },
    );
  };

  if (error || isLoading) return null;

  return (
    <Dropdown.Root open={isOpen} onOpenChange={toggleDropdown}>
      {label ? (
        <LabelContainer>
          <Main>
            <IcoFlag16 />
            {labelT(label)}
            <Tooltip text={t('tooltip')}>
              <IcoInfo16 />
            </Tooltip>
          </Main>
          <ChevronContainer aria-label={t('aria-label')}>
            <IcoChevronDown16 />
          </ChevronContainer>
        </LabelContainer>
      ) : (
        <NoLabelContainer aria-label={t('aria-label')}>
          <Main>
            <IcoPlusSmall16 />
            {t('add-label')}
            <Tooltip text={t('tooltip')}>
              <IcoInfo16 />
            </Tooltip>
          </Main>
        </NoLabelContainer>
      )}
      <Dropdown.Content align={label ? 'end' : 'start'} sideOffset={4} asChild>
        <Content>
          <Dropdown.Group>
            {Object.values(EntityLabel).map(labelOption => (
              <StyledItem key={labelOption} onClick={() => handleEditLabel(labelOption)}>
                {labelT(labelOption)}
                {labelOption === label && <IcoCheckSmall16 />}
              </StyledItem>
            ))}
          </Dropdown.Group>
          {label && (
            <>
              <Dropdown.Separator />
              <Dropdown.Group>
                <StyledItem onClick={() => handleEditLabel(null)} data-is-remove={true}>
                  <IcoTrash16 color="error" />
                  {t('labels.remove')}
                </StyledItem>
              </Dropdown.Group>
            </>
          )}
        </Content>
      </Dropdown.Content>
    </Dropdown.Root>
  );
};

const LabelContainer = styled(Stack)`
  ${({ theme }) => css`
    height: ${theme.spacing[7]};
    align-items: center;
    gap: ${theme.spacing[2]};
    background-color: ${theme.backgroundColor.secondary};
    border-radius: ${theme.borderRadius.full};
    padding-left: ${theme.spacing[3]};
  `};
`;

const NoLabelContainer = styled(Dropdown.Trigger)`
  ${({ theme }) => css`
    height: ${theme.spacing[7]};
    align-items: center;
    gap: ${theme.spacing[2]};
    background-color: ${theme.backgroundColor.secondary};
    border-radius: ${theme.borderRadius.full};
    padding: 0 ${theme.spacing[2]};
  `};
`;

const Main = styled(Stack)`
  ${({ theme }) => css`
    ${createFontStyles('caption-1')};
    white-space: nowrap;
    align-items: center;
    gap: ${theme.spacing[2]};
  `}
`;

const ChevronContainer = styled(Dropdown.Trigger)`
  ${({ theme }) => css`
    height: ${theme.spacing[7]};
    width: ${theme.spacing[6]};
    padding-left: ${theme.spacing[2]};
    display: flex;
    align-items: center;
    justify-content: flex-start;
    border-radius: 0 ${theme.borderRadius.full} ${theme.borderRadius.full} 0;
    position: relative;

    &:before {
      content: '';
      width: 1px;
      height: ${theme.spacing[4]};
      background-color: ${theme.borderColor.tertiary};
      position: absolute;
      top: 50%;
      left: 0;
      transform: translate(-50%, -50%);
    }
  `}
`;

const Content = styled(Stack)`
  ${({ theme }) => css`
    width: 186px;
    flex-direction: column;
    padding: 0;
    background-color: ${theme.backgroundColor.primary};
    border: ${theme.borderWidth[1]} solid ${theme.borderColor.tertiary};
    border-radius: ${theme.borderRadius.default};
  `};
`;

const StyledItem = styled(Dropdown.Item)`
  ${({ theme }) => css`
    display: flex;
    align-items: center;
    justify-content: space-between;
    cursor: pointer;
    
    &[data-is-remove='true'] {
      color: ${theme.color.error};
      justify-content: start;
      gap: ${theme.spacing[2]};
    }
  `};
`;

export default FraudLabel;
