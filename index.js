'use strict';

/**
 * Environment variables (specified in file .env):
 * AWS_ACCESS_KEY_ID=
 * AWS_SECRET_ACCESS_KEY=
 * AWS_DEFAULT_REGION=us-west-2
 * SQS_ROLE=arn:aws:iam::778728673805:role/ProductUpdatesRole
 * SQS_QUEUE=https://sqs.us-west-2.amazonaws.com/778728673805/my-queue.fifo
 */
require('dotenv').config();
const AWS = require('aws-sdk');
const async = require('async');

if (process.env['SQS_ROLE']) {
  const sts = new AWS.STS();
  sts.assumeRole({
    DurationSeconds: 3600,
    RoleArn: process.env['SQS_ROLE'],
    RoleSessionName: 'squatch'
  }, (err, data) =>{
    if (err) {
      console.log(err, err.stack);
    } else {
      console.log('Authenticated ...');
      // Update the credentials
      AWS.config.update({
        credentials: new AWS.Credentials(
          data.Credentials.AccessKeyId,
          data.Credentials.SecretAccessKey,
          data.Credentials.SessionToken
        )
      });
      receiveMessages();
    }
  });
} else {
  receiveMessages();
}

function receiveMessages() {
  const sqs = new AWS.SQS({
    apiVersion: '2012-11-05',
    endpoint: process.env['SQS_QUEUE']
  });
  console.log('Waiting for messages ...');
  async.forever((next)=> {
    sqs.receiveMessage({
      QueueUrl: process.env['SQS_QUEUE'],
      WaitTimeSeconds: 3,
      AttributeNames: ['All']
    }, (err, msg) => {
      if (err) {
        next(err);
      } else if (msg.Messages) {
        process.stdout.write('\n');
        for (const message of msg.Messages) {
          console.log(JSON.parse(message.Body));
          sqs.deleteMessage({
            QueueUrl: process.env['SQS_QUEUE'],
            ReceiptHandle: message.ReceiptHandle
          }, (err, data) => {
            if (err) {
              next(err);
            } else {
              data;
              console.log('---');
              next();
            }
          });
        }
      } else {
        // No messages left
        process.stdout.write('.');
        next();
      }
    });
  }, (err) => {
    console.log(err, err.stack);
  });
}
