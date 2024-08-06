import { Box, createFontStyles } from '@onefootprint/ui';
import styled, { css } from 'styled-components';

type TagProps = {
  text: string;
};

const Tag = ({ text }: TagProps) => {
  return (
    <Container>
      <PoundSymbol>#</PoundSymbol>
      <Content>{text}</Content>
    </Container>
  );
};

const Container = styled(Box)`
  ${({ theme }) => css`
    display: flex;
    align-items: center;
    gap: ${theme.spacing[2]};
    padding: ${theme.spacing[1]} ${theme.spacing[2]};
  `}
`;

const PoundSymbol = styled(Box)`
  ${({ theme }) => css`
    ${createFontStyles('snippet-2')};
    color: ${theme.color.tertiary};
  `}
`;

const Content = styled(Box)`
  ${({ theme }) => css`
    ${createFontStyles('snippet-2')};
    color: ${theme.color.primary};
  `}
`;

export default Tag;
