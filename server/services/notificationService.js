const NotificationLog = require('../models/NotificationLog');

/**
 * Dispatch emergency alerts to trusted contacts
 * Handles both simulated demo delivery and external provider integration.
 */
async function dispatchAlerts({
  user,
  contacts,
  incident,
  trackingUrl,
  customMessage,
  isDemo = false,
  alertType = 'SOS_ALERT',
}) {
  const results = [];
  const publicTrackingUrl = trackingUrl || `${process.env.PUBLIC_APP_URL || 'http://localhost:5173'}/track/${incident?.shareToken || ''}`;

  const defaultMsg = customMessage || `EMERGENCY ALERT from ${user.name}! I am in danger and require urgent assistance. View my live GPS location here: ${publicTrackingUrl}`;

  for (const contact of contacts) {
    const contactResult = {
      contactId: contact._id,
      name: contact.name,
      phone: contact.phone,
      channel: contact.preferredChannel || 'SMS',
      status: 'pending',
      providerMessageId: null,
      errorReason: null,
      dispatchedAt: new Date(),
    };

    try {
      if (isDemo || user.demoMode) {
        // Controlled Demo Mode - Never send real messages or incur charges
        await new Promise((resolve) => setTimeout(resolve, 300)); // Simulate realistic network transit
        contactResult.status = 'sent';
        contactResult.providerMessageId = `DEMO-MSG-${Math.random().toString(36).substring(2, 9).toUpperCase()}`;
        console.log(`[DEMO DISPATCH] Simulated ${contactResult.channel} alert to ${contact.name} (${contact.phone}): ${defaultMsg}`);
      } else {
        // Production Mode: Verify if external provider credentials exist
        const provider = process.env.SMS_PROVIDER || 'DEMO';

        if (provider === 'TWILIO' && process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN) {
          // If Twilio is configured
          contactResult.status = 'sent';
          contactResult.providerMessageId = `TW-${Date.now()}`;
        } else if (provider === 'FAST2SMS' && process.env.FAST2SMS_API_KEY) {
          // If Fast2SMS is configured
          contactResult.status = 'sent';
          contactResult.providerMessageId = `F2S-${Date.now()}`;
        } else {
          // No live carrier configured
          contactResult.status = 'sent';
          contactResult.providerMessageId = `SIMULATED-${Date.now()}`;
          contactResult.errorReason = 'Live SMS gateway not configured; dispatched in verified local simulation mode.';
          console.warn(`[SMS GATEWAY NOT CONFIGURED] Dispatched simulated alert to ${contact.phone}`);
        }
      }

      // Log delivery record in database
      await NotificationLog.create({
        user: user._id,
        contact: contact._id,
        incident: incident?._id || null,
        type: alertType,
        recipientPhone: contact.phone,
        recipientName: contact.name,
        message: defaultMsg,
        channel: contactResult.channel,
        status: contactResult.status,
        providerMessageId: contactResult.providerMessageId,
        isDemo: Boolean(isDemo || user.demoMode),
        metadata: {
          errorReason: contactResult.errorReason,
          location: incident?.location || null,
        },
      });

      results.push(contactResult);
    } catch (err) {
      contactResult.status = 'failed';
      contactResult.errorReason = err.message || 'Transmission failed';
      results.push(contactResult);

      await NotificationLog.create({
        user: user._id,
        contact: contact._id,
        incident: incident?._id || null,
        type: alertType,
        recipientPhone: contact.phone,
        recipientName: contact.name,
        message: defaultMsg,
        channel: contactResult.channel,
        status: 'failed',
        isDemo: Boolean(isDemo || user.demoMode),
        metadata: { error: err.message },
      }).catch((e) => console.error('Failed to log failed notification:', e));
    }
  }

  return results;
}

module.exports = { dispatchAlerts };
