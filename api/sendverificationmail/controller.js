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
                type: 'text/html',
                value: `Click <a href="${hostUrl}/verification?token=${token}&email=${to}">here</a> to verify your email.
                <p>Please ignore this email if you have not registered to Ads App</p>`
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