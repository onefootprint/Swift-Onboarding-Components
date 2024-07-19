import get from 'lodash/get';
import React, { useId, useMemo } from 'react';
import type { FieldError, FieldErrorsImpl, Merge } from 'react-hook-form';
import { useFormContext } from 'react-hook-form';
import { View, StyleSheet, type ViewProps, ViewStyle } from 'react-native';

import type { FormValues } from '../../types';
import type { ChidrenOrFunction } from '../types/children';
import FieldContext from '../field-context';

type FieldOptions = {
  error: FieldError | Merge<FieldError, FieldErrorsImpl<FormValues>> | undefined;
};

export type FieldProps = {
  name: keyof FormValues;
  children?: ChidrenOrFunction<FieldOptions>;
  style?: ViewStyle;
} & ViewProps;

const Field = ({ name, children, style, ...props }: FieldProps) => {
  const id = useId();
  const contextValues = useMemo(() => ({ name, id }), [name, id]);
  const {
    formState: { errors },
  } = useFormContext();
  const error = get(errors, name);

  const renderChildren = () => {
    if (typeof children === 'function') {
      return children({ error });
    }
    return children;
  };

  return (
    <FieldContext.Provider value={contextValues}>
      <View {...props} style={[styles.container, style]}>
        {renderChildren()}
      </View>
    </FieldContext.Provider>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
});

export default Field;
