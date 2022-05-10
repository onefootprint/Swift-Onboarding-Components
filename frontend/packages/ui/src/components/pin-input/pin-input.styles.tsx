import styled from 'styled';

export const Container = styled.div``;

export const PinContainer = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing[3]}px;

  input {
    height: 44px;
    padding: 0;
    text-align: center;
    width: 40px;
  }
`;
