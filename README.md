#Testgen-web

Testgen web acts as a web-frontend for running the testgen test suite

The backend is written in [Node.js](https://nodejs.org) using [Express.js](http://expressjs.com/) and [MongoDB](https://www.mongodb.org/)

The frontend uses [jQuery](https://jquery.com/) and [bootstrap](http://getbootstrap.com)

##Prerequisites

* Testgen cli tool
* `clang` for compiling C source code. [To use GCC](#gcc)
* Node (Tested with 0.10.x)
* A MongoDB instance with a database called `Testgen`

##Setup

* Clone the repo

        git clone https://github.com/asthas/Testgen-web

* Setup the Testgen cli tool

* Copy the Testgen files inside the root of the Testgen-web folder

* Install the node dependencies

        npm install

##Run

        npm start

[Navigate to port 3000](http://localhost:3000)

#GCC

To use the gcc compiler instead of clang, simply change `clang` in [this line](https://github.com/asthas/Testgen-web/blob/master/app.js#L111) to `gcc`

Developed By
============

* Astha Sharma - <a@astha.me>
