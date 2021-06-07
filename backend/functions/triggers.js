const functions = require("firebase-functions");
//const admin =require("./adminInit").admin
const db = require("./adminInit").db;
//const db = admin.firestore();

const msgTopic = "event"



function UpdateCounts(collectionName, counterName, isDelete) {
  console.log("called function UpdateDocumentCounts");
  var getCurrentMetadataPromise = db.doc("metadata/PpmSaO7W089QJuMBY9Md").get();
  return getCurrentMetadataPromise.then((snap) => {
    var curCount = snap.data()[counterName];
    console.log("get curCount ", curCount);
    if (curCount == -1) {
      var getCurrentDocumentsRef = db.collection(collectionName);
      getCurrentDocumentsRef.get().then((snap2) => {
        var newCount = snap2.docs.length;
        var item = {};
        item[counterName] = newCount;
        snap.ref.set(item, { merge: true });
      });
    } else {
      if (isDelete) curCount = curCount - 1;
      else curCount = curCount += 1;
      var item = {};
      item[counterName] = curCount;
      snap.ref.set(item, { merge: true });
    }
  });
}



exports.documentCreated = functions.firestore
  .document("documents/{docuId}")
  .onCreate((snap, context) => {
    console.log("called oncreate");
    return UpdateCounts("documents", "count_all_docu", false);
  });

exports.documentDeleted = functions.firestore
  .document("documents/{docuId}")
  .onDelete((snap, context) => {
    console.log("called ondelete");
    return UpdateCounts("documents", "count_all_docu", true);
  });

exports.imageCreated = functions.firestore
  .document("images/{docuId}")
  .onCreate((snap, context) => {
    console.log("called oncreate");
    return UpdateCounts("images", "count_all_img", false);
  });

exports.imageDeleted = functions.firestore
  .document("images/{docuId}")
  .onDelete((snap, context) => {
    console.log("called ondelete");
    return UpdateCounts("images", "count_all_img", true);
  });

exports.worksCreated = functions.firestore
  .document("works/{docuId}")
  .onCreate((snap, context) => {
    console.log("called oncreate");
    return UpdateCounts("works", "count_all_works", false);
  });

exports.worksDeleted = functions.firestore
  .document("works/{docuId}")
  .onDelete((snap, context) => {
    console.log("called ondelete");
    return UpdateCounts("works", "count_all_works", true);
  });
