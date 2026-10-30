import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import SOSButton from '../components/sos/SOSButton';
import CountdownOverlay from '../components/sos/CountdownOverlay';
import { EmergencyProvider } from '../context/EmergencyContext';
import { AuthProvider } from '../context/AuthContext';

function renderWithProviders(ui) {
  return render(
    <AuthProvider>
      <EmergencyProvider>{ui}</EmergencyProvider>
    </AuthProvider>
  );
}

describe('Emergency SOS Frontend Workflow', () => {
  it('renders prominent SOS button with accessibility label', () => {
    renderWithProviders(<SOSButton onActiveIncidentClick={() => {}} />);
    const sosBtn = screen.getByRole('button', { name: /Activate Emergency SOS/i });
    expect(sosBtn).toBeInTheDocument();
    expect(screen.getByText('SOS')).toBeInTheDocument();
  });

  it('triggers 5-second countdown on click and shows cancellation control', () => {
    renderWithProviders(
      <>
        <SOSButton onActiveIncidentClick={() => {}} />
        <CountdownOverlay />
      </>
    );

    const sosBtn = screen.getByRole('button', { name: /Activate Emergency SOS/i });
    fireEvent.click(sosBtn);

    // Countdown overlay should become visible
    expect(screen.getByRole('alertdialog')).toBeInTheDocument();
    expect(screen.getByText(/CANCEL SOS \(False Alarm\)/i)).toBeInTheDocument();

    // Cancel countdown
    const cancelBtn = screen.getByText(/CANCEL SOS \(False Alarm\)/i);
    fireEvent.click(cancelBtn);

    // Overlay dismissed
    expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument();
  });
});
