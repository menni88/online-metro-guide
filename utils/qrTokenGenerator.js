const crypto = require('crypto');

const ENCRYPTION_KEY = Buffer.from('12345678901234567890123456789012'); 
const algorithm = 'aes-256-gcm';

module.exports.tokenGenerator = (payload) => {
    const iv = crypto.randomBytes(16); 
    const cipher = crypto.createCipheriv(algorithm, ENCRYPTION_KEY, iv);
    let encrypted = cipher.update(payload, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    const authTag = cipher.getAuthTag().toString('hex'); 
    return `${iv.toString('hex')}:${encrypted}:${authTag}`;
}

module.exports.tokenDecoder = (encrypted) => {
    const parts = encrypted.split(':');
    const iv = Buffer.from(parts.shift(), 'hex');
    const authTag = Buffer.from(parts.pop(), 'hex');
    const encryptedText = parts.join(':');
    const decipher = crypto.createDecipheriv(algorithm, ENCRYPTION_KEY, iv);
    decipher.setAuthTag(authTag);
    let decrypted = decipher.update(encryptedText, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
}
