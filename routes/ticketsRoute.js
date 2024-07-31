const express = require('express');
const router = express.Router();
const UserAuthenticator =require("../services/auth/userAuth");
const is_auth = new UserAuthenticator();
const {bookTicket,buyTicket,getUserTickets,showQRCode,getTicketStations} = require("../controllers/ticketsController");
const {validateTicketDetails  ,buyTicketvalidation}=require("../middlewares/ticketValidation");

const PaymentStrategies = require("../services/paymentStrategies/paymentStrategies");
const PostPaymentStrategies = require("../services/paymentStrategies/postPaymentStrategies");
const { checkStatus, checkTicketId } = require('../middlewares/checkTicketParam');
const paymentExecutor = new PaymentStrategies();
const postPaymentExecutor = new PostPaymentStrategies();


router.post("/book-ticket",(req,res,next)=>is_auth.authenticate(req,res,next) ,validateTicketDetails, bookTicket);
router.post("/buy-ticket",(req,res,next)=>is_auth.authenticate(req,res,next),buyTicketvalidation, buyTicket ,(req,res,next)=>paymentExecutor.execute(req,res,next) ,(req,res,next)=>postPaymentExecutor.execute(req,res,next));
router.get("/get-tickets/:status?",(req,res,next)=> is_auth.authenticate(req,res,next),checkStatus, getUserTickets);
router.get("/qrticket/:plainUUID?",(req,res,next)=>is_auth.authenticate(req,res,next),checkTicketId,showQRCode)
router.get("/ticket-Data",(req,res,next)=>is_auth.authenticate(req,res,next),getTicketStations)
module.exports = router;
