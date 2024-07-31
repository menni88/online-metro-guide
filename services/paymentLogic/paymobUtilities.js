require('dotenv').config();
const axios = require('axios');
const { formatServerErrors} = require('../../utils/responseModels')
const crypto = require('crypto');
const { json } = require('express');


module.exports.authenticate = async (req) => {
  try {
    const response = await axios.post('https://accept.paymob.com/api/auth/tokens', {
      api_key: process.env.paymob_api_key,
    });
    return response.data.token;

  } catch (error) {
    console.log(error.response.data);
    throw formatServerErrors(req);
  }
};


createPaymobOrder = async (req,authToken, orderAmount) => {
  try {
    const response = await axios.post('https://accept.paymob.com/api/ecommerce/orders', {
      auth_token: authToken,
      delivery_needed: false,
      amount_cents: orderAmount,
      currency: 'EGP',
      items: []
    });
    return response.data.id;

  } catch (error) {
    console.log(error.response.data);
    throw formatServerErrors(req);
  }
};

module.exports.createPaymentKey = async (req,authToken, orderAmount , relatedData ,paymentType) => {
  try {
  
    const orderId = await createPaymobOrder(req,authToken, orderAmount);
    const extras=JSON.stringify({
      relatedData: relatedData,
      paymentType: paymentType,
      paymentMethod: "payWithPaymob"
    });
    const response = await axios.post('https://accept.paymob.com/api/acceptance/payment_keys', {
      auth_token: authToken,
      amount_cents: orderAmount,
      expiration: 3600, // 1 hour; adjust as needed
      order_id: orderId,
      currency: 'EGP',
      integration_id: parseInt(process.env.PAYMOB_INTEGRATION_ID, 10),
      billing_data:{
        first_name: "NA",
        last_name: "NA",
        street: "NA",
        building:"NA",
        floor: "NA",
        apartment: "NA",
        city: "NA",
        country: "NA",
        email: "NA",
        phone_number: "NA",
        state:extras
      }
    },{
      headers: {
        'Content-Type': 'application/json'
      }});
    return response.data.token; // Payment key
  } catch (error) {
    console.log(error.response.data);
    throw formatServerErrors(req);
  }

};


 
function flattenObject(obj, prefix = '') {
  return Object.keys(obj).reduce((acc, key) => {
    const value = obj[key];
    const newKey = prefix ? `${prefix}.${key}` : key;

    if (typeof value === 'object' && value !== null) {
      Object.assign(acc, flattenObject(value, newKey));
    } else {
      acc[newKey] = value;
    }
    return acc;
  }, {});
}

module.exports.validateAcceptHMAC = (requestData, receivedHMAC) => {
  const flattenedData = flattenObject(requestData);

  // Sort data lexicographically by key
  const sortedData = Object.keys(flattenedData).sort().reduce((acc, key) => {
    acc[key] = flattenedData[key];
    return acc;
  }, {});


  // List of keys to be used for concatenation, updated to match the structure of the flattened keys
  const keys = [
    'obj.amount_cents',
    'obj.created_at',
    'obj.currency',
    'obj.error_occured',
    'obj.has_parent_transaction',
    'obj.id',
    'obj.integration_id',
    'obj.is_3d_secure',
    'obj.is_auth',
    'obj.is_capture',
    'obj.is_refunded',
    'obj.is_standalone_payment',
    'obj.is_voided',
    'obj.order.id',
    'obj.owner',
    'obj.pending',
    'obj.source_data.pan',
    'obj.source_data.sub_type',
    'obj.source_data.type',
    'obj.success'
  ];

  // Concatenate the values of the specified keys
  let connectedString = '';
  keys.forEach(key => {
    if (sortedData[key] !== undefined) {
      connectedString += sortedData[key];
    } else {
      console.log(`Key ${key} not found in sortedData`);
    }
  });


  // Calculate the HMAC using SHA512
  const calculatedHMAC = crypto.createHmac('sha512', process.env.PAYMOB_HMAC).update(connectedString).digest('hex').toLowerCase();

  // Compare HMACs
  return receivedHMAC === calculatedHMAC;
};

