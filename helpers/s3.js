const fs = require('fs');
const AWS = require('aws-sdk');

const s3 = new AWS.S3({
    accessKeyId: process.env.AWS_ACCESS_KEY,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
});

const base64MimeType = (encoded) => {
    var result = null;
  
    if (typeof encoded !== 'string') {
      return result;
    }
  
    var mime = encoded.match(/data:([a-zA-Z0-9]+\/[a-zA-Z0-9-.+]+).*,.*/);
  
    if (mime && mime.length) {
      result = mime[1];
    }
  
    return result;
}

const uploadFile = (key, data, type, ContentType, ContentEncoding) => {
//   fs.readFile(file, (err, data) => {
//      if (err) throw err;

    // Getting the file type, ie: jpeg, png or gif
    return new Promise((resolve, reject) => {
        const params = {
            Bucket: process.env.S3_BUCKET,
            Key: `${key}.${type}`, // type is not required
            Body: data,
            ACL: 'public-read',
            ContentEncoding: ContentEncoding, // required
            ContentType: ContentType // required. Notice the back ticks
        }
        s3.upload(params, function(s3Err, data) {
            if (s3Err) throw s3Err
            console.log(`File uploaded successfully at ${data.Location}`)
            return resolve();
        });
    })
//   });
};

module.exports = {
    uploadFile: uploadFile,
    base64MimeType: base64MimeType
};