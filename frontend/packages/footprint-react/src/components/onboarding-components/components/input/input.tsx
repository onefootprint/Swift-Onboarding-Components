/* eslint-disable react/jsx-props-no-spreading */
import { cx } from 'class-variance-authority';
import Cleave from 'cleave.js';
import type React from 'react';
import { useEffect } from 'react';

import { useFormContext } from 'react-hook-form';
import useFieldProps, { type FormInputProps } from '../../hooks/use-field-props';

export type InputProps = React.InputHTMLAttributes<HTMLInputElement>;

const Input = ({ className, id, ...props }: InputProps) => {
  const { register } = useFormContext();
  const fieldProps = useFieldProps() as FormInputProps;
  const { name, className: baseClassName, mask, validations = {}, transforms = {}, ...allProps } = fieldProps;

  useEffect(() => {
    let cleaveInstance: Cleave | null = null;
    if (mask) cleaveInstance = new Cleave(`.${baseClassName}`, mask);
    return () => {
      if (cleaveInstance) cleaveInstance.destroy();
    };
  });

  useEffect(() => {
    // This commits the currently editing text field before submitting the form.
    // There is a conflict with cleave and react hook form that force us doing this
    if (mask) {
      document.addEventListener('keydown', handleEnterKeyPress);
      return () => {
        document.removeEventListener('keydown', handleEnterKeyPress);
      };
    }
  }, [mask]);

  const handleEnterKeyPress = (e: KeyboardEvent) => {
    if (e.key === 'Enter') {
      const currentFocus = document.activeElement;
      (currentFocus as HTMLElement)?.blur?.();
      (currentFocus as HTMLElement)?.focus?.();
    }
  };

  return (
    <input
      {...allProps}
      {...props}
      className={cx('fp-input', baseClassName, className)}
      {...register(name, {
        ...validations,
        ...transforms,
        onBlur: props.onBlur,
        onChange: props.onChange,
      })}
    />
  );
};

export default Input;
