const express = require('express');
const dynamodb = require('../database/dynamodb');
const bucket = require('../database/bucket');

const campaignRouter = express.Router();

campaignRouter.get('/getUserCampaigns/:userEmail', auth, (req, res, next) => {
	const userEmail = req.params.userEmail;
	if (userEmail === "*") {
		if (req.session.user.admin) {
			// get all users, then get all user's campaigns
			dynamodb.getAllUsers().then(
				async (data, err) => {
					if (err) {
						res.statusCode = 500;
						res.send({
							success: false,
							err
						});
						return;
					}

					res.statusCode = 200;
					const users = data.Items.filter(user => !user.admin); //.map((user) => { return { email: user.email, name: user.name } });
					
					const userCampaignsList = [];
					for (let user of users) {
						const campaigns = await dynamodb.getAllCampaignsAsync(user.email);
						userCampaignsList.push({
							user: user.name,
							campaigns: campaigns.Items
						});
					}
					res.send({
						success: true,
						campaigns: userCampaignsList
					});
				}
			);
		} else {
			res.send({
				success: false,
				err: "Invalid email"
			});
		}
		return;
	}
	dynamodb.getAllCampaigns(userEmail)
		.then(
			(data) => {
				const campaigns = data.Items;
				res.send({
					success: true,
					campaigns
				});
			},
			(err) => {
				res.send({
					success: false,
					err
				});
			}
		);
});

campaignRouter.get('/getCampaignVideosList/:campaignURL', auth, (req, res, next) => {
	const campaignURL = req.params.campaignURL;

	function cb(err, keyUrlPairs) {
		if (err) {
			res.send({
				success: false,
				err
			});
			return;
		}
		else {
			res.send({
				success: true,
				videos: keyUrlPairs
			});
		}
	}
	bucket.getVideosList(campaignURL, cb);
});

campaignRouter.delete('/removeCampaignVideo/:videoKey', auth, (req, res, next) => {
	const videoKey = req.params.videoKey.replace("$", "/");

	function cb(err, url) {
		if (err) {
			res.send({
				success: false,
				err
			});
		}
		else {
			res.send({
				success: true,
				videoKey
			});
		}
	}
	bucket.removeVideo(videoKey, cb);
});

campaignRouter.put('/updateCampaign/:campaignURL', auth, (req, res, next) => {
	const campaignURL = req.params.campaignURL;
	const altCampaign = req.body.updatedCampaign;

	dynamodb.updateCampaign(campaignURL, altCampaign)
		.then(
			(data) => {
				res.send({
					success: true
				})
			},
			(err) => {
				res.send({
					success: false,
					err
				});
			}
		);
});

campaignRouter.delete('/removeCampaign/:campaignURL', auth, (req, res, next) => {
	const campaignURL = req.params.campaignURL;

	dynamodb.removeCampaign(campaignURL)

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
		);
});

campaignRouter.post('/addCampaign', auth, (req, res, next) => {
	const newCampaign = req.body.newCampaign;

	dynamodb.addCampaign(newCampaign)
		.then(
			(data) => {
				res.send({
					success: true
				})
			},
			(err) => {
				res.send({
					success: false,
					err
				})
			}
		)
});

campaignRouter.get('/campaignURLExists/:campaignURL', async (req, res, next) => {
	// check existing
	const campaignURL = req.params.campaignURL;

	dynamodb.getCampaign(campaignURL)
		.then(
			(data) => {
				if (data.Items.length == 1) {
					res.send({
						success: true
					});
				} else {
					res.send({
						success: false
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
		success: false,
		err: "auth failed"
	});
	return;
}

module.exports = campaignRouter;