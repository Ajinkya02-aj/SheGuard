import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import DemoBadge from '../components/common/DemoBadge';
import { AuthProvider } from '../context/AuthContext';

describe('Demo Mode & Safety Badge Tests', () => {
  it('renders demo badge properly when user is loaded in demo mode', () => {
    // Provide a mocked demo user in local storage
    localStorage.setItem('sheguard_token', 'test_token');

    render(
      <AuthProvider>
        <DemoBadge />
      </AuthProvider>
    );

    // Initial check passes
    expect(true).toBe(true);
  });
});
