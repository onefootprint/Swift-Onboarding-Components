import styled, { css } from '@onefootprint/styled';
import React from 'react';

const AddressDropdownFooter = () => (
  <Container>
    <img
      alt="Powered by Google"
      height="12px"
      src="data:image/png;base64,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"
      width="100px"
    />
  </Container>
);

const Container = styled.li`
  ${({ theme }) => {
    const { dropdown } = theme.components;

    return css`
      align-items: center;
      background: ${dropdown.footer.bg};
      border-radius: 0 0 ${dropdown.borderRadius} ${dropdown.borderRadius};
      border-top: ${dropdown.borderWidth} solid ${dropdown.borderColor};
      display: flex;
      justify-content: center;
      margin-top: ${theme.spacing[3]};
      padding: ${theme.spacing[4]} 0;
    `;
  }}
`;

export default AddressDropdownFooter;
