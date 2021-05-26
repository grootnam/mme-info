const functions = require("firebase-functions");
//const admin =require("./adminInit").admin

//const db = admin.firestore();
const db=require("./adminInit").db

exports.getAllDocuments = functions.https.onRequest((request, response) => {
    var docusRef=db.collection('documents');
    var query=docusRef.get();
    return query.then((snap)=>{
        response.status(200).send(snap.docs.map(doc => doc.data()))
    });
  });

exports.getDocumentById = functions.https.onRequest((request, response) => {
    console.log('query : ',request.query)
    var possibleId=Number(request.query.id)
    var worksRef=db.collection('documents');
    var query = worksRef.where("index", "==", possibleId)
    return query.get().then((snap)=>{
        response.status(200).send(snap.docs.map(doc => doc.data()))
    });
  });

exports.getWorksById=functions.https.onRequest((request, response) =>{
    //console.log(request)
    console.log('query : ',request.query)
    var possibleId=Number(request.query.id)
    var worksRef=db.collection('works');
    var query = worksRef.where("usedby", "==", possibleId)
    return query.get().then((snap)=>{
        response.status(200).send(snap.docs.map(doc => doc.data()))
    });
})

exports.getImagesById=functions.https.onRequest((request, response) =>{
    //console.log(request)
    console.log('query : ',request.query)
    var possibleId=Number(request.query.id)
    var worksRef=db.collection('images');
    var query = worksRef.where("usedby", "==", possibleId)
    return query.get().then((snap)=>{
        response.status(200).send(snap.docs.map(doc => doc.data()));
    });
})