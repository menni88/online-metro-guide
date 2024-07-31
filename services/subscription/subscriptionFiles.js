const fs = require('fs');
const path = require('path');

const { sendSuccess } = require("../../utils/responseModels")

exports.StoreFile = (req, res, next) => {

  try {


    const dirPath = path.join(__dirname, '../../', 'uploads', req.user._id.toString());
    fs.mkdirSync(dirPath, { recursive: true });

    const filePath = path.join(dirPath, req.fileName + req.fileExtension);
    fs.writeFileSync(filePath, req.file.buffer);


  } catch (err) {
    console.log(err);
    //retry mechanism
  }
}


exports.deleteFile = (req, res, next) => {
  try {
    const dirPath = path.join(__dirname, '../../', 'uploads', req.user._id.toString());
    const possibleExtensions = ['.jpg', '.jpeg']
    let fileDeleted = false;
    for (const ext of possibleExtensions) {
      const filePath = path.join(dirPath, req.fileName + ext);
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
      sendSuccess(req, res, 200, 'Subscription_deleted_successfully', null);
    }
  } catch (err) {
    console.log(err);
    //retry mechanism

  }
}
