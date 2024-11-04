import styled, { css } from 'styled-components';

type PdfThumbnailProps = {
  src: string;
};

const PdfThumbnail = ({ src }: PdfThumbnailProps) => (
  <PdfContainer>
    <iframe title="pdf" src={src} width="100%" height="100%" />
  </PdfContainer>
);

const PdfContainer = styled.div`
  ${({ theme }) => css`
    width: 100vw;
    height: calc(100vh - 48px);
    margin: calc(-1 * ${theme.spacing[7]});
    margin-bottom: calc(-1 * ${theme.spacing[5]});
  `};
`;

export default PdfThumbnail;
