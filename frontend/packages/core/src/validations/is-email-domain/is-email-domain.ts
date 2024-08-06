const isEmailDomain = (value: string) => /^[a-z0-9-]+(\.[a-z0-9-]+)*\.[a-z]{2,}$/.test(value);

export default isEmailDomain;
