export async function sendEmailOtp(emailAddress, otpCode) {
  console.log(`[Email Service] Sending OTP ${otpCode} to ${emailAddress}`);
  
  try {
    const response = await fetch('http://localhost:3001/api/send-email', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: emailAddress,
        otpCode: otpCode
      }),
    });
    
    const data = await response.json();
    
    if (data.success) {
      return { success: true, message: data.message };
    } else {
      console.error('Email error:', data.error);
      return { success: false, message: `Failed to send OTP: ${data.error}` };
    }
  } catch (error) {
    console.error('Failed to send Email:', error);
    return { success: false, message: 'Failed to send OTP. Is the backend server running?' };
  }
}
