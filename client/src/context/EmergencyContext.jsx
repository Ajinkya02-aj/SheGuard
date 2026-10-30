import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { incidentsApi, timerApi } from '../api/client';
import { useAuth } from './AuthContext';
import { getCurrentCoordinates, getDeviceBatteryLevel } from '../utils/geolocation';
import { playCountdownBeep, playEmergencyAlertSiren, triggerHapticFeedback } from '../utils/audio';

const EmergencyContext = createContext(null);

export function EmergencyProvider({ children }) {
  const { user, isAuthenticated } = useAuth();

  // SOS Countdown state
  const [isCountdownActive, setIsCountdownActive] = useState(false);
  const [countdownSeconds, setCountdownSeconds] = useState(5);
  const countdownTimerRef = useRef(null);

  // Active Incident state
  const [activeIncident, setActiveIncident] = useState(null);
  const [incidentLoading, setIncidentLoading] = useState(false);
  const [incidentError, setIncidentError] = useState(null);

  // Active Safety Arrival Timer
  const [activeTimer, setActiveTimer] = useState(null);

  // Simulated Fake Call state
  const [fakeCallConfig, setFakeCallConfig] = useState(null);

  // Sync active incident and timer from server on auth
  useEffect(() => {
    if (isAuthenticated) {
      refreshEmergencyState();
    } else {
      setActiveIncident(null);
      setActiveTimer(null);
    }
  }, [isAuthenticated]);

  const refreshEmergencyState = async () => {
    try {
      setIncidentLoading(true);
      const [incidentRes, timerRes] = await Promise.allSettled([
        incidentsApi.getActive(),
        timerApi.getActive(),
      ]);

      if (incidentRes.status === 'fulfilled' && incidentRes.value.activeIncident) {
        setActiveIncident(incidentRes.value.activeIncident);
      } else {
        setActiveIncident(null);
      }

      if (timerRes.status === 'fulfilled' && timerRes.value.timer) {
        setActiveTimer(timerRes.value.timer);
      } else {
        setActiveTimer(null);
      }
    } catch (err) {
      console.warn('Error syncing emergency state:', err);
    } finally {
      setIncidentLoading(false);
    }
  };

  // SOS Countdown Workflow
  const initiateSOS = () => {
    if (isCountdownActive || activeIncident) return;
    setIsCountdownActive(true);
    setCountdownSeconds(5);
    triggerHapticFeedback([100, 100, 100]);
    playCountdownBeep(880, 0.2);

    let remaining = 5;
    countdownTimerRef.current = setInterval(() => {
      remaining -= 1;
      setCountdownSeconds(remaining);

      if (remaining > 0) {
        playCountdownBeep(880 + (5 - remaining) * 80, 0.15);
        triggerHapticFeedback([80]);
      } else {
        clearInterval(countdownTimerRef.current);
        countdownTimerRef.current = null;
        setIsCountdownActive(false);
        executeSOSTrigger();
      }
    }, 1000);
  };

  const cancelCountdown = () => {
    if (countdownTimerRef.current) {
      clearInterval(countdownTimerRef.current);
      countdownTimerRef.current = null;
    }
    setIsCountdownActive(false);
    setCountdownSeconds(5);
  };

  // Immediate SOS Trigger execution
  const executeSOSTrigger = async (customCoords = null) => {
    setIncidentLoading(true);
    setIncidentError(null);
    playEmergencyAlertSiren();
    triggerHapticFeedback([500, 200, 500, 200, 500]);

    try {
      const coords = customCoords || (await getCurrentCoordinates(user?.demoMode));
      const battery = await getDeviceBatteryLevel();

      const payload = {
        latitude: coords.latitude,
        longitude: coords.longitude,
        accuracy: coords.accuracy,
        address: coords.address,
        batteryLevel: battery,
        triggerType: 'sos_button',
      };

      const res = await incidentsApi.triggerSOS(payload);
      setActiveIncident(res.incident);
      return res;
    } catch (err) {
      console.error('Failed to trigger SOS:', err);
      setIncidentError(err.message || 'Failed to dispatch SOS alert.');
      throw err;
    } finally {
      setIncidentLoading(false);
    }
  };

  const cancelActiveIncident = async (reason) => {
    if (!activeIncident) return;
    try {
      const res = await incidentsApi.cancelSOS(activeIncident._id, reason);
      setActiveIncident(null);
      return res;
    } catch (err) {
      console.error('Failed to cancel SOS:', err);
      throw err;
    }
  };

  const resolveActiveIncident = async (notes) => {
    if (!activeIncident) return;
    try {
      const res = await incidentsApi.resolveSOS(activeIncident._id, notes);
      setActiveIncident(null);
      return res;
    } catch (err) {
      console.error('Failed to resolve SOS:', err);
      throw err;
    }
  };

  // Safety Timer Operations
  const startTimer = async (destination, durationMinutes, notes, selectedContacts) => {
    const res = await timerApi.start({
      destination,
      durationMinutes,
      notes,
      selectedContacts,
    });
    setActiveTimer(res.timer);
    return res;
  };

  const checkInTimer = async () => {
    const res = await timerApi.checkIn();
    setActiveTimer(null);
    return res;
  };

  const cancelTimer = async () => {
    const res = await timerApi.cancel();
    setActiveTimer(null);
    return res;
  };

  const escalateTimer = async () => {
    const coords = await getCurrentCoordinates(user?.demoMode);
    const res = await timerApi.escalate({
      latitude: coords.latitude,
      longitude: coords.longitude,
      accuracy: coords.accuracy,
    });
    if (res.incident) {
      setActiveIncident(res.incident);
    }
    await refreshEmergencyState();
    return res;
  };

  // Fake Call controls
  const triggerFakeCall = (callerName = 'Mom', delaySeconds = 0) => {
    if (delaySeconds === 0) {
      setFakeCallConfig({ callerName, triggeredAt: Date.now() });
    } else {
      setTimeout(() => {
        setFakeCallConfig({ callerName, triggeredAt: Date.now() });
      }, delaySeconds * 1000);
    }
  };

  const dismissFakeCall = () => {
    setFakeCallConfig(null);
  };

  return (
    <EmergencyContext.Provider
      value={{
        isCountdownActive,
        countdownSeconds,
        initiateSOS,
        cancelCountdown,
        executeSOSTrigger,
        activeIncident,
        incidentLoading,
        incidentError,
        cancelActiveIncident,
        resolveActiveIncident,
        refreshEmergencyState,
        activeTimer,
        startTimer,
        checkInTimer,
        cancelTimer,
        escalateTimer,
        fakeCallConfig,
        triggerFakeCall,
        dismissFakeCall,
      }}
    >
      {children}
    </EmergencyContext.Provider>
  );
}

export function useEmergency() {
  const context = useContext(EmergencyContext);
  if (!context) {
    throw new Error('useEmergency must be used within an EmergencyProvider');
  }
  return context;
}
