import footprint, { FootprintComponentKind } from '@onefootprint/footprint-js';
import { DEMO_RENDER_AUTH_TOKEN } from 'src/config/constants';
import styled, { css } from 'styled-components';
import { useEffectOnce } from 'usehooks-ts';

const RenderJs = () => {
  const launchRender = () => {
    const component = footprint.init({
      kind: FootprintComponentKind.Render,
      id: 'id.email',
      authToken: DEMO_RENDER_AUTH_TOKEN ?? '',
      containerId: 'my-render',
      variant: 'inline',
    });

    component.render();
    return component;
  };

  useEffectOnce(() => {
    const component = launchRender();

    return () => {
      component.destroy();
    };
  });

  return <Container id="my-render" />;
};

const Container = styled.div`
  ${({ theme }) => css`
    border-radius: ${theme.borderRadius.default};
    padding: ${theme.spacing[7]};
    border: 1px solid ${theme.borderColor.primary};
    width: 500px;
    min-width: 500px;
    height: 500px;
    min-height: 500px;
    display: flex;
    justify-content: center;
    align-items: center;
  `}
`;

export default RenderJs;
