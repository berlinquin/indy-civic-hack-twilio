var request = require('request-promise-native')

var url = 'https://gateway.watsonplatform.net/natural-language-understanding/api/v1/analyze?version=2017-02-27';

var isPositive = function(text) {
  var requestBody = {
  "text": text,
  "features": {
    "sentiment": {}
    },
    "language": "en"
};

  return request.post({
    uri: url,
    body: requestBody,
    language: 'en',
    auth: {
      user: process.env.WATSON_USER,
      password: process.env.WATSON_PASS
    },
    json: true
  })
  .then(response => {
    // console.log('got this response from watson: ', response)
    return response.sentiment.document.label === 'positive'
  })
}

module.exports.isPositive = isPositive
