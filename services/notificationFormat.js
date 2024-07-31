module.exports.notificatoinFormat = (data ,firebaseTokens) => {
    let notificationData = {
        message: {
            token: firebaseTokens,
            data: data.payload
        },
        sent: false, 
        error: null, 
        date: new Date()
    };

            return notificationData;
    }

