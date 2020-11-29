// const dotenv = require('dotenv');
// dotenv.config();
var AWS = require("aws-sdk");

AWS.config.update({
	region: "us-east-2",
	// endpoint: "http://localhost:8000"
	accessKeyId: process.env.AWS_ACCESS_KEY_ID,
	secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
});

var docClient = new AWS.DynamoDB.DocumentClient();

var dynamodb = new AWS.DynamoDB();


var adminUserDev = {
	name: "Usman Shery",
	email: "usman.shery@gmail.com",
	password: '$2b$10$i/mI4ziAhMKlV3Rk2cpuiOLZnNl02BBlE6p8aGYZ9SiFd60UgxBlu',
	role: "Developer Admin",
	contact: "03046468474",

	company: {
		name: "Freelancer",
		location: "Rawalpindi, Pakistan",
		postCode: 60000,
		country: "Pakistan",
		employeeSize: -1
	},

	admin: true,
	active: true
}

var adminUser = {
	name: "Umer",
	email: "efrtls@gmail.com",
	password: '$2b$10$i/mI4ziAhMKlV3Rk2cpuiOLZnNl02BBlE6p8aGYZ9SiFd60UgxBlu',
	role: "CEO",
	contact: "",

	company: {
		name: "Patronish",
		location: "London",
		postCode: -1,
		country: "UK",
		employeeSize: -1
	},

	admin: true,
	active: true
}

var newCampaign = {
	email: "usman.shery@gmail.com",
	campaignURL: "urltaken",
	name: "nametaken",
	duration: 120,
	intro: "intro of taken",
	startdate: new Date().getTime(),
	enddate: new Date().getTime(),
	questions: []
}

var altCampaign = {
	email: "usman.shery@gmail.com",
	campaignURL: "alt_urltaken",
	name: "alt_nametaken",
	duration: 120,
	intro: "alt_intro of taken",
	startdate: new Date().getTime(),
	enddate: new Date().getTime(),
	questions: ["alt"]
}

function createTable() {
	var userTableParams = {
		TableName: "user",
		KeySchema: [
			{ AttributeName: "email", KeyType: "HASH" }  //Partition key
		],
		AttributeDefinitions: [
			{ AttributeName: "email", AttributeType: "S" }
		],
		ProvisionedThroughput: {
			ReadCapacityUnits: 10,
			WriteCapacityUnits: 10
		}
	};

	var campaignTableParams = {
		TableName: "campaign",
		KeySchema: [
			{ AttributeName: "campaignURL", KeyType: "HASH" }  //Partition key
		],
		AttributeDefinitions: [
			{ AttributeName: "campaignURL", AttributeType: "S" }
		],
		ProvisionedThroughput: {
			ReadCapacityUnits: 10,
			WriteCapacityUnits: 10
		}
	};

	dynamodb.createTable(userTableParams, function (err, data) {
		if (err) {
			console.error("Unable to create table. Error JSON:", JSON.stringify(err, null, 2));
		} else {
			console.log("Created table. Table description JSON:", JSON.stringify(data, null, 2));
		}
	});

	dynamodb.createTable(campaignTableParams, function (err, data) {
		if (err) {
			console.error("Unable to create table. Error JSON:", JSON.stringify(err, null, 2));
		} else {
			console.log("Created table. Table description JSON:", JSON.stringify(data, null, 2));
		}
	});
}

function addUser(user) {
	var params = {
		TableName: "user",
		Item: {
			...user
		}
	};
	return docClient.put(params).promise();
}

function getUser(email) {
	var params = {
		TableName: "user",
		Key: {
			email
		}
	};

	return docClient.get(params).promise();
}

function getAllUsers() {
	var params = {
		TableName: "user"
	};

	return docClient.scan(params).promise();
}

async function updateUser(email, altUser) {
	// add new user
	// after adding new uuser delete old one if key(email) changed
	var addUserParams = {
		TableName: "user",
		Item: altUser
	};

	if (email === altUser.email)
		return docClient.put(addUserParams).promise();

	await docClient.put(addUserParams).promise();

	var removeUserParams = {
		TableName: "user",
		Key: {
			email
		}
	};

	return docClient.delete(removeUserParams).promise();
}

function removeUser(email) {
	var params = {
		TableName: "user",
		Key: {
			email
		}
	};

	return docClient.delete(params).promise();
}

// campaign
function addCampaign(newCampaign) {
	var params = {
		TableName: "campaign",
		Item: newCampaign,
		ConditionExpression: "attribute_not_exists(campaignURL)",
	};

	return docClient.put(params).promise();
}

function getAllCampaigns(email) {
	var params = {
		TableName: "campaign",
		FilterExpression: "#email = :email",
		ExpressionAttributeNames: {
			"#email": "email"
		},
		ExpressionAttributeValues: {
			":email": email
		}
	};

	return docClient.scan(params).promise();
}

async function getAllCampaignsAsync(email) {
	return new Promise((resolve, reject) => {
		var params = {
			TableName: "campaign",
			FilterExpression: "#email = :email",
			ExpressionAttributeNames: {
				"#email": "email"
			},
			ExpressionAttributeValues: {
				":email": email
			}
		};
		docClient.scan(params, (err, data) => {
			if(err) reject(err);
			resolve(data);
		});
	});

	
}

function getCampaign(campaignURL) {
	var params = {
		TableName: "campaign",
		FilterExpression: "#url = :url",
		ExpressionAttributeNames: {
			"#url": "campaignURL"
		},
		ExpressionAttributeValues: {
			":url": campaignURL
		}
	};

	return docClient.scan(params).promise();
}

async function updateCampaign(campaignURL, altCampaign) {
	// add new item
	// after adding new item delete old one
	var addItemParams = {
		TableName: "campaign",
		Item: altCampaign
	};

	if (campaignURL === altCampaign.campaignURL)
		return docClient.put(addItemParams).promise();

	await docClient.put(addItemParams).promise();

	var removeItemParams = {
		TableName: "campaign",
		Key: {
			campaignURL
		}
	};

	return docClient.delete(removeItemParams).promise();
}

function removeCampaign(campaignURL) {
	var params = {
		TableName: "campaign",
		Key: {
			campaignURL
		}
	};

	return docClient.delete(params).promise();
}



// other helper functions 
function getRandomString(length) {
	var randomChars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
	var result = '';
	for (var i = 0; i < length; i++) {
		result += randomChars.charAt(Math.floor(Math.random() * randomChars.length));
	}
	return result;
}

function getTimeDifference(diffMillis){
	return diffMillis/1000/60/60;
}

module.exports.getRandomString = getRandomString;
module.exports.getTimeDifference = getTimeDifference;


module.exports.addUser = addUser;
module.exports.getUser = getUser;
module.exports.getAllUsers = getAllUsers;
module.exports.updateUser = updateUser;
module.exports.removeUser = removeUser;

module.exports.addCampaign = addCampaign;
module.exports.getAllCampaigns = getAllCampaigns;
module.exports.getAllCampaignsAsync = getAllCampaignsAsync;
module.exports.getCampaign = getCampaign;
module.exports.updateCampaign = updateCampaign;
module.exports.removeCampaign = removeCampaign;



// createTable();
// addUser(adminUserDev);
// addUser(adminUser);



// updateCampaign("urltaken", altCampaign).then( (data, err) => { if (err) { console.log("error: ", err); return; }console.log("data: ", data);});

// getAllCampaigns("usman.shery@gmail.com").then((data, err) => { if (err) { console.log("error: ", err); return; } console.log("campaigns: ", data.Items); });

// removeCampaign("alt_urltaken").then((data, err) => { if(err){ console.log("error: ", err);}  else if(data){ console.log("Data: ", data);}else{ console.log("nothing ?"); }});
// removeCampaign("alt_urltaken").then((data, err) => { if(err){ console.log("error: ", err);}  else if(data){ console.log("Data: ", data);}else{ console.log("nothing ?"); }});

// getAllUsers().then((data, err) => { if (err) { console.log("error: ", err);return; } console.log("users: ", data.Items);});
// removeUser("dave@gmail.com");
// createTable();

// addUser(user);

// addCampaign(newCampaign);

// addCampaign(altCampaign);



// getAllUsers().then((data, err) => {
// 	if (err) {
// 		console.log("error: ", err);
// 		return;
// 	}
// 	console.log("users: ", data.Items);
// });

// getUser("xusman.shery@gmail.com").then((data, err) => {
// 	if (err) {
// 		console.log("error: ", err);
// 		return;
// 	}
// 	console.log("users: ", data);
// });


// updateCampaignByUserEmail("usman.shery@gmail.com", "urltaken", altCampaign).then((data, err) => {
// 	if(err){
// 		console.log("error: ", err);
// 	}
// 	else if(data){
// 		console.log("Data: ", data);
// 	}else{
// 		console.log("nothing ?");
// 	}
// });


// removeCampaign("alt_urltaken").then((data, err) => {
// 	if(err){
// 		console.log("error: ", err);
// 	}
// 	else if(data){
// 		console.log("Data: ", data);
// 	}else{
// 		console.log("nothing ?");
// 	}
// });



// removeUserByEmail("usman.shery@gmail.com").then((data, err) => {
// 	if (err) {
// 		console.log("error: ", err);
// 		return;
// 	}
// 	console.log("data: ", data);
// });

// console.log("1 query result: ", ret);

// ret = getUserByEmail("invalid_email.com");
// console.log("2 query result: ", ret);