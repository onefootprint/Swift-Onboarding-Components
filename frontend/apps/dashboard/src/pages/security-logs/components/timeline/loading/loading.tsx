import { IcoDotSmall16 } from '@onefootprint/icons';
import { Box, Grid, Shimmer, Stack } from '@onefootprint/ui';
import { useTranslation } from 'react-i18next';
import styled, { css } from 'styled-components';

const HEADER_HEIGHT = '32px';

const Loading = () => {
  const { t } = useTranslation('security-logs');
  return (
    <Stack direction="column" gap={5} aria-label={t('loading-aria')}>
      {[1, 2].map(i => (
        <Grid.Container
          key={i}
          position="relative"
          height="auto"
          columns={['146px 24px 1fr']}
          rows={[`${HEADER_HEIGHT} auto`]}
          alignItems="start"
          justifyContent="start"
          templateAreas={['time icon content', 'empty line content']}
        >
          <Grid.Item grid="time" direction="row" gap={5} height={HEADER_HEIGHT} display="flex" alignItems="center">
            <Shimmer height="20px" width="59px" />
            <Shimmer height="20px" width="65px" />
          </Grid.Item>
          <Line gridArea="line" style={{ height: 'calc(100% + 20px)' }} />
          <Grid.Item
            align="center"
            justify="center"
            backgroundColor="primary"
            minHeight={HEADER_HEIGHT}
            gridArea="icon"
            display="flex"
            alignItems="center"
          >
            <StyledDot />
          </Grid.Item>
          <Grid.Container
            style={{ gridArea: 'content' }}
            templateAreas={['header', 'body']}
            columns={['1fr']}
            rows={['auto', 'auto']}
            marginLeft={2}
            marginTop={2}
            paddingTop={1}
            flexDirection="column"
            gap={3}
          >
            <Grid.Item gridArea="header" align="flex-start" justify="start" display="flex" alignItems="flex-start">
              <Shimmer height="20px" width="624px" />
            </Grid.Item>
            <Box height="auto" tag="span" marginTop={3}>
              <Shimmer height="80px" width="960px" />
            </Box>
          </Grid.Container>
        </Grid.Container>
      ))}
    </Stack>
  );
};

// we need to override the fill color because IcoDotSmall16 uses text colors
// rather than our DS background colors for the dot
const StyledDot = styled(IcoDotSmall16)`
  ${({ theme }) => css`
    path {
      fill: ${theme.backgroundColor.senary};
    }
  `}
`;

const Line = styled(Grid.Item)`
  ${({ theme }) => css`
    position: absolute;
    top: 0;
    bottom: 0;
    left: 50%;
    transform: translateX(-50%);
    width: 1px;
    height: 100%;
    background-color: ${theme.borderColor.primary};
  `}
`;

export default Loading;
