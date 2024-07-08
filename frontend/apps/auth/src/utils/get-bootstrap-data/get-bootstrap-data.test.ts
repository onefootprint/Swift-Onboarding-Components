import { describe, expect, it } from 'bun:test';

import getAuthBootstrapData from './get-bootstrap-data';

describe('getAuthBootstrapData', () => {
  it('should return an object with email and phoneNumber properties', () => {
    const bootstrapData = { 'id.email': 'bootstrap@a.com', 'id.phone_number': '+1234567890' };
    const userData = { 'id.email': 'user@a.com', 'id.phone_number': '+0987654321' };

    const result = getAuthBootstrapData({ bootstrapData, userData });
    expect(result).toEqual({ email: 'bootstrap@a.com', phoneNumber: '+1234567890' });
  });

  it('should return an object with email and phoneNumber properties when bootstrapData is undefined', () => {
    const userData = { 'id.email': 'user@a.com', 'id.phone_number': '+0987654321' };
    const result = getAuthBootstrapData({ userData });

    expect(result).toEqual({ email: 'user@a.com', phoneNumber: '+0987654321' });
  });

  it('should return an object with email and phoneNumber properties when userData is undefined', () => {
    const bootstrapData = { 'id.email': 'bootstrap@a.com', 'id.phone_number': '+1234567890' };

    const result = getAuthBootstrapData({ bootstrapData });
    expect(result).toEqual({ email: 'bootstrap@a.com', phoneNumber: '+1234567890' });
  });

  it('should validate an email before returning', () => {
    const bootstrapData = { 'id.email': 'not-an-email', 'id.phone_number': '+1234567890' };

    const result = getAuthBootstrapData({ bootstrapData });
    expect(result).toEqual({ phoneNumber: '+1234567890' });
  });

  it('should not allow an empty values', () => {
    const bootstrapData = { 'id.email': '', 'id.phone_number': '' };

    const result = getAuthBootstrapData({ bootstrapData });
    expect(result).toEqual({});
  });

  it('should return an object with email and phoneNumber properties when both bootstrapData and userData are undefined', () => {
    const result = getAuthBootstrapData({});
    expect(result).toEqual({ email: undefined, phoneNumber: undefined });
  });
});
