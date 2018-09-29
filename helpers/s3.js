const fs = require('fs');
const AWS = require('aws-sdk');

const s3 = new AWS.S3({
    accessKeyId: process.env.AWS_ACCESS_KEY,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
});

const uploadFile = (key) => {
  fs.readFile(fileName, (err, data) => {
     if (err) throw err;
     const params = {
         Bucket: process.env.S3_BUCKET, // pass your bucket name
         Key: key, // file will be saved as testBucket/contacts.csv
         Body: JSON.stringify(data, null, 2),
         ACL:'public-read'
     };
     s3.upload(params, function(s3Err, data) {
         if (s3Err) throw s3Err
         console.log(`File uploaded successfully at ${data.Location}`)
     });
  });
};

module.exports = {
    uploadFile: uploadFile
};