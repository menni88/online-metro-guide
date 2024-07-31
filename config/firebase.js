var admin = require("firebase-admin");

var serviceAccount = require("./service-account-file.json");

let app;
// Initialize Firebase
module.exports.initializeFireBase =()=>{
 app = admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });   
 console.info("Initialized Firebase SDK");
};

module.exports.fireBaseApp=app;