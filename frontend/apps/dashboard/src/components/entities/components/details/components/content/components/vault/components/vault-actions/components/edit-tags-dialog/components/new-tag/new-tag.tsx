import { IcoCheckSmall16, IcoCloseSmall16 } from '@onefootprint/icons';
import { Stack, Text, createFontStyles } from '@onefootprint/ui';
import { useEffect, useRef, useState } from 'react';
import styled, { css } from 'styled-components';

type NewTagProps = {
  onConfirm: (value: string) => void;
  onCancel: () => void;
};

const NewTag = ({ onConfirm, onCancel }: NewTagProps) => {
  const [value, setValue] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.style.width = '0';
      const width = inputRef.current.scrollWidth + 1;
      inputRef.current.style.width = `${Math.max(10, width)}px`;
    }
  }, [value]);

  const handleConfirm = () => {
    if (value) {
      onConfirm(value);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setValue(e.target.value);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === 'Escape') {
      e.stopPropagation();
      e.preventDefault();

      if (e.key === 'Enter') {
        if (value.trim()) {
          onConfirm(value);
        }
      }
      if (e.key === 'Escape') {
        onCancel();
      }
    }
  };

  return (
    <Stack backgroundColor="secondary" borderRadius="sm" height="28px">
      <Stack gap={1} paddingInline={3} center>
        <Text variant="label-3" color="tertiary">
          #
        </Text>
        <Input ref={inputRef} type="text" value={value} onChange={handleChange} onKeyDown={handleKeyDown} autoFocus />
      </Stack>
      <ConfirmButton type="button" onClick={handleConfirm} aria-label="Confirm new tag">
        <IcoCheckSmall16 />
      </ConfirmButton>
      <CancelButton type="button" onClick={onCancel} aria-label="Cancel new tag">
        <IcoCloseSmall16 />
      </CancelButton>
    </Stack>
  );
};

const Input = styled.input`
  ${({ theme }) => css`
    ${createFontStyles('label-3')};
    background: transparent;
    border: none;
    color: ${theme.color.primary};
    color: inherit;
    max-width: 200px;
    min-width: 15px;
    outline: none;
    padding: 0 ${theme.spacing[2]};
  `};
`;

const Button = styled.button`
  ${({ theme }) => css`
    align-items: center;
    background-color: transparent;
    border: none;
    cursor: pointer;
    display: flex;
    height: 28px;
    justify-content: center;
    margin: 0;
    padding: 0;
    width: 28px;

    &:hover {
      background-color: ${theme.backgroundColor.senary};
    }
  `};
`;

const ConfirmButton = styled(Button)`
  ${({ theme }) => css`
    border-left: 1px solid ${theme.borderColor.tertiary};
  `};
`;

const CancelButton = styled(Button)`
  ${({ theme }) => css`
    border-bottom-right-radius: ${theme.borderRadius.sm};
    border-top-right-radius: ${theme.borderRadius.sm};
  `};
`;

export default NewTag;
