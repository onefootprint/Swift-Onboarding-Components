import { IcoCheck16, IcoClock16, IcoRefresh16, IcoUpload16 } from '@onefootprint/icons';
import { Stack, Text, createFontStyles } from '@onefootprint/ui';
import Image from 'next/image';
import { useState } from 'react';
import styled, { css } from 'styled-components';

type ItemProps = {
  title: string;
  srcs: string[];
  status: 'success' | 'error' | 'pending';
  attempts: number;
  source: 'desktop' | 'mobile';
  when: string;
};

const Upload = ({ title, srcs, status, attempts, source, when }: ItemProps) => {
  // biome-ignore lint/correctness/noUnusedVariables: <explanation>
  const [front, cover] = srcs;
  // biome-ignore lint/correctness/noUnusedVariables: <explanation>
  const [img, setImage] = useState(front);

  return (
    <Container>
      <Header>
        <Text variant="label-3">{title}</Text>
      </Header>
      <Images>
        <Image src={img} width={318} height={360} alt={title} />
      </Images>
      <Footer>
        <Stack gap={3} width="100%">
          <Stack gap={3} flex={1}>
            <IcoCheck16 color="tertiary" />
            <div>{status}</div>
          </Stack>
          <Stack gap={3} flex={1}>
            <IcoRefresh16 color="tertiary" />
            <div>{attempts} attempt</div>
          </Stack>
        </Stack>
        <Stack gap={3} width="100%">
          <Stack gap={3} flex={1}>
            <IcoUpload16 color="tertiary" />
            <div>From {source}</div>
          </Stack>
          <Stack gap={3} flex={1}>
            <IcoClock16 color="tertiary" />
            <div>{when}</div>
          </Stack>
        </Stack>
      </Footer>
    </Container>
  );
};

const Container = styled.div`
  ${({ theme }) => css`
    background-color: ${theme.backgroundColor.secondary};
    border-radius: ${theme.borderRadius.default};
    border: 1px solid ${theme.borderColor.tertiary};
    width: 320px;
  `}
`;

const Header = styled.header`
  ${({ theme }) => css`
    padding: ${theme.spacing[3]} ${theme.spacing[5]};
  `}
`;

const Images = styled.div``;

const Footer = styled.footer`
  ${({ theme }) => css`
    ${createFontStyles('body-3')};
    color: ${theme.color.tertiary};
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    gap: ${theme.spacing[3]};
    height: 72px;
    padding: ${theme.spacing[4]} ${theme.spacing[5]};
  `}
`;

export default Upload;
