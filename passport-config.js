const LocalStrategy = require('passport-local').Strategy
const bcrypt = require('bcrypt')
const db = require('./functions/external_functions/dbFunctions');

function initialize(passport, getUserByUsername, getUserById) {
    
  const authenticateUser = async (username, password, done) => {
    //const user = getUserByUsername(username);
    const user_db = await db.get_user_by_username(username);
    var user;
    try{
       user = JSON.parse(JSON.stringify(user_db[0]))
       console.log(user);
       console.log(typeof(user));
       console.log(user.username);
       console.log(user.password);
       if (user == null) {
         return done(null, false, { message: 'No user with that username' })
       }
    } catch {
      return done(null, false, { message: 'No user with that username' })
    }


    try {
      if (await bcrypt.compare(password, user.password)) {
        return done(null, user)
      } else {
        return done(null, false, { message: 'Password incorrect' })
      }
    } catch (e) {
      return done(e)
    }
  }

  passport.use(new LocalStrategy({ usernameField: 'username', passwordField: 'password' }, authenticateUser))
  passport.serializeUser((user, done) => done(null, user.user_id))
  passport.deserializeUser(async function (id, done) {
    const user_db = await db.get_user_by_id(id);
    const user = JSON.parse(JSON.stringify(user_db[0]));
    return done(null, user);
  })
}

module.exports = initialize