/**
 * smsService.js
 * 
 * This service handles sending OTPs via SMS. 
 * Note: Sending real SMS messages directly from a frontend React application
 * is a security risk as it exposes your API keys. In a production environment,
 * this fetch request should point to your own backend server (Node.js/Python),
 * which securely holds your Twilio/MSG91 API keys and dispatches the SMS.
 */

export async function sendSmsOtp(phoneNumber, otpCode) {
  console.log(`[SMS Service] Sending OTP ${otpCode} to +91${phoneNumber}`);
  
  try {
    // Send request to our custom local backend to bypass browser CORS restrictions
    const response = await fetch('http://localhost:3001/api/send-sms', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        phone: `+91${phoneNumber}`,
        otpCode: otpCode
      }),
    });
    
    const data = await response.json();
    
    if (data.success) {
      return { success: true, message: data.message };
    } else {
      console.error('Textbelt error:', data.error);
      return { success: false, message: `Failed to send OTP: ${data.error}` };
    }
  } catch (error) {
    console.error('Failed to send SMS:', error);
    return { success: false, message: 'Failed to send OTP. Please try again.' };
  }
}
