import { getTaxIdInputPattern, getTypeOfTaxId } from './ssn-utils';

describe('getTaxIdRegex -> ssn9', () => {
  const ssn9Regex = getTaxIdInputPattern('ssn9');

  it.each([
    /** ITIN Invalid */ { i: '922-89-1234', o: false },
    /** ITIN Valid */ { i: '900-80-1234', o: false },
    /** ITIN Valid */ { i: '912-50-1234', o: false },
    /** ITIN Valid */ { i: '922-88-1234', o: false },
    /** ITIN Valid */ { i: '955-94-1234', o: false },
    /** SSN Invalid */ { i: '000-12-3456', o: false },
    /** SSN Invalid */ { i: '123-00-6789', o: false },
    /** SSN Invalid */ { i: '123-45-0000', o: false },
    /** SSN Invalid */ { i: '666-12-3456', o: false },
    /** SSN Valid */ { i: '123-45-6789', o: true },
    /** SSN Valid */ { i: '123-45-6789', o: true },
    /** SSN Valid */ { i: '223-45-6789', o: true },
    /** SSN Valid */ { i: '234-56-7890', o: true },
    /** SSN Valid */ { i: '345-67-8901', o: true },
    /** SSN Valid */ { i: '456-78-9012', o: true },
    /** SSN Valid */ { i: '567-89-0123', o: true },
    /** SSN Valid */ { i: '678-90-1234', o: true },
    /** SSN Valid */ { i: '789-01-2345', o: true },
    /** SSN Valid */ { i: '801-23-4567', o: true },
    /** SSN Valid */ { i: '823-45-6789', o: true },
  ])('ssn9 %#', ({ i, o }) => {
    expect(ssn9Regex.test(i)).toEqual(o);
  });
});

describe('getTaxIdRegex -> usTaxId', () => {
  const usTaxId = getTaxIdInputPattern('usTaxId');

  it.each([
    /** ITIN Invalid */ { i: '907-66-8901', o: false },
    /** ITIN Invalid */ { i: '922-89-1234', o: false },
    /** ITIN Valid */ { i: '900-50-1234', o: true },
    /** ITIN Valid */ { i: '900-80-1234', o: true },
    /** ITIN Valid */ { i: '901-60-2345', o: true },
    /** ITIN Valid */ { i: '902-70-3456', o: true },
    /** ITIN Valid */ { i: '903-80-4567', o: true },
    /** ITIN Valid */ { i: '904-90-5678', o: true },
    /** ITIN Valid */ { i: '905-94-6789', o: true },
    /** ITIN Valid */ { i: '906-55-7890', o: true },
    /** ITIN Valid */ { i: '908-77-9012', o: true },
    /** ITIN Valid */ { i: '909-88-0123', o: true },
    /** ITIN Valid */ { i: '912-50-1234', o: true },
    /** ITIN Valid */ { i: '922-88-1234', o: true },
    /** ITIN Valid */ { i: '955-94-1234', o: true },
    /** SSN Invalid */ { i: '000-12-3456', o: false },
    /** SSN Invalid */ { i: '123-00-6789', o: false },
    /** SSN Invalid */ { i: '123-45-0000', o: false },
    /** SSN Invalid */ { i: '666-12-3456', o: false },
    /** SSN Valid */ { i: '123-45-6789', o: true },
  ])('usTaxId %#', ({ i, o }) => {
    expect(usTaxId.test(i)).toEqual(o);
  });
});

describe('getTaxIdRegex -> itin', () => {
  const itinRegex = getTaxIdInputPattern('itin');

  it.each([
    /** ITIN Invalid */ { i: '907-66-8901', o: false },
    /** ITIN Invalid */ { i: '922-89-1234', o: false },
    /** ITIN Valid */ { i: '900-50-1234', o: true },
    /** ITIN Valid */ { i: '900-80-1234', o: true },
    /** ITIN Valid */ { i: '901-60-2345', o: true },
    /** ITIN Valid */ { i: '902-70-3456', o: true },
    /** ITIN Valid */ { i: '903-80-4567', o: true },
    /** ITIN Valid */ { i: '904-90-5678', o: true },
    /** ITIN Valid */ { i: '905-94-6789', o: true },
    /** ITIN Valid */ { i: '906-55-7890', o: true },
    /** ITIN Valid */ { i: '908-77-9012', o: true },
    /** ITIN Valid */ { i: '909-88-0123', o: true },
    /** ITIN Valid */ { i: '912-50-1234', o: true },
    /** ITIN Valid */ { i: '922-88-1234', o: true },
    /** ITIN Valid */ { i: '955-94-1234', o: true },
    /** SSN Invalid */ { i: '000-12-3456', o: false },
    /** SSN Invalid */ { i: '123-00-6789', o: false },
    /** SSN Invalid */ { i: '123-45-0000', o: false },
    /** SSN Invalid */ { i: '666-12-3456', o: false },
    /** SSN Valid */ { i: '123-45-6789', o: false },
  ])('usTaxId %#', ({ i, o }) => {
    expect(itinRegex.test(i)).toEqual(o);
  });
});

describe('getTypeOfTaxId', () => {
  it.each([
    /** Invalid inputs */ { kind: 'INPUT', value: '', o: 'INPUT' },
    /** Invalid inputs */ { kind: 'INPUT', value: '000000000', o: 'INPUT' },
    /** ITIN Invalid */ { kind: 'usTaxId', value: '907-66-8901', o: undefined },
    /** ITIN Invalid */ { kind: 'usTaxId', value: '922-89-1234', o: undefined },
    /** ITIN Valid */ { kind: 'usTaxId', value: '900-50-1234', o: 'itin' },
    /** ITIN Valid */ { kind: 'usTaxId', value: '999-99-9999', o: 'itin' },
    /** ITIN Valid */ { kind: 'usTaxId', value: '999999999', o: 'itin' },
    /** SSN Invalid */ { kind: 'usTaxId', value: '000-12-3456', o: undefined },
    /** SSN Invalid */ { kind: 'usTaxId', value: '000-12-3456', o: undefined },
    /** SSN Invalid */ { kind: 'usTaxId', value: '123-00-6789', o: undefined },
    /** SSN Invalid */ { kind: 'usTaxId', value: '123-00-6789', o: undefined },
    /** SSN Valid */ { kind: 'usTaxId', value: '123-45-6789', o: 'ssn9' },
    /** SSN Valid */ { kind: 'usTaxId', value: '123-45-6789', o: 'ssn9' },
    /** SSN Valid */ { kind: 'usTaxId', value: '223-45-6789', o: 'ssn9' },
    /** SSN Valid */ { kind: 'usTaxId', value: '234-56-7890', o: 'ssn9' },
    /** SSN Invalid */ { kind: 'ssn9', value: '000-12-3456', o: undefined },
    /** SSN Invalid */ { kind: 'ssn9', value: '000-12-3456', o: undefined },
    /** SSN Invalid */ { kind: 'ssn9', value: '123-00-6789', o: undefined },
    /** SSN Invalid */ { kind: 'ssn9', value: '123-00-6789', o: undefined },
    /** SSN Valid */ { kind: 'ssn9', value: '123-45-6789', o: 'ssn9' },
    /** SSN Valid */ { kind: 'ssn9', value: '123-45-6789', o: 'ssn9' },
    /** SSN Valid */ { kind: 'ssn9', value: '223-45-6789', o: 'ssn9' },
    /** SSN Valid */ { kind: 'ssn9', value: '234-56-7890', o: 'ssn9' },
  ])('getTypeOfTaxId %#', ({ kind, value, o }) => {
    // @ts-ignore: kind as string
    expect(getTypeOfTaxId(kind, value)).toEqual(o);
  });
});
