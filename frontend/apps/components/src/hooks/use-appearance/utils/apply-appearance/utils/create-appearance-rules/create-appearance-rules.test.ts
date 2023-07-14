import createAppearanceRules, {
  convertObjectToCSS,
  createStylesFromRules,
  filterNonWhitelistRules,
  getSelector,
} from './create-appearance-rules';

describe('createAppearanceRules', () => {
  describe('createAppearanceRules', () => {
    it('should generate the right styles', () => {
      expect(
        createAppearanceRules({
          button: { background: 'red' },
          'button:hover': { background: 'green' },
        }),
      ).toEqual(
        '.fp-button{background:red;} .fp-button:hover{background:green;}',
      );
    });
  });

  describe('filterNonWhitelistRules', () => {
    it('should filter the non whitelist rules', () => {
      const rules = {
        button: {
          background: 'red',
        },
        'button:hover': {
          background: 'blue',
        },
        lorem: {
          background: 'green',
        },
      };
      const whitelist = ['button', 'button:hover'];
      const result = filterNonWhitelistRules(rules, whitelist);

      expect(result).toEqual({
        button: {
          background: 'red',
        },
        'button:hover': {
          background: 'blue',
        },
      });
    });
  });

  describe('getSelector', () => {
    it('should return the right selector', () => {
      expect(
        getSelector('button', {
          button: '.fp-button',
        }),
      ).toEqual('.fp-button');
      expect(
        getSelector('button:hover', {
          button: '.fp-button',
        }),
      ).toEqual('.fp-button:hover');
      expect(
        getSelector('button:after', {
          button: '.fp-button',
        }),
      ).toEqual('.fp-button:after');
    });
  });

  describe('convertObjectToCSS', () => {
    it('should transform an object to css', () => {
      expect(
        convertObjectToCSS({
          width: '1px',
          height: '1px',
          backgroundColor: 'red',
          transform: 'rotateZ(45deg)',
        }),
      ).toEqual(
        'width:1px;height:1px;background-color:red;transform:rotateZ(45deg);',
      );
      expect(
        convertObjectToCSS({
          width: '100%',
          content: 'lorem',
        }),
      ).toEqual('width:100%;content:"lorem";');
    });
  });

  describe('createStylesFromRules', () => {
    it('should transform an object into styles', () => {
      const rules = {
        button: {
          backgroundColor: 'red',
        },
        'button:hover': {
          textDecoration: 'underline',
        },
      };
      const result = createStylesFromRules(rules);
      expect(result).toEqual(
        `.fp-button{background-color:red;} .fp-button:hover{text-decoration:underline;}`,
      );
    });
  });
});
