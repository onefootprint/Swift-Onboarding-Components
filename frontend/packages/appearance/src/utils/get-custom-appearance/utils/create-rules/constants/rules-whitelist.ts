const buttons = ['button', 'button:hover', 'button:focus', 'button:active'];
const input = ['input', 'input:hover', 'input:focus', 'input:active'];
const pinInput = ['pinInput', 'pinInput:hover', 'pinInput:focus', 'pinInput:active'];
const label = ['label'];
const hint = ['hint'];
const link = ['link', 'link:hover', 'link:focus'];
const linkButton = ['linkButton', 'linkButton:hover', 'linkButton:focus', 'linkButton:active'];

const whitelist = [...buttons, ...input, ...pinInput, ...label, ...hint, ...link, ...linkButton];

export default whitelist;
