[![Build Status](https://travis-ci.org/jboffel/AgilePoker.svg?branch=master)](https://travis-ci.org/jboffel/AgilePoker)
[![Coverage Status](https://coveralls.io/repos/github/jboffel/AgilePoker/badge.svg?branch=master)](https://coveralls.io/github/jboffel/AgilePoker?branch=master)
[![Dependency Status](https://gemnasium.com/jboffel/AgilePoker.svg)](https://gemnasium.com/jboffel/AgilePoker)

# AgilePoker
Just a proof of concept using nodejs/express and socket.io to create an Scrum Poker system.

You will just need npm and nodejs on a machine to run the application.

It uses express, socket.io, html5 canvas to power its features.

You can follow the estimation process as an Engineer (16 people max) or as a Scrum Master (1 person max) or as a spectator (unlimited).

Engineer can only send their estimation through for form.

Scrum Master can start new estimation and reveal score when all connected Engineer have sent their estimation.

Spectator can only look at the show.

You don't need to create users, there are no storage system.

Login and Email are only ask to differentiate people on the poker table by name and picture (only the md5 of the mail is being sent to the server and other members).

The picture come from your Gravatar. If you don't have one you can still put your email to pass the login phase, you'll just get the default Gravatar picture.

## Use case
This application has not been made to solve the problem when the team can not communicate to each other at the time of the estimation.

In my case we are all in video conference. But it is not easy actually to gather everyone result at same time so it mostly end generally in other part of the team on video conference agree on a number and give it as a team.
However Scrum process expect all engineer to give an individual number decided on their own based on their understanding. At least for the first estimation.

So that application is helping that by avoiding the use of physical cards and by giving an easy and a little distracting way of sending individually their estimation. Nothing more.

## Deploy and start
Depends on your server permission, deployment and start up can be very simple.

Assuming you have internet access already and that nodejs and npm are available in your path.

If you are root:

1. git clone https://github.com/jboffel/AgilePoker.git agilePoker
2. cd agilePoker
3. npm install
4. PORT=80 node ctrl.js start
