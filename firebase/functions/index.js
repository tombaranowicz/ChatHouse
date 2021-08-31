/* eslint-disable indent */
/* eslint-disable quotes */
const functions = require('firebase-functions');
const StreamChat = require('stream-chat').StreamChat;

const STREAM_API_KEY = 'XXX';
const STREAM_SECRET = 'XXX';
const serverClient = StreamChat.getInstance(STREAM_API_KEY, STREAM_SECRET);

exports.onCreateUser = functions.firestore
  .document('Users/{userId}')
  .onCreate((snapshot, context) => {
    const userId = snapshot.data().userId;
    const token = serverClient.createToken(userId);
    return snapshot.ref.set({token}, {merge: true});
  });
