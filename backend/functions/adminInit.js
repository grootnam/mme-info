const curAdmin = require('firebase-admin');
curAdmin.initializeApp();
//export const admin=curAdmin 
exports.db = curAdmin.firestore()