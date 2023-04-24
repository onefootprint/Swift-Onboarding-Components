import * as React from 'react';
import { StyleSheet, Text } from 'react-native';
import styled from 'styled-components/native';

export type TypographyProps = {
  children: string;
};

const Typography = ({ children }: TypographyProps) => {
  return <Text style={styles.text}>{children}</Text>;
};

const styles = StyleSheet.create({
  text: {
    color: 'red',
  },
});

export default Typography;
