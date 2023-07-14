import { FootprintAppearance } from '@onefootprint/footprint-components-js';

import createAppearanceRules from './utils/create-appearance-rules';
import createAppearanceVariables from './utils/create-appearance-variables';
import createStyle from './utils/create-style';

const applyAppearance = (appearance?: FootprintAppearance) => {
  const { fontSrc, rules, variables } = appearance || {};
  if (fontSrc) {
    createStyle('footprint-custom-fonts', `@import url('${fontSrc}');`);
  }

  if (variables) {
    const css = createAppearanceVariables(variables);
    if (css) {
      const styles = `
          :root {
            ${css}
          }
        `;
      createStyle('footprint-variables', styles);
    }
  }

  if (rules) {
    const css = createAppearanceRules(rules);
    if (!css) return;
    createStyle('footprint-rules', css);
  }
};

export default applyAppearance;
