class OrderDTO {
  constructor(user, orderAmount, paymentType, firebaseToken, relatedData = {}) {
      this.relatedData = relatedData;
      this.relatedData.user = user;
      this.orderAmount = orderAmount;
      this.paymentType = paymentType;
      this.relatedData.firebaseToken =firebaseToken;
  }
}

class SubscriptionOrderDTO extends OrderDTO {
  constructor(user, subscriptionId, price, duration,firebaseToken) {
      super(user, price, "subscription", firebaseToken,{ subscriptionId, duration });
  }
}

        
class TicketOrderDTO extends OrderDTO {
  constructor(user, price, firebaseToken ,ticketStations ) {
      super(user, price, "ticket", firebaseToken,{ ticketStations });
  }
}



class ChargeOrderDTO extends OrderDTO {
  constructor(user, chargeAmount , firebaseToken) {
      super(user, chargeAmount * 100, "balance", firebaseToken);
      this.paymentMethod = "payWithPaymob";
  }
}

module.exports ={SubscriptionOrderDTO ,TicketOrderDTO ,ChargeOrderDTO};
