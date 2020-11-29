const localStrategy = require('passport-local').Strategy;
const bcrypt = require('bcrypt');

function initializePassport(passport, getUserByEmail){
	const authenticateUser = async (email, password, next) => {
		// find user:
		console.log('authenticate user called email password-> ', email, password);
		const user = getUserByEmail(email);
		if(user == null){
			return next(null, false, { message: 'No user with this email'});
		}

		try {
			if(await bcrypt.compare(password, user.password)){
				// success
				console.log('user was authenticated');
				return next(null, JSON.stringify(user));
			}else{
				// failed
				console.log('password was found to be incorrect');
				return next(null, false, { message: 'Incorrect password'});
			}
		} catch (error) {
			console.log('error: ', error);
			return next(error);
		}
	}
	passport.use(new localStrategy({ usernameField: 'email' }, authenticateUser));
	passport.serializeUser((user, next) => next(null, user) );
	passport.deserializeUser((user, next) => next(null, user));
}

module.exports = initializePassport;