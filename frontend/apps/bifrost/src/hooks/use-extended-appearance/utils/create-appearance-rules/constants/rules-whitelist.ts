const buttons = ['button', 'button:hover', 'button:focus', 'button:active'];
const input = ['input', 'input:hover', 'input:focus', 'input:active'];
const label = ['label'];
const hint = ['hint'];
const link = ['link', 'link:hover', 'link:focus'];
const linkButton = ['linkButton', 'linkButton:hover', 'linkButton:active'];

const whitelist = [
  ...buttons,
  ...input,
  ...label,
  ...hint,
  ...link,
  ...linkButton,
];

export default whitelist;
