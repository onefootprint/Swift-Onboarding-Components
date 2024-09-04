import { IcoCloseSmall16 } from '@onefootprint/icons';
import { Stack, Text, TextInput, createFontStyles } from '@onefootprint/ui';
import { useRef, useState } from 'react';
import styled, { css } from 'styled-components';
import { useOnClickOutside } from 'usehooks-ts';

type NewTagProps = {
  onRemove: () => void;
  onAdd: (text: string) => void;
};

const NewTag = ({ onRemove, onAdd }: NewTagProps) => {
  const [newTagText, setNewTagText] = useState('');
  const ref = useRef(null);

  const handleChange = (newText: string) => {
    setNewTagText(newText);
  };

  const handleKeyUp = (e: {
    key: string;
    preventDefault: () => void;
  }) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleClickOutside();
    }
  };

  const handleClickOutside = () => {
    if (newTagText) {
      onAdd?.(newTagText);
    } else {
      onRemove();
    }
  };

  useOnClickOutside(ref, handleClickOutside);

  return (
    <Container ref={ref}>
      <TagContainer>
        <Text variant="label-4" color="tertiary">
          #
        </Text>
        <StyledInput
          autoFocus
          size="compact"
          placeholder=""
          value={newTagText}
          onChangeText={handleChange}
          onKeyUp={handleKeyUp}
        />
      </TagContainer>
      <TriggerContainer onClick={onRemove}>
        <IcoCloseSmall16 />
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

const StyledInput = styled(TextInput)`
  ${({ theme }) => css`
    width: fit-content;
    block-size: fit-content;
    padding: ${theme.spacing[0]};
    border: none;
    background-color: ${theme.backgroundColor.secondary} !important;
    box-shadow: none !important;

    &[data-size="compact"] {
      height: fit-content;
      width: 100px;
      ${createFontStyles('label-4')};
    }
  `};
`;

const TriggerContainer = styled.button`
  ${({ theme }) => css`
    display: flex;
    align-items: center;
    padding: ${theme.spacing[2]} ${theme.spacing[2]} ${theme.spacing[2]} ${theme.spacing[1]};
    cursor: pointer;
    border: none;
    background-color: ${theme.backgroundColor.transparent};
    border-top-right-radius: ${theme.borderRadius.full};
    border-bottom-right-radius: ${theme.borderRadius.full};

    &:hover {
      background-color: ${theme.backgroundColor.senary};
    }
  `};
`;

export default NewTag;
