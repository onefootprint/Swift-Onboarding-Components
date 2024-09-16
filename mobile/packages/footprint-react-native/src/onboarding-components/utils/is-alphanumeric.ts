const isAlphanumeric = (sandboxId: string): boolean => /^[A-Za-z0-9]+$/.test(sandboxId);

export default isAlphanumeric;
