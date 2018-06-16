var request = require('request-promise-native')

var url = 'https://gateway.watsonplatform.net/natural-language-understanding/api/v1/analyze?version=2017-02-27';

var buildRequestBody = function(text) {
  return {
    "text": text,
    "features": {
      "sentiment": {}
    },
    "language": "en"
  }
}

var isPositive = function(text) {
  var requestBody = buildRequestBody(text)
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

var getNumber = function(number) {
  var num = Number(number.trim())
  return Promise.resolve(num)
}

module.exports.isPositive = isPositive;
module.exports.getNumber = getNumber;
