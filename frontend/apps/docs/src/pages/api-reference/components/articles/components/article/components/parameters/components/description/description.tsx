import styled, { css } from '@onefootprint/styled';
import { createFontStyles } from '@onefootprint/ui';
import _ from 'lodash';
import React from 'react';

type ParameterProps = {
  children: string;
};
const Description = ({ children }: ParameterProps) => {
  const renderDescription = () => {
    const descriptionArray = children.split('`');
    return descriptionArray.map((description, index) => {
      if (index % 2 === 0) {
        return <RegularText key={_.uniqueId()}>{description}</RegularText>;
      }
      return <CodeStyle key={_.uniqueId()}>{description}</CodeStyle>;
    });
  };
  return <Container>{renderDescription()}</Container>;
};
const RegularText = styled.p`
  ${({ theme }) => css`
    ${createFontStyles('body-3')}
    color: ${theme.color.tertiary};
  `}
`;

const Container = styled.div`
  ${({ theme }) => css`
    display: flex;
    flex-direction: row;
    gap: ${theme.spacing[2]};
    flex-wrap: wrap;
    align-items: center;
    justify-content: flex-start;
  `}
`;

const CodeStyle = styled.code`
  ${({ theme }) => css`
    ${createFontStyles('snippet-2', 'code')};
    color: ${theme.color.tertiary};
    background-color: ${theme.backgroundColor.secondary};
    padding: 0 ${theme.spacing[2]};
    border-radius: ${theme.borderRadius.compact};
  `}
`;

export default Description;
