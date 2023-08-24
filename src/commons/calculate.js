const axios = require('axios')
const { secret, firebase } = require('../configs');
const { query, orderByChild, equalTo, child, get, ref, push, set, remove, startAt, endAt, limitToLast } = require("@firebase/database");


module.exports = {
   getRunningNoUserKey: async (datePrefix) => {
      const userRef = ref(firebase, 'users'); 
      const dayQuery = query(userRef, orderByChild('userId'), startAt(`${datePrefix}_`), endAt(`${datePrefix}_999999`), limitToLast(1));
      
      const snapshot = await get(dayQuery);
      if (snapshot.exists()) {
         const lastUser = Object.values(snapshot.val())[0];
         const lastRunningNo = parseInt(lastUser.userId.split('_')[1]); 
         return String(lastRunningNo + 1).padStart(6, '0');
      } else {
         return '000001';
      }
   },
   getRunningNoProductKey: async (datePrefix) => {
      const productRef = ref(firebase, 'products'); 
      const dayQuery = query(productRef, orderByChild('product_id'), startAt(`P_${datePrefix}_`), endAt(`P_${datePrefix}_999999`), limitToLast(1));
      
      const snapshot = await get(dayQuery);
      if (snapshot.exists()) {
         const lastProduct = Object.values(snapshot.val())[0];
         const lastRunningNo = parseInt(lastProduct.product_id.split('_')[2]);
         return String(lastRunningNo + 1).padStart(6, '0');
      } else {
         return '000001';
      }
   },
   getRunningNoOrderKey: async (datePrefix) => {
      const orderRef = ref(firebase, 'orders'); 
      const dayQuery = query(orderRef, orderByChild('transactionNo'), startAt(`T_${datePrefix}_`), endAt(`T_${datePrefix}_999999`), limitToLast(1));
      
      const snapshot = await get(dayQuery);
      if (snapshot.exists()) {
         const lastOrder = Object.values(snapshot.val())[0];
         const lastRunningNo = parseInt(lastOrder.transactionNo.split('_')[2]);
        
         return String(lastRunningNo + 1).padStart(6, '0');
      } else {
         return '000001';
      }
  }
}
