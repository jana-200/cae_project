import {
  storeAuthenticatedUser,
  getAuthenticatedUser,
  clearAuthenticatedUser,
} from './session';
import { describe, beforeEach, vi, test, expect } from 'vitest';
import type { AuthenticatedUser } from '../types';

describe('authStorage utils', () => {
  const user: AuthenticatedUser = {
    email: 'user@test.com',
    token: 'secure-token',
  };

  beforeEach(() => {
    const storageMock = (() => {
      let store: Record<string, string> = {};
      return {
        getItem: vi.fn((key) => store[key] ?? null),
        setItem: vi.fn((key, value) => {
          store[key] = value.toString();
        }),
        removeItem: vi.fn((key) => {
          delete store[key];
        }),
        clear: vi.fn(() => {
          store = {};
        }),
      };
    })();

    vi.stubGlobal('localStorage', storageMock);
    vi.stubGlobal('sessionStorage', storageMock);
  });

  test('storeAuthenticatedUser uses localStorage when rememberMe is true', () => {
    const localSpy = vi.spyOn(localStorage, 'setItem');
    storeAuthenticatedUser(user, true);
    expect(localSpy).toHaveBeenCalledWith(
      'authenticatedUser',
      JSON.stringify(user),
    );
    expect(localStorage.getItem('authenticatedUser')).toEqual(
      JSON.stringify(user),
    );
  });

  test('storeAuthenticatedUser uses sessionStorage when rememberMe is false', () => {
    const sessionSpy = vi.spyOn(sessionStorage, 'setItem');
    storeAuthenticatedUser(user, false);
    expect(sessionSpy).toHaveBeenCalledWith(
      'authenticatedUser',
      JSON.stringify(user),
    );
    expect(sessionStorage.getItem('authenticatedUser')).toEqual(
      JSON.stringify(user),
    );
  });

  test('getAuthenticatedUser returns user from localStorage if present', () => {
    localStorage.setItem('authenticatedUser', JSON.stringify(user));
    const retrieved = getAuthenticatedUser();
    expect(retrieved).toEqual(user);
  });

  test('getAuthenticatedUser returns user from sessionStorage if localStorage empty', () => {
    sessionStorage.setItem('authenticatedUser', JSON.stringify(user));
    const retrieved = getAuthenticatedUser();
    expect(retrieved).toEqual(user);
  });

  test('getAuthenticatedUser returns undefined if no storage contains user', () => {
    const retrieved = getAuthenticatedUser();
    expect(retrieved).toBeUndefined();
  });

  test('clearAuthenticatedUser removes user from both storages', () => {
    localStorage.setItem('authenticatedUser', JSON.stringify(user));
    sessionStorage.setItem('authenticatedUser', JSON.stringify(user));
    clearAuthenticatedUser();
    expect(localStorage.getItem('authenticatedUser')).toBeNull();
    expect(sessionStorage.getItem('authenticatedUser')).toBeNull();
  });
});
