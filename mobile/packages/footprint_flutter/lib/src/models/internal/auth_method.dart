enum AuthMethodKind {
  phone,
  email,
  passkey,
}

enum UpdateAuthMethodActionKind {
  replace("replace"),
  addPrimary("add_primary");

  final String val;
  const UpdateAuthMethodActionKind(this.val);

  String get name => val;
}
