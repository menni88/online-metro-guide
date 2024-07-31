const { body } = require('express-validator');


exports.validateRegistration = [
  body('name').notEmpty().withMessage("name_required"),
  body('nationalId')
  .custom(async value => {
    if (!/^(2|3)([0-9]{2})([0-1][0-9])([0-3][0-9])(\d{7})$/.test(value)) {
      return Promise.reject('nationalId_invalid_format');
    }

  }),
  body('phone')
  .custom(async value => {
    if (!/^(01)[0-9]{9}$/.test(value)) {
      return Promise.reject("phone_invalid_format");
    }
  }),
  body('password')
    .notEmpty().withMessage("password_required")
    .custom(async (value)=>{
      if(/\s/.test(value)){
        return Promise.reject("password_invalid_format_spaces")

      }
      if(value.length <8 || value.length >20){
        return Promise.reject("password_invalid_format_length")
      }
    }),
    body('confirmPassword')
    .custom(async (value , {req})=>{
      const password = req.body.password;
      if(password !== value)
      {
        return Promise.reject("password_does_not_match");
      }
    })
];
  
exports.validateLogin = [
  body('nationalId')
  .custom( async value => {
    if (!/^(2|3)([0-9]{2})([0-1][0-9])([0-3][0-9])(\d{7})$/.test(value)) {
      return Promise.reject("nationalId_invalid_format");
    }
  }),
  body('password').notEmpty().withMessage("password_required"),
  body('firebaseToken').notEmpty().withMessage('firebaseToken_is_required'),
];
 
exports.sendResetCodeValidation =[
  body('nationalId')
  .custom( async value => {
    if (!/^[0-9]{14}$/.test(value)) {
      return Promise.reject("nationalId_invalid_format");
    }
  })
]

     
exports.verifyCodeValidation = [
  body('verificationCode').notEmpty().withMessage('Verification_code_required')
];


exports.updatePasswordValidation = [
  body('newPassword')
  .notEmpty().withMessage("password_required")
  .custom(async (value)=>{

    withoutSpaces = value.trim().replace(" ","");
    if(withoutSpaces.length <8 || withoutSpaces.length >20){
      return Promise.reject("password_invalid_format_length")
    }
  }),
    body('confirmPassword')
    .custom(async (value , {req})=>{
      const newPassword = req.body.newPassword;
      if(newPassword !== value)
      {
        return Promise.reject("password_does_not_match");
      }
    })

];


exports.validateRefreshToken = [
  body('refreshToken').notEmpty().withMessage('Refresh_token_is_required'),
];


exports.validateAdminLogin = [
  body('Id').notEmpty().withMessage('admin_Id_required'),
  body('password').notEmpty().withMessage("password_required")
];