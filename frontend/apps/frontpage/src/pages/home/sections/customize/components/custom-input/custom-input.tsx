import { TextInput } from '@onefootprint/ui';
import type React from 'react';
import FloatingCard from '../floating-card';

type CustomInputTypes = {
  title: string;
  type: 'text' | 'number' | 'radio-group';
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  value: string;
  className?: string;
};

const CustomInput = ({ title, type, value, onChange, className }: CustomInputTypes) => {
  const inputId = `input-${title.replace(/\s+/g, '-').toLowerCase()}`;

  const formattedValue = type === 'text' ? `#${value}` : value;

  return (
    <FloatingCard className={className} delay={2}>
      <label htmlFor={inputId} className="text-label-3">
        {title}
      </label>
      <TextInput id={inputId} type={type} onChange={onChange} value={formattedValue} placeholder={title} />
    </FloatingCard>
  );
};

export default CustomInput;
