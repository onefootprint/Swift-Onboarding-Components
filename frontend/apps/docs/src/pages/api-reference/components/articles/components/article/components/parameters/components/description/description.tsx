import styled, { css } from '@onefootprint/styled';
import { createFontStyles, Typography } from '@onefootprint/ui';
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
        const descriptionWords = description.split(' ');

        return descriptionWords.map(word => (
          <Typography
            variant="body-4"
            key={_.uniqueId()}
            as="span"
            sx={{ display: 'inline-block', marginRight: 2 }}
          >
            {word}
          </Typography>
        ));
      }
      return <CodeStyle key={_.uniqueId()}>{description}</CodeStyle>;
    });
  };
  return <Container>{renderDescription()}</Container>;
};

const Container = styled.div`
  ${({ theme }) => css`
    ${createFontStyles('body-4')}
    display: inline;
    flex-direction: row;
    flex-wrap: wrap;
    align-items: center;
    justify-content: flex-start;
    color: ${theme.color.secondary};
  `}
`;

const CodeStyle = styled.code`
  ${({ theme }) => css`
    ${createFontStyles('snippet-2', 'code')};
    background-color: ${theme.backgroundColor.secondary};
    padding: 0 ${theme.spacing[2]};
    border-radius: ${theme.borderRadius.compact};
  `}
`;

export default Description;
