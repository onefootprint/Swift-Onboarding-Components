import styled, { css } from 'styled-components';
import { Box } from '../../..';

type InnerContainerLayoutProps = {
  children: React.ReactNode;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

const InnerContainerLayout = ({ children, open }: InnerContainerLayoutProps) => {
  return <Container open={open}>{children}</Container>;
};

const Container = styled(Box)<{ open: boolean }>`
${({ open, theme }) => css` 
    display: grid;
    grid-template-areas: "drawer content";
    grid-template-columns: ${open ? '480px 1fr' : '1px 1fr'};
    transition: grid-template-columns 0.2s ease-in-out;
    background-color: ${theme.backgroundColor.secondary};
    height: 100%;
`}
`;

export default InnerContainerLayout;
