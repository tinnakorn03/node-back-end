 
const jwt = require("jsonwebtoken");  
const { secret, firebase } = require('../configs');
const { query, orderByChild, equalTo, child, get, ref, push, set, remove } = require("@firebase/database");
const bcrypt = require('bcryptjs');

const { result, result_error} = require("../commons/convert"); 
const { getRunningNoUserKey } = require('../commons/calculate');

const saltRounds = 10;  

module.exports = {
  async logIn(ctx, _next) {
    try {
        const { user, password } = ctx.request.body;

        // Determine if 'user' is an email or mobile
        const userRef = ref(firebase, 'users');  
        let userQuery;
        
        if (user.includes('@')) {
          userQuery = query(userRef, orderByChild('email'), equalTo(user));
        } else {
          userQuery = query(userRef, orderByChild('mobile'), equalTo(user));
        }

        const snapshot = await get(userQuery);
        if (snapshot.exists()) {
          const userData = Object.values(snapshot.val())[0];  // Extract the first matched user data

          const passwordMatch = await bcrypt.compare(password, userData.password);
          if (!passwordMatch) {
            ctx.body = result_error(403, "Incorrect password");
            return;
          }

          const token = jwt.sign(JSON.stringify(userData), secret);
          ctx.body = result(200, { token });
        } else {
          ctx.body = result_error(404, "User not found");
        }

    } catch (err) {
        ctx.body = result_error(500, err);
    }
  },

  async register(ctx, _next) {
    try {
        const { email, mobile, firstName, lastName, img, password } = ctx.request.body;
        const hashedPassword = await bcrypt.hash(password, saltRounds);

        const userRef = ref(firebase, 'users');  
        const emailQuery = query(userRef, orderByChild('email'), equalTo(email));

        const snapshot = await get(emailQuery);

        if (snapshot.exists()) {
            ctx.body = result(202, { message: 'This email is already in use. Please use a different one.' });
            return;
        }

        // Create a new user 
        const currentDate = new Date();
        const currentYear = currentDate.getFullYear();
        const currentMonth = String(currentDate.getMonth() + 1).padStart(2, '0');
        const runningNo = await getRunningNoUserKey(currentYear + currentMonth);
 
        // Construct the userId
        const newUserId = `${currentYear}${currentMonth}_${runningNo}`;
        const specificUserRef = child(userRef, newUserId);

        // Create a new user  
        await set(specificUserRef, {
            userId: newUserId,  
            firstName,
            lastName,
            email,
            mobile,
            img,
            password: hashedPassword
        });

        ctx.body = result(200, { message: "Registration successful", userId: newUserId });  

    } catch (err) {
        ctx.body = result_error(500, err);
    }
  },

  async getProfile(ctx, _next) {
    try {
      const userId = ctx.request.params.userId; 
      const usersRef = ref(firebase, 'users');
      const userQuery = query(usersRef, orderByChild('userId'), equalTo(userId));
      const snapshot = await get(userQuery);
      console.log(snapshot.val());

      if (!snapshot.exists()) {
        ctx.body = result_error(404, "User not found");
        return;
      }
      
      const userData = Object.values(snapshot.val())[0];

      ctx.body = result(200, userData);

    } catch (err) {
      ctx.body = result_error(500, err);
    }
  },

  async deleteUser(ctx, _next) {
    try {
        const userId = ctx.request.params.userId;

        const usersRef = ref(firebase, 'users');
        const userQuery = query(usersRef, orderByChild('userId'), equalTo(userId));

        const snapshot = await get(userQuery);

        if (!snapshot.exists()) {
          ctx.body = result_error(404, "User not found");
          return;
        }

        // Extract the key of the user data from the snapshot
        const userKey = Object.keys(snapshot.val())[0];
        const userToDeleteRef = ref(firebase, 'users/' + userKey);

        // Delete user
        await remove(userToDeleteRef);
        ctx.body = result(200, { message: "User deleted successfully" });

    } catch (err) {
        ctx.body = result_error(500, err);
    }
  }

};