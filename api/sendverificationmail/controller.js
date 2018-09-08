const sendGrid = require('sendgrid').mail;
const sg = require('sendgrid')(process.env.SEND_GRID_API_KEY);
var verifier = require('email-verify');
      var infoCodes = verifier.infoCodes;

const sendVerificationEmail = (to, token) => {
    const hostUrl = process.env.HOST_URL;
    const request = sg.emptyRequest({
      method: "POST",
      path: "/v3/mail/send",
      body: {
        personalizations: [
          {
            to: [
              {
                email: to
              }
            ],
            subject:"Verify Your Email"
          }
        ],
        from: {
          email: "no-reply@example.com"
        },
        content: [
            {
                type: 'text/plain',
                value: `Click on this link to verify your email ${hostUrl}/verification?token=${token}&email=${to}`
            }
        ]
      }
    });

    return new Promise(function (resolve, reject) {
      return verifier.verify( to, function( err, info ){
        if ( err ) {
          console.log(err);
          return reject(err);
        }
        else if (info.success) {
          sg.API(request, function (error, response) {
            if (error) {
              console.log(error);
            }
          });
          console.log( "Success (T/F): " + info.success );
          console.log( "Info: " + info.info );
          return resolve();
        } else {
          return reject(info.info);
        }
      });
    });
  };

  module.exports = sendVerificationEmail;