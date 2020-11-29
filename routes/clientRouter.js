const express = require('express');
const dynamodb = require('../database/dynamodb');
const bcrypt = require('bcrypt');
const emailer = require('../emailer/nodeEmailer');

const clientRouter = express.Router();

// whatever user exists or not
clientRouter.get('/userExists/:userEmail', async (req, res, next) => {
	// check existing
	const email = req.params.userEmail;

	if (!email) {
		res.statusCode = 200;
		res.send({
			success: false
		});
		return;
	}

	dynamodb.getUser(email).then(async (data, err) => {
		const existingUser = data.Item;

		res.statusCode = 200;
		res.send({
			success: existingUser ? true : false
		});
	});
});

clientRouter.post('/register', (req, res, next) => {
	const newUser = req.body.newUser;

	// convert password
	const passwordHash = bcrypt.hashSync(newUser.password, 10);
	newUser.password = passwordHash;
	newUser.active = false;

	dynamodb.addUser(newUser).then((data, err) => {
		if (err) {
			res.send({ success: false, err });
			return;
		}
		res.send({
			success: true
		});
	});
});

clientRouter.post('/login', async (req, res, next) => {
	// check existing
	const { email, password } = req.body;

	if (!email || !password) {
		res.statusCode = 200;
		res.send({
			success: false,
			message: `Incomplete login credentials received`
		});
		return;
	}

	dynamodb.getUser(email).then(async (data, err) => {
		const user = data.Item;
		if (err || !user) {
			res.statusCode = 200;
			res.send({
				success: false,
				message: `User with email ${email} not found`
			});
			return;
		}

		const passwordCorrect = await bcrypt.compare(password, user.password);

		if (passwordCorrect) {
			if (user.active) {
				req.session.user = { ...user, password: "" };
				req.session.key = 'placeholder-aws-key';
				req.session.bucketFolder = 'placeholder-aws-bucket-folder';
				req.session.data = {};

				res.statusCode = 200;
				res.send({
					success: true,
					...req.session.user,
					key: req.session.key,
					bucketFolder: req.session.bucketFolder,
					data: req.session.data
				});
			} else {
				res.statusCode = 200;
				res.send({
					success: false,
					message: 'This user account is not active'
				});
			}
		} else {
			res.statusCode = 200;
			res.send({
				success: false,
				message: 'Password provided is incorrect'
			});
		}
	});
});

clientRouter.post('/logout', auth, async (req, res, next) => {
	// check existing
	const { email } = req.session.user;

	if (!email) {
		res.statusCode = 200;
		res.send({
			success: false,
			message: `Invalid session`
		});
		return;
	}

	// let what = 
	await req.session.destroy();
	res.send({
		success: true
	});
});

clientRouter.get('/getSessionUser', auth, (req, res, next) => {
	res.statusCode = 200;
	res.send({
		success: true,
		...req.session.user,
		key: req.session.key,
		bucketFolder: req.session.bucketFolder,
		data: req.session.data
	})
});

clientRouter.post('/setData', auth, (req, res, next) => {
	req.session.data = {
		...req.session.data,
		...req.body
	}
	res.send({
		success: true
	});
});

clientRouter.get('/getAllUsers', authAdmin, (req, res, next) => {
	dynamodb.getAllUsers().then(
		(data, err) => {
			if (err) {
				res.statusCode = 500;
				res.send({
					success: false,
					err
				});
				return;
			}
			res.statusCode = 200;
			res.send({
				success: true,
				users: data.Items.filter(user => !user.admin).map((user) => { return { ...user } })
			});
		}
	);
});

clientRouter.post('/updateUser', authAdmin, (req, res, next) => {
	const altUser = req.body.updatedUser;
	const userEmail = req.body.userEmail;

	// if(!altUser.email)
	// 	altUser.email = userEmail;

	dynamodb.updateUser(userEmail, altUser).then(
		(data, err) => {
			if (err) {
				res.send({ success: false });
			} else {
				dynamodb.getAllUsers().then(
					(data, err) => {
						if (err) {
							res.statusCode = 500;
							res.send({
								success: false,
								err
							});
							return;
						}
						res.statusCode = 200;
						res.send({
							success: true,
							users: data.Items.filter(user => !user.admin).map((user) => { return { ...user, password: "" } })
						});
					}
				);
			}
		}
	);

});

clientRouter.post('/removeUser', authAdmin, (req, res, next) => {
	const altUser = req.body.removedUser;

	dynamodb.removeUser(altUser.email).then((data, err) => {
		// get all campaigns
		if (err) {
			return;
		}

		dynamodb.getAllCampaigns(altUser.email).then(
			async (data) => {
				// delete each campaign
				const campaigns = data.Items;
				for await (const campaign of campaigns) {
					dynamodb.removeCampaign(campaign.campaignURL);
				}

				// return response
				dynamodb.getAllUsers().then(
					(data, err) => {
						if (err) {
							res.statusCode = 500;
							res.send({
								success: false,
								err
							});
							return;
						}
						res.statusCode = 200;
						res.send({
							success: true,
							users: data.Items.filter(user => !user.admin).map((user) => { return { ...user, password: "" } })
						});
					}
				);
			}, (err) => {
				res.send({ success: false, err });
			}
		);
	});
});

clientRouter.post('/addUser', authAdmin, (req, res, next) => {
	const newUser = req.body.newUser;

	// convert password
	const passwordHash = bcrypt.hashSync(newUser.password, 10);
	newUser.password = passwordHash;

	dynamodb.addUser(newUser).then((data, err) => {
		if (err) {
			res.send({ success: false, err });
			return;
		}
		res.send({
			success: true
		});
	});
});

clientRouter.get('/otp/:userEmail', (req, res, next) => {
	// check existing
	const email = req.params.userEmail;

	if (!email) {
		res.statusCode = 200;
		res.send({
			success: false
		});
		return;
	}

	const otpValue = dynamodb.getRandomString(10);

	dynamodb.getUser(email)
		.then(
			(data) => {
				const user = data.Item;
				user.otp = {
					value: otpValue,
					timestamp: new Date().getTime()
				};
				dynamodb.updateUser(email, user)
					.then(
						(data) => {
							// send email
							emailer.sendOTPMail(email, otpValue,
								function callback(error, info) {
									if (error) {
										res.send({
											success: false
										});
									} else {
										res.send({
											success: true
										});
									}
								}
							)
							// res.send({
							// 	success: true
							// });
						},
						(err) => {
							res.send({
								success: false,
								err
							});
						}
					)
			},
			(err) => {
				res.send({
					success: false,
					err
				});
			}
		);
});

clientRouter.post('/passwordReset', (req, res, next) => {
	const email = req.body.email;
	const otp = req.body.otp;
	const password = req.body.password;

	if (!email) {
		res.statusCode = 200;
		res.send({
			success: false,
			message: "Please keep valid email in the form"
		});
		return;
	}

	dynamodb.getUser(email)
		.then(
			(data) => {
				const user = data.Item;

				if (user.otp) {
					if (user.otp.value === otp && dynamodb.getTimeDifference(new Date().getTime() - user.otp.timestamp) <= 1) {

						const passwordHash = bcrypt.hashSync(password, 10);
						user.password = passwordHash;

						// remove otp
						const altUser = {}
						for (var key in user) {
							if (key !== "otp")
								altUser[key] = user[key]
						}

						dynamodb.updateUser(email, altUser)
							.then(
								(data) => {
									res.send({
										success: true
									});
								},
								(err) => {
									res.send({
										success: false,
										err
									});
								}
							)
					} else if (user.otp.value !== otp) {
						// invalid
						res.send({
							success: false,
							message: "OTP is invalid"
						});
					} else {
						// invalid
						res.send({
							success: false,
							message: "OTP expired, please generate a new OTP"
						});
					}
				} else {
					// not generated
					res.send({
						success: false,
						message: "You must generate OTP first"
					});
				}
			},
			(err) => {
				res.send({
					success: false,
					err
				});
			}
		);
});


function auth(req, res, next) {
	if (req.session.user) {
		next();
		return;
	}
	res.statusCode = 200;
	res.send({
		success: false
	});
	return;
}

function authAdmin(req, res, next) {
	if (req.session.user) {
		if (req.session.user.admin) {
			next();
			return;
		}
	}
	res.statusCode = 200;
	res.send({
		success: false
	});
}

module.exports = clientRouter;