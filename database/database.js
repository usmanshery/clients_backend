// database
var idcounter = 100;
let db = [
	{
		id: 1,
		companyName: "Patronish",
		location: "UK",
		postCode: -1,
		country: "UK",
		employeeSize: -1,
		contactPersonName: "Usman Shery",
		contactPersonEmail: "usman.shery@gmail.com",
		contactPersonRole: "Developer Admin",
		contactPersonNumber: "0123456789",
		password: '$2b$10$i/mI4ziAhMKlV3Rk2cpuiOLZnNl02BBlE6p8aGYZ9SiFd60UgxBlu',
		admin: true,
		active: true,
		campaigns: [
			{
				id: 0,
				name: "nametaken",
				duration: 120,
				url: "urltaken",
				intro: "intro of taken",
				startdate: new Date().getTime(),
				enddate: new Date().getTime(),
				questions: []
			}
		]
	}
];


function getUserByEmail(email) {
	return db.find(user => user.contactPersonEmail === email);
}

function getAllUsers() {
	return db.filter(user => !user.admin).map((user) => { return { ...user, password: "" } });
}

function addUser(newUser) {
	// validate essential fields
	if (db.filter((user) => user.contactPersonEmail === newUser.contactPersonEmail).length == 1) {
		return false;
	}

	user = {
		...newUser,
		id: idcounter,
		admin: false
	}

	idcounter++;
	db.push(user);
	return true;
}

function getRandomString(length) {
	var randomChars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
	var result = '';
	for (var i = 0; i < length; i++) {
		result += randomChars.charAt(Math.floor(Math.random() * randomChars.length));
	}
	return result;
}

function updateUser(altUser) {
	if (db.filter((user) => user.id === altUser.id).length != 1) {
		return false;
	}

	db.splice(db.findIndex((user) => user.id === altUser.id), 1, altUser);
	return true;
}

function removeUser(altUser) {
	if (db.filter((user) => user.id === altUser.id).length != 1) {
		return false;
	}

	db.splice(db.findIndex((user) => user.id === altUser.id), 1);
	return true;
}

// campaigns
function getAllCampaignsByUserId(userId) {
	let user = db.find(user => user.id === userId);
	if (!user) {
		return null;
	}
	return user.campaigns;
}

function addCampaignByUserId(userId, newCampaign) {
	// validate essential fields	
	let user = db.find(user => user.id === userId);
	if (!user) {
		return false;
	}
	
	user.campaigns.push({
		id: idcounter++,
		...newCampaign
	});
	return true;
}

function updateCampaignByUserId(userId, campaignId, altCampaign) {
	// validate essential fields

	let user = db.find(user => user.id === userId);
	if (!user) {
		return false;
	}

	// exists
	if (user.campaigns.filter((campaign) => campaign.id === campaignId).length != 1) {
		return false;
	}

	user.campaigns.splice(user.campaigns.findIndex((campaign) => campaign.id === campaignId), 1, altCampaign);
	return true;
}

function removeCampaignByUserId(userId, campaignId) {
	let user = db.find(user => user.id === userId);
	if (!user) {
		return false;
	}
	// exists
	if (user.campaigns.filter((campaign) => campaign.id === campaignId).length != 1) {
		return false;
	}
	user.campaigns.splice(user.campaigns.findIndex((campaigns) => campaigns.id === campaignId), 1);
	return true;
}


module.exports.getRandomString = getRandomString;

module.exports.addUser = addUser;
module.exports.updateUser = updateUser;
module.exports.getUserByEmail = getUserByEmail;
module.exports.getAllUsers = getAllUsers;
module.exports.removeUser = removeUser;

module.exports.getAllCampaignsByUserId = getAllCampaignsByUserId;
module.exports.addCampaignByUserId = addCampaignByUserId;
module.exports.updateCampaignByUserId = updateCampaignByUserId;
module.exports.removeCampaignByUserId = removeCampaignByUserId;
