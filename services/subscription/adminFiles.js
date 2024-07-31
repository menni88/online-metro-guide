const path = require('path');
const fs = require('fs');
const { notificatoinFormat } = require('../notificationFormat');

exports.deleteFile = (req, res, next) => {
  const userId = req.userId;
  const subId = req.subId;
  const msg=req.msg
  const dirPath = path.join(__dirname, '../../', 'uploads', userId.toString());
  const possibleExtensions = ['.jpg', '.jpeg'];
  let fileDeleted = false;

  for (const ext of possibleExtensions) {
    const filePath = path.join(dirPath, `${subId}${ext}`);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      fileDeleted = true;
      break;
    }
  }

  if (fileDeleted) {
    if (fs.existsSync(dirPath) && fs.readdirSync(dirPath).length === 0) {
      fs.rmdirSync(dirPath);
    }
    const data = {
      payload: {
        type:"mixed",
        msg: msg
      }
    };
    
    req.notificationData = notificatoinFormat(data, req.firebaseToken);
    next();
    //notify the Client
}
};


exports.getPhotoPath = (userId, subId) => {
    const dirPath = path.join(__dirname, '../../', 'uploads', userId.toString());
    const possibleExtensions = ['.jpg', '.jpeg'];

    for (const ext of possibleExtensions) {
        const filePath = path.join(dirPath, `${subId}${ext}`);
        if (fs.existsSync(filePath)) {
            return filePath; 
        }
    }

    return null;
};

