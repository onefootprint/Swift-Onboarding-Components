import { useTranslation } from '@onefootprint/hooks';
import type { TextAreaProps } from '@onefootprint/ui';
import { LinkButton, Stack, TextArea, Typography } from '@onefootprint/ui';
import React, { useState } from 'react';

import Option from './components/option';

const optionsDummyData = [
  {
    value: 'option-1',
    body: 'Minim cupidatat aute id quis ex.',
  },
  {
    value: 'option-2',
    body: 'Excepteur laboris Lorem occaecat nulla reprehenderit eu proident aliqua reprehenderit ea nostrud et laboris eu.',
  },
  {
    value: 'option-3',
    body: 'Ad labore occaecat ullamco ipsum occaecat enim commodo labore. Aliquip Lorem consequat nisi laboris ea culpa. Ullamco nulla dolor id consectetur sint. Aute nulla minim velit eu.',
  },
];

type FrequentNotesTextAreaProps = {
  textAreaProps: TextAreaProps;
};

const FrequentNotesTextArea = ({
  textAreaProps: {
    label,
    placeholder,
    hasError,
    hint,
    onChange,
    onChangeText,
    ...props
  },
}: FrequentNotesTextAreaProps) => {
  const { t } = useTranslation('components.frequent-notes');
  const [isEdit, setIsEdit] = useState<boolean>(false);
  const textAreaRef = React.useRef<HTMLTextAreaElement>(null);
  const handleOptionClick = (body: string) => {
    // clicking in option should not trigger onChange event
    if (onChangeText) {
      onChangeText(body);
    }
    if (textAreaRef.current) {
      textAreaRef.current.focus();
    }
  };

  return (
    <Stack direction="column" gap={5}>
      <TextArea
        label={label}
        placeholder={placeholder}
        hasError={hasError}
        hint={hint}
        onChange={onChange}
        onChangeText={onChangeText}
        ref={textAreaRef}
        {...props}
      />
      <Stack direction="column" gap={3}>
        <Stack direction="row" justify="space-between" align="center">
          <Typography variant="label-3">{t('title')}</Typography>
          <LinkButton onClick={() => setIsEdit(!isEdit)} size="compact">
            {t(`${isEdit ? 'done' : 'edit'}`)}
          </LinkButton>
        </Stack>
        {optionsDummyData.map(option => (
          <Option
            key={option.value}
            value={option.value}
            onClick={handleOptionClick}
            isEdit={isEdit}
          >
            {option.body}
          </Option>
        ))}
      </Stack>
    </Stack>
  );
};

export default FrequentNotesTextArea;
