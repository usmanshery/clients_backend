var AWS = require("aws-sdk");

// videos
AWS.config.update({
	region: process.env.BUCKET_REGION,
	// credentials: new AWS.CognitoIdentityCredentials({
	// 	IdentityPoolId: process.env.BUCKET_ACCESS_ID
	// })
	accessKeyId: process.env.BUCKET_ACCESS_KEY_ID,
	secretAccessKey: process.env.BUCKET_SECRET_ACCESS_KEY
});

var s3 = new AWS.S3({
	apiVersion: "2006-03-01",
	params: { Bucket: process.env.BUCKET_NAME }
});

function getVideosList(campaignUrl, cb) {
	s3.listObjects({ Prefix: campaignUrl + "/" }, function(err, data){
		if(err){
			cb("Server error", undefined);
			return;
		}
		else{
			if(!data.Contents || data.Contents.length == 0){
				cb("No videos found", undefined);
				return;
			}
			const keyUrlPairs = data.Contents.map((video) => { 
				return {
					key: video.Key,
					url: "https://" + process.env.BUCKET_NAME + ".s3." + process.env.BUCKET_REGION + ".amazonaws.com/" + video.Key
				}
			});
			cb(undefined, keyUrlPairs);
			// getSignedUrls(keys).then(
			// 	(keyUrlPairs) => cb(undefined, keyUrlPairs)
			// );
		}
	});
}

async function getSignedUrl(key) {
	return new Promise((resolve, reject) => {
		let params = { Bucket: process.env.BUCKET_NAME, Key: key };
		s3.getSignedUrl('getObject', params, (err, url) => {
			if (err) reject(err)
			resolve(url);
		})
	});
}

async function getSignedUrls(keys) {
	const keyUrlPairs = [];
	for (let key of keys) {
		const signedUrl = await getSignedUrl(key);
		keyUrlPairs.push({
			key,
			url: signedUrl
		});
		// item.url = signedUrl;
	}
	return keyUrlPairs;
}

function removeVideo(videoKey, cb) {
	var params = {
		Bucket: process.env.BUCKET_NAME,
		Key: videoKey
	};
	s3.deleteObject(params, cb);
}

module.exports.getVideosList = getVideosList;
// module.exports.getVideoUrl = getVideoUrl;
module.exports.removeVideo = removeVideo;
