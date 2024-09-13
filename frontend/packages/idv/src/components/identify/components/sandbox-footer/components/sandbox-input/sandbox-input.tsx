import { IcoCheck24, IcoClose24, IcoCopy24, IcoInfo16, IcoPencil24 } from '@onefootprint/icons';
import { Box, CopyButton, Stack, Text, TextInput, Tooltip } from '@onefootprint/ui';
import { useState } from 'react';
import styled, { css } from 'styled-components';

import InlineButton from './components/inline-button';

type SandboxInputProps = {
  label: string;
  placeholder: string;
  setValue: (v: string) => void;
  value: string;
  texts: {
    copy: string;
    copyConfirmation: string;
    description: string;
    edit: string;
    reset: string;
    save: string;
  };
};

const SandboxInput = ({ label, placeholder, setValue, texts, value }: SandboxInputProps) => {
  const [innerValue, setInnerValue] = useState(() => value || '');
  const [isInputLocked, setIsInputLocked] = useState(true);
  const handleSaveOrEdit = () => setIsInputLocked(prev => !prev);

  const handleReset = () => {
    handleSaveOrEdit();
    setInnerValue(value);
  };

  const handleSave = () => {
    handleSaveOrEdit();
    setValue(innerValue);
  };

  return (
    <Stack direction="column" gap={2}>
      <InputTitle>
        <Text variant="label-2">{label}</Text>
        <Tooltip text={texts.description} alignment="start" position="top">
          <IcoInfo16 testID="infoIcon" />
        </Tooltip>
      </InputTitle>
      <InputControls>
        <Box width="100%">
          <TextInput
            disabled={isInputLocked}
            hasError={false}
            maxLength={13}
            onChangeText={setInnerValue}
            placeholder={placeholder}
            required
            sx={{ color: isInputLocked ? 'quaternary' : 'primary' }}
            value={innerValue}
          />
        </Box>
        {isInputLocked ? (
          <InlineButtonsLayout>
            <CopyButton
              ariaLabel={texts.copy}
              contentToCopy={value}
              tooltip={{
                position: 'top',
                text: texts.copy,
                textConfirmation: texts.copyConfirmation,
              }}
            >
              <InlineButton icon={IcoCopy24} />
            </CopyButton>
            <InlineButton
              ariaLabel={texts.edit}
              icon={IcoPencil24}
              onClick={handleSaveOrEdit}
              tooltipText={texts.edit}
            />
          </InlineButtonsLayout>
        ) : (
          <InlineButtonsLayout>
            <InlineButton
              ariaLabel={texts.save}
              disabled={false}
              icon={IcoCheck24}
              onClick={handleSave}
              tooltipText={texts.save}
            />
            <InlineButton ariaLabel={texts.reset} icon={IcoClose24} onClick={handleReset} tooltipText={texts.reset} />
          </InlineButtonsLayout>
        )}
      </InputControls>
    </Stack>
  );
};

const InlineButtonsLayout = styled.div`
  ${({ theme }) => css`
    display: flex;
    align-items: center;
    justify-content: flex-start;
    margin-left: ${theme.spacing[3]};
  `}
`;

const InputControls = styled.div`
  display: flex;
  align-items: center;
`;

const InputTitle = styled.div`
  ${({ theme }) => css`
    display: flex;
    align-items: center;
    gap: ${theme.spacing[2]};
    margin-bottom: ${theme.spacing[2]};
  `}
`;

export default SandboxInput;
