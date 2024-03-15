export enum AuthMethodKind {
  phone = 'phone',
  email = 'email',
  passkey = 'passkey',
}

export enum UpdateAuthMethodActionKind {
  replace = 'replace',
  addPrimary = 'add_primary',
}
