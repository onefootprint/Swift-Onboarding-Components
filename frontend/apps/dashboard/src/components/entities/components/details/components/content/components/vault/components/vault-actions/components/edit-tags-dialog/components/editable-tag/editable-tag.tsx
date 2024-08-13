import { IcoCloseSmall16, IcoPlusSmall16 } from '@onefootprint/icons';
import { Stack, Text, TextInput, createFontStyles } from '@onefootprint/ui';
import { useState } from 'react';
import styled, { css } from 'styled-components';
import { EditableTagKind } from '../../types';

type EditableTagProps = {
  text: string;
  tagKind: EditableTagKind;
  onClick: () => void;
  onEdit?: (text: string) => void;
};

const EditableTag = ({ text, tagKind, onClick, onEdit }: EditableTagProps) => {
  const [newTagText, setNewTagText] = useState('');

  const handleChange = (newText: string) => {
    setNewTagText(newText);
    onEdit?.(newText);
  };

  return (
    <Container>
      <TagContainer>
        <Text variant="label-2" color="tertiary">
          #
        </Text>
        {tagKind === EditableTagKind.new && onEdit ? (
          <InputContainer>
            <TextInput
              size="compact"
              width="fit-content"
              placeholder=""
              value={newTagText}
              onChangeText={handleChange}
            />
          </InputContainer>
        ) : (
          <Text variant="label-2">{text}</Text>
        )}
      </TagContainer>
      <TriggerContainer onClick={onClick}>
        {tagKind === EditableTagKind.inactive ? <IcoPlusSmall16 /> : <IcoCloseSmall16 />}
      </TriggerContainer>
    </Container>
  );
};

const Container = styled(Stack)`
  ${({ theme }) => css`
    display: flex;
    align-items: center;
    background-color: ${theme.backgroundColor.secondary};
    border-radius: ${theme.borderRadius.full};
  `};
`;

const TagContainer = styled(Stack)`
  ${({ theme }) => css`
    ${createFontStyles('caption-1')};
    align-items: center;
    gap: ${theme.spacing[2]};
    padding: ${theme.spacing[1]} ${theme.spacing[3]};
    border-right: ${theme.borderWidth[1]} solid ${theme.borderColor.tertiary};
    white-space: nowrap;
  `};
`;

const InputContainer = styled.div`
  > input {
    border: none;
  }
`;

const TriggerContainer = styled.button`
  ${({ theme }) => css`
    display: flex;
    align-items: center;
    padding-right: ${theme.spacing[2]};
    padding-left: ${theme.spacing[1]};
    cursor: pointer;
    border: none;
    background-color: ${theme.backgroundColor.transparent};
  `};
`;

export default EditableTag;
