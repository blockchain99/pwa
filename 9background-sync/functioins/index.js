//const functions = require('firebase-functions');
var functions = require('firebase-functions');
var admin = require('firebase-admin');
//can access http end poiint fm application running on different svr
var cors = require('cors')({origin: true}); //allow cross origin access
// // Create and Deploy Your First Cloud Functions
// // https://firebase.google.com/docs/functions/write-firebase-functions
//
//exports.storePostData = functions.https.onRequest((request, response) => {
/* func( cors..)excuted when reached this end point(storePostData)
enalbes cross origin access of sending right header cross origin (cors)*/
/*outer function handle request, response arg, so inner func() no need args.  */
var serviceAccount = require("./pwaSS-key.json");
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  //  databaseURL: 'https://pwass-118e7.firebaseio.com/'
  databaseURL: 'https://pwass-118e7.firebaseio.com'
});
exports.storePostData = functions.https.onRequest(function(request, response) {
 cors(request, response, function() {
   admin.database().ref('posts').push({
     id: request.body.id,
     title: request.body.title,
     location: request.body.location,
     image: request.body.image
   })
     .then(function() {
       response.status(201).json({message: 'Data stored', id: request.body.id});
     })
     .catch(function(err) {
       response.status(500).json({error: err});
     });
 });
});
