import { IcoCheckSmall16, IcoTrash16 } from '@onefootprint/icons';
import { EntityLabel } from '@onefootprint/types';
import { Divider, Stack, createFontStyles } from '@onefootprint/ui';
import { useTranslation } from 'react-i18next';
import styled, { css } from 'styled-components';
import useLabelText from '../../hooks/use-label-text';

type LabelDropdownProps = {
  selectedLabel: EntityLabel | null;
  onClick: () => void;
};

const LabelDropdown = ({ selectedLabel, onClick }: LabelDropdownProps) => {
  const { t } = useTranslation('common', { keyPrefix: 'pages.entity.header.fraud-label.labels' });
  const labelT = useLabelText();

  return (
    <Container>
      {Object.values(EntityLabel).map(labelOption => (
        <LabelOption key={labelOption} onClick={onClick}>
          {labelT(labelOption)}
          {labelOption === selectedLabel && <IcoCheckSmall16 />}
        </LabelOption>
      ))}
      {selectedLabel && (
        <>
          <Divider />
          <RemoveOption>
            <IcoTrash16 color="error" />
            {t('remove')}
          </RemoveOption>
        </>
      )}
    </Container>
  );
};

const Container = styled(Stack)`
  ${({ theme }) => css`
    width: 186px;
    flex-direction: column;
    padding: ${theme.spacing[1]};
    background-color: ${theme.backgroundColor.primary};
    border: ${theme.borderWidth[1]} solid ${theme.borderColor.tertiary};
    border-radius: ${theme.borderRadius.default};
  `};
`;

const LabelOption = styled.button`
  ${({ theme }) => css`
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: ${theme.spacing[3]} ${theme.spacing[4]};
    ${createFontStyles('caption-3')};
    cursor: pointer;
    background-color: ${theme.backgroundColor.transparent};
    border: none;
  `};
`;

const RemoveOption = styled.button`
  ${({ theme }) => css`
    display: flex;
    gap: ${theme.spacing[3]};
    align-items: center;
    padding: ${theme.spacing[3]} ${theme.spacing[4]};
    color: ${theme.color.error};
    ${createFontStyles('caption-3')};
    cursor: pointer;
    background-color: ${theme.backgroundColor.transparent};
    border: none;
  `};
`;

export default LabelDropdown;
