const express = require('express');
const DB = require("./config/db");
const driver = require("./config/neo4jDriver").initDriver();
const i18next = require('i18next');
const {clearSubscriptions,clearTickets}=require("./services/clearCaching")
const {expireSubscription}=require("./services/subscription/expiredSubscription")
const backend = require('i18next-fs-backend');
const middleware = require('i18next-http-middleware');
const {initializeFireBase} = require("./config/firebase");
const cron = require('node-cron');
const app = express();
const {formatServerErrors}=require("./utils/responseModels")
initializeFireBase();


app.use(express.urlencoded({ extended: true }));
app.use(express.json());


cron.schedule('0 0 * * *', async () => {
  await expireSubscription();
  await clearSubscriptions(); 
 
});

const authRoute=require("./routes/authRoute")
const stationsRoute = require('./routes/stationsRoute');
const subscriptionRoute =require('./routes/subRoute');
const ticketsRoute=require("./routes/ticketsRoute");
const scanRoutes=require("./routes/validation");
const paymentRoutes=require("./routes/payment");
const userProfileRoute=require("./routes/userProfileRoute")
const navigation=require("./routes/navigation")
const admin=require("./routes/adminRoute")



i18next.use(backend).use(middleware.LanguageDetector).init({
  backend: {
    loadPath: './locales/{{lng}}/translation.json',
  },
  fallbackLng: 'en'
})


app.use( middleware.handle(i18next));


app.use("/api/", authRoute);
app.use('/stations/',stationsRoute);
app.use('/subscription',subscriptionRoute);
app.use('/tickets',ticketsRoute);
app.use("/scan/", scanRoutes);
app.use("/payment/",paymentRoutes);
app.use("/userProfile/",userProfileRoute);
app.use("/navigation",navigation)
app.use("/admin/",admin)

app.use((error, req, res, next) => {

  if (!error.statusCode && !error.code) {
    console.log(error);
    error = formatServerErrors(req);
  }else{
    let statusCode = parseInt(error.code || error.statusCode);
  if (isNaN(statusCode) || statusCode < 100 || statusCode > 599) {
    console.log(error.message);
    error = formatServerErrors(req);  
  }
  }

  if (error.storageErrors) {
    delete  error.storageErrors 
    }
  res.status(error.code ).json(error);
});

process.on("uncaughtException",(exception)=>{console.log(exception)});

app.listen(3000,()=>{
    console.log("server connected on port 3000")
})








