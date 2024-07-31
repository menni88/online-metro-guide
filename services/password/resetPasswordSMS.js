const twilio = require('twilio');
const dotenv = require('dotenv').config();

module.exports.sendSms =async (to, msg) => {
  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;
  const twilioPhoneNumber = process.env.TWILIO_PHONE_NUMBER;

  const client = new twilio(accountSid, authToken);


  const formattedTo = `+2${to}`;
  
  try {
    const message = await client.messages
      .create({
        body: msg,
        from: twilioPhoneNumber,
        to: formattedTo,
      })

    console.log(`SMS sent with SID: ${message.sid}`);
    return true;

  } catch (err) {
    console.log('Error sending SMS:', err);
    return false;
  }

}