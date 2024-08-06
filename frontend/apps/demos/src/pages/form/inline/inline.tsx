import styled, { css } from 'styled-components';

import useFootprintForm from '../hooks/use-footprint-form';

const Form = () => {
  useFootprintForm({ containerId: 'my-form', variant: 'inline' });
  return <Container id="my-form" />;
};

const Container = styled.div`
  ${({ theme }) => css`
    border-radius: ${theme.borderRadius.default};
    padding: ${theme.spacing[7]};
    border: 1px solid ${theme.borderColor.primary};
    width: 500px;
    min-width: 500px;
    height: 700px;
    min-height: 500px;
    display: flex;
    justify-content: center;
    align-items: center;
  `}
`;

export default Form;
