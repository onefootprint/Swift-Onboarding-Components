import { IcoWarning16 } from '@onefootprint/icons';
import { Text } from '@onefootprint/ui';
import styled, { css } from 'styled-components';

type FormErrorMessageProps = {
  text?: string;
};

const FormErrorMessage = ({ text }: FormErrorMessageProps) => {
  if (!text) {
    return null;
  }

  return (
    <Container>
      <IcoWarning16 color="error" />
      <Text variant="body-3" color="error">
        {text}
      </Text>
    </Container>
  );
};

const Container = styled.div`
  ${({ theme }) => css`
    align-items: center;
    display: flex;
    gap: ${theme.spacing[3]};
  `}
`;

export default FormErrorMessage;
