# squatch
Watch an SQS queue and echo out the messages.

## Getting started

1. Install [nodeJS](https://nodejs.org)
2. Clone this repository
```
git clone https://github.com/HaroldPutman/squatch.git
```
3. Install
```
cd squatch
npm install
```
4. Configure `.env` file
5. Run
```
npm start
```

## What happens
Messages are pulled from the queue and echoed to the console. Each message
is removed after being printed. It will continue waiting for messages for
up to one hour. Press <kbd>Ctrl-C</kbd> to quit.
