const dynamodb = require('../database/dynamodb');

// add user
function removeUserTest() {
	dynamodb.addUser(
		{
			name: "test user",
			email: "test@test.com",
			password: '$2b$10$i/mI4ziAhMKlV3Rk2cpuiOLZnNl02BBlE6p8aGYZ9SiFd60UgxBlu',
			role: "test",
			contact: "123",

			company: {
				name: "test",
				location: "test",
				postCode: -1,
				country: "test",
				employeeSize: -1
			},

			admin: false,
			active: true
		}
	)
	.then((d, e) => {
		if (e) {
			console.log("add user catch: ", err);
		}
		return dynamodb.addCampaign(
			{
				email: "test@test.com",
				campaignURL: "test url 1",
				name: "nametaken",
				duration: 120,
				intro: "intro of taken",
				startdate: new Date().getTime(),
				enddate: new Date().getTime(),
				questions: []
			}
		)
	})
	.then((d) => {
		console.log("campaign 1 added");
	}, (err) => { console.log("first campaign exists"); })

	.then(() => {
		return dynamodb.addCampaign(
			{
				email: "test@test.com",
				campaignURL: "test url 2",
				name: "nametaken",
				duration: 120,
				intro: "intro of taken",
				startdate: new Date().getTime(),
				enddate: new Date().getTime(),
				questions: []
			}
		)
	})
	.then((d) => {
		console.log("campaign 2 added");
	}, (err) => { console.log("second campaign exists"); })

	.then(() => {
		return dynamodb.addCampaign(
			{
				email: "test@test.com",
				campaignURL: "test url 3",
				name: "nametaken",
				duration: 120,
				intro: "intro of taken",
				startdate: new Date().getTime(),
				enddate: new Date().getTime(),
				questions: []
			}
		)
	})
	.then((d) => {
		console.log("campaign 3 added");
	}, (err) => { console.log("third campaign exists"); })

	.then(
		async () => {
			console.log("After adding data: ");
			await dynamodb.getAllUsers().then((data, err) => { if (err) { console.log("error: ", err); return; } console.log("users: ", data.Items); });
			await dynamodb.getAllCampaigns("test@test.com").then((data, err) => { if (err) { console.log("error: ", err); return; } console.log("campaigns: ", data.Items); });
		}
	)

	// // test removing
	.then(() => {
		dynamodb.removeUser("test@test.com")
			.then((data) => {
				console.log("remove user result: ", data);
				dynamodb.getAllCampaigns("test@test.com")
					.then(
						async (data) => {
							// delete each campaign
							const campaigns = data.Items;

							for await (const campaign of campaigns) {
								dynamodb.removeCampaign(campaign.campaignURL);
							}

							// campaigns.forEach(async (campaign) => {});
						},
						(err) => { console.log("get all campaigns error: ", err); }
					)
					.then(
						async () => {
							console.log("After removing data: ");
							await dynamodb.getAllUsers().then((data, err) => { if (err) { console.log("error: ", err); return; } console.log("users: ", data.Items); });
							await dynamodb.getAllCampaigns("test@test.com").then((data, err) => { if (err) { console.log("error: ", err); return; } console.log("campaigns: ", data.Items); });
						}
					)
			}, (err) => { console.log("Remove user error: ", err); });
	})
}

function addDummyData(){
	dynamodb.addUser(
		{
			name: "test user",
			email: "test@test.com",
			password: '$2b$10$i/mI4ziAhMKlV3Rk2cpuiOLZnNl02BBlE6p8aGYZ9SiFd60UgxBlu',
			role: "test",
			contact: "123",
	
			company: {
				name: "test",
				location: "test",
				postCode: -1,
				country: "test",
				employeeSize: -1
			},
	
			admin: false,
			active: true
		}
	)
	.then((d, e) => {
		if (e) {
			console.log("add user catch: ", err);
		}
		return dynamodb.addCampaign(
			{
				email: "test@test.com",
				campaignURL: "test url 1",
				name: "nametaken",
				duration: 120,
				intro: "intro of taken",
				startdate: new Date().getTime(),
				enddate: new Date().getTime(),
				questions: []
			}
		)
	})
	.then((d) => {
		console.log("campaign 1 added");
	}, (err) => { console.log("first campaign exists"); })
	
	.then(() => {
		return dynamodb.addCampaign(
			{
				email: "test@test.com",
				campaignURL: "test url 2",
				name: "nametaken",
				duration: 120,
				intro: "intro of taken",
				startdate: new Date().getTime(),
				enddate: new Date().getTime(),
				questions: []
			}
		)
	})
	.then((d) => {
		console.log("campaign 2 added");
	}, (err) => { console.log("second campaign exists"); })

	.then(() => {
		return dynamodb.addCampaign(
			{
				email: "unrelated_test@test.com",
				campaignURL: "unrelated_ test url x",
				name: "nametaken",
				duration: 120,
				intro: "intro of taken",
				startdate: new Date().getTime(),
				enddate: new Date().getTime(),
				questions: []
			}
		)
	})
	.then((d) => {
		console.log("campaign unrelated added");
	}, (err) => { console.log("campaign unrelated exists"); })

	.then(() => {
		return dynamodb.addCampaign(
			{
				email: "test@test.com",
				campaignURL: "campaign_update_test",
				name: "nametaken",
				duration: 120,
				intro: "intro of taken update",
				startdate: new Date().getTime(),
				enddate: new Date().getTime(),
				questions: []
			}
		)
	})
	.then((d) => {
		console.log("campaign for update test added");
	}, (err) => { console.log("campaign for update test exists"); })
}

function testGetCampaignByURL(){
	dynamodb.addCampaign({
			email: "get_campaign_by_url_test@test.com",
			campaignURL: "get_campaign_by_url_test",
			name: "nametaken",
			duration: 120,
			intro: "intro of taken",
			startdate: new Date().getTime(),
			enddate: new Date().getTime(),
			questions: []
		}
	)

	.then(
		(data) => {
			console.log("Add campaign result data: ", data);
		}, 
		(err) => {
			console.log("campaign already exists");
		}
	)

	.then(
		() => {
			return dynamodb.getCampaign("get_campaign_by_url_test");
		}
	)
	.then(
		(data) => {
			console.log("Get campaign by url result data: ", data);
		},
		(err) => {
			console.log("Get campaign by url error: ", err);
		}
	)

	.then(
		() => dynamodb.removeCampaign("get_campaign_by_url_test")
	)

	.then(
		(data) => console.log("cleanup successful"),
		(err) => console.log("cleanup error: ", err)
	)
}

// addDummyData();
testGetCampaignByURL();