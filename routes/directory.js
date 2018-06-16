'use strict';

var express = require('express')
  , router = express.Router()
  , twilio = require('twilio')
  , employeeFinder = require('../lib/employee-finder')
  , userFinder = require('../lib/user-finder')
  , _ =  require('underscore')
  , twimlGenerator = require('../lib/twiml-generator')
  , watson = require('../lib/watson');

// run once to reset my interaction
userFinder.deleteUserByNumber('+15672678038')

// POST /directory/test
router.post('/test/', function(req, res, next) {
  try {
    var body = req.body;
    var msg = body.Body.toLowerCase().trim()
    var userPhone = body.From
    console.log('got this body: ', body)
    console.log('parsed this phone: ', userPhone)

    res.type('text/xml');

    var user = userFinder.findByNumber(userPhone, function(err, user) {
      if (err) {
        throw 'ERROR FINDING USER BY NUMBER'
      }
      if (user === null) {
        userFinder.createUserByNumber(userPhone)
        res.send(twimlGenerator.welcome().toString())
      }
      else {
        watson.isPositive(msg)
        .then(sentiment => {
          console.log('got this response from watson: ', sentiment)
          nextStage(user, sentiment, res)
        })
        .catch(err => {
          console.log('caught this watson error: ', err)
        })
      }
    })
  }
  catch(err) {
    console.log(err)
  }
})

function nextStage(user, sentiment, res) {
  var stage = user.stage;
  console.log('got user in this stage: ', stage)
  if (stage === 'welcome') {
    userFinder.updateStage(user, 'check-disabled')
    res.send(twimlGenerator.checkDisabled().toString());
  } else {
    console.log('no match for stage :', stage)
  }
}

// POST /directory/search/
router.post('/search/', function(req, res, next) {
  var body = req.body.Body;
  res.type('text/xml');

  if (req.cookies.cachedEmployees !== undefined && !isNaN(body)) {
    var cachedEmployees = req.cookies.cachedEmployees;
    var employeeId = cachedEmployees[body];
    if (employeeId === undefined) {
      res.send(twimlGenerator.notFound().toString());
    } else {
      employeeFinder.findById(employeeId, function(err, employee) {
        res.clearCookie('cachedEmployees');
        res.send(twimlGenerator.singleEmployee(employee).toString());
      });
    }
  } else {
    employeeFinder.findByName(body, function(err, employees) {
      if (employees.length === 0) {
        res.send(twimlGenerator.notFound().toString());
      } else if (employees.length === 1) {
        res.send(twimlGenerator.singleEmployee(employees[0]).toString());
      } else {
        var options = _.map(employees, function(it, index) {
          return { option: index + 1, fullName: it.fullName, id: it.id };
        });
        var cachedEmployees = _.object(_.map(options, function(it) { return [it.option, it.id]; }));
        res.cookie('cachedEmployees', cachedEmployees, { maxAge: 1000 * 60 * 60 });

        res.send(twimlGenerator.multipleEmployees(options).toString());
      }
    });
  }
});

module.exports = router;
