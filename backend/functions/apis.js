const functions = require("firebase-functions");
const admin =require("firebase-admin")
const db = require("./adminInit").db;
const { firestore } = require("firebase-admin");
const cors = require("cors")({ origin: true });

const msgTopic = "event"

exports.sendMessageStringOnly = functions.https.onRequest((request, response) =>{
  return cors(request, response, ()=>{
    var jsn = JSON.parse(String(request.body))
    var msg = 'msgtest '+ String(jsn["message"])
    var message = {
      "topic": msgTopic,
      "notification": {
        "title": "Background Message Title",
        "body": msg
      },
      "webpush": {
        "fcm_options": {
          "link": "https://dummypage.com"
        }
      },
      data: {
        message : msg
      }
    }
    return admin.messaging().send(message).then((response2) => {
        response.status(200).send({
          success: true,
        });
        return
      }, (reason)=>{
        response.status(405).send(reason);
        return
      })
      .catch((error) => {
        response.status(405).send(error);
        return
      });
  })
})

exports.sendToken=functions.https.onRequest((request, response)=>{
  cors(request,response,()=>{
    var body = request.body
    var token = body["token"]
    var tokenRef=db.collection('tokens');
    return tokenRef.where("token", "==", token).get().then((snap)=>{
      if(snap.size<=0){
        return tokenRef.doc().set({
          token : body.token
        }).then((result)=>{
          admin.messaging().subscribeToTopic(token, msgTopic).then((res)=>{
          }).catch((err)=>{
            response.status(405).send(err);
          })
          response.status(200).send({
            success: true,
          });
        }, (reason)=>{
          response.status(405).send(reason);
        })
      }
      else{
        response.status(200).send({
          success: true,
        });
      }
    })
  });
});

exports.postData =  functions.https.onRequest((request, response) => {
  return cors(request, response, () => {
    var body = request.body;
    console.log('postData get body : ',body)
    var indexName="";
    var collectionName="";

    if(body.type == 'qna'){
      indexName = "qna_last_index"
      collectionName = "qnas"
    }
    else if(body.type == 'notice'){
      indexName = "notice_last_index"
      collectionName = "notices"
    }
    else if(body.type == 'schedule'){
      indexName="schedule_last_index"
      collectionName="schedules"
      body["start"] = firestore.Timestamp.fromDate(body["start"])
      body["end"] = firestore.Timestamp.fromDate(body["end"])

      console.log('altered body : ',body)
    }
    else{
      response.status(405).send({
        message : 'write data type ! '
      });
    }

    var getCurrentMetadataPromise = db
      .doc("metadata/PpmSaO7W089QJuMBY9Md")
      .get();
    getCurrentMetadataPromise.then((snap) => {
      var index = snap.data()[indexName];
      var dbRef = db.collection(collectionName);

      var newData=body.data;
      newData["index"] = index+1
      newData["timestamp"] = firestore.Timestamp.fromDate(new Date());
      console.log('final new databody : ',newData)
      return dbRef
        .doc()
        .set(newData)
        .then(
          (snap2) => {
            var item = {};
            item[indexName] = index + 1;
            snap.ref.set(item, { merge: true }).then((x) => {
              response.status(200).send({
                success: true,
              });
            });
          },
          (reason) => {
            response.status(405).send(reason);
          }
        );
    });
  });
});

// exports.postQna = functions.https.onRequest((request, response) => {
//   cors(request, response, () => {
//     var body = request.body;
//     var getCurrentMetadataPromise = db
//       .doc("metadata/PpmSaO7W089QJuMBY9Md")
//       .get();
//     getCurrentMetadataPromise.then((snap) => {
//       var index = snap.data()["qna_last_index"];
//       var qnaRef = db.collection("qnas");
//       return qnaRef
//         .doc()
//         .set({
//           index: index + 1,
//           question: body.question,
//           category: body.category,
//           answer: null,
//           timestamp: firestore.Timestamp.fromDate(new Date())
//         })
//         .then(
//           (snap2) => {
//             var item = {};
//             item["qna_last_index"] = index + 1;
//             snap.ref.set(item, { merge: true }).then((x) => {
//               response.status(200).send({
//                 success: true,
//               });
//             });
//           },
//           (reason) => {
//             response.status(405).send(reason);
//           }
//         );
//     });
//   });
// });

exports.editQna = functions.https.onRequest((request, response) => {
  cors(request, response, () => {
    ////console.log("get edit qna");
    var body = request.body;
    ////console.log("index: ", body.index);
    var index = body.index;

    var qnasref = db.collection("qnas");
    var query = qnasref.where("index", "==", index);
    return query.get().then((snap) => {
      snap.docs[0].ref.set(body.newData, { merge: true }).then(
        (snap2) => {
          response.status(200).send({
            success: true,
          });
        },
        (reason) => {
          ////console.log("set error");
          response.status(405).send(reason);
        }
      );
    });
  });
});

exports.editNotice = functions.https.onRequest((request, response) => {
    cors(request, response, () => {
      ////console.log("get edit notice");
      var body = request.body;
      ////console.log("index: ", body.index);
      var index = Number(body.index);
  
      var noticesref = db.collection("notices");
      var query = noticesref.where("index", "==", index);
      return query.get().then((snap) => {
          ////console.log(snap)
        snap.docs[0].ref.set(body.newData, { merge: true }).then(
          (snap2) => {
            response.status(200).send({
              success: true,
            });
          },
          (reason) => {
            ////console.log("set error");
            response.status(405).send(reason);
          }
        );
      });
    });
  });

// exports.postNotice = functions.https.onRequest((request, response) => {
//   cors(request, response, () => {
//     var body = request.body;
//     var getCurrentMetadataPromise = db
//       .doc("metadata/PpmSaO7W089QJuMBY9Md")
//       .get();
//     getCurrentMetadataPromise.then((snap) => {
//       var index = snap.data()["notice_last_index"];
//       var noticeRef = db.collection("notices");
//       //console.log("try set");
//       return noticeRef
//         .doc()
//         .set({
//           index: index + 1,
//           title: body.title,
//           category: body.category,
//           content: body.content,
//           timestamp: Date.now(),
//         })
//         .then(
//           (snap2) => {
//             //console.log("try notice update");
//             var item = {};
//             item["notice_last_index"] = index + 1;
//             snap.ref.set(item, { merge: true }).then((x) => {
//               response.status(200).send({
//                 success: true,
//               });
//             });
//           },
//           (reason) => {
//             //console.log("set error");
//             response.status(405).send(reason);
//           }
//         );
//     });
//   });
// });

// exports.getQnaIndexs = functions.https.onRequest((request, response) => {
//   cors(request, response, () => {
//     var getCurrentMetadataPromise = db
//       .doc("metadata/PpmSaO7W089QJuMBY9Md")
//       .get();
//     return getCurrentMetadataPromise.then((snap) => {
//       var index = snap.data()["qna_last_index"];
//       //console.log("get current qna indexs(count) = ", index);
//       response.status(200).send({
//         current_index: index,
//       });
//     });
//   });
// });

exports.getCurrentLastIndex= functions.https.onRequest((request, response) => {
  return cors(request, response, () => {
    var type=request.query.type
    var indexName=""
    if(type == 'qna'){
      indexName = "qna_last_index"
    }
    else if(type == 'notice'){
      indexName = "notice_last_index"
    }
    else if(type == 'schedule'){
      indexName="schedule_last_index"
    }
    else{
      response.status(405).send({
        message : 'write data type ! '
      });
    }
    var getCurrentMetadataPromise = db
      .doc("metadata/PpmSaO7W089QJuMBY9Md")
      .get();
    return getCurrentMetadataPromise.then((snap) => {
      var index = snap.data()[indexName];
      //console.log("get current qna indexs(count) = ", index);
      response.status(200).send({
        current_index: index,
      });
    });
  });
});

// exports.getNoticeIndexs = functions.https.onRequest((request, response) => {
//   cors(request, response, () => {
//     return GetCurrentNoticeHighestIndex().then((index) => {
//       //console.log("get current notice indexs(count) = ", index);
//       response.status(200).send({
//         current_index: index,
//       });
//     });
//   });
// });

exports.getDatasByIndexs = functions.https.onRequest((request, response) => {
  return cors(request, response, () => {
    var type = request.query.type
    var from = Number(request.query.from);
    var to = Number(request.query.to);
    var collectionName=""
    if(type == 'qna'){
      collectionName = "qnas"
    }
    else if(type == 'notice'){
      collectionName = "notices"
    }
    else if(type == 'schedule'){
      collectionName="schedules"
    }
    else{
      response.status(405).send({
        message : 'write data type ! '
      });
    }
    return GetCurrentQnasHighestIndex().then((index) => {
      if (from > to) {
        response
          .status(400)
          .send({ message: "from param was bigger than to param" });
        return;
      }

      if (from > index) {
        response
          .status(400)
          .send({ message: "from param was bigger than whole indexes" });
        return;
      }

      if (from < 0) {
        response
          .status(400)
          .send({ message: "from param was smaller than zero" });
        return;
      }

      var qnasRef = db.collection(collectionName);
      qnasRef
        .where("index", ">=", from)
        .where("index", "<", to)
        .get()
        .then(
          (snap) => {
            response.status(200).send(snap.docs.map((doc) => doc.data()));
          },
          (reason) => {
            //console.log("query error");
            response.status(404).send(reason);
          }
        );
    });
  });
});

// exports.getQnasByIndexs = functions.https.onRequest((request, response) => {
//   cors(request, response, () => {
//     var from = Number(request.query.from);
//     var to = Number(request.query.to);
//     return GetCurrentQnasHighestIndex().then((index) => {
//       if (from > to) {
//         response
//           .status(400)
//           .send({ message: "from param was bigger than to param" });
//         return;
//       }

//       if (from > index) {
//         response
//           .status(400)
//           .send({ message: "from param was bigger than whole indexes" });
//         return;
//       }

//       if (from < 0) {
//         response
//           .status(400)
//           .send({ message: "from param was smaller than zero" });
//         return;
//       }

//       var qnasRef = db.collection("qnas");
//       qnasRef
//         .where("index", ">=", from)
//         .where("index", "<", to)
//         .get()
//         .then(
//           (snap) => {
//             response.status(200).send(snap.docs.map((doc) => doc.data()));
//           },
//           (reason) => {
//             //console.log("query error");
//             response.status(404).send(reason);
//           }
//         );
//     });
//   });
// });

exports.getWritingsByCategory = functions.https.onRequest((request, response) => {
  return cors(request, response, () => {
    var type = request.query.type;
    var category = request.query.category;
    var collectionName=""
    if(type == 'qna'){
      collectionName = "qnas"
    }
    else if(type == 'notice'){
      collectionName = "notices"
    }
    else{
      response.status(405).send({
        message : 'write right data type ! '
      });
    }
    var qnasRef = db.collection(collectionName);
    return qnasRef
      .where("category", "==", category)
      .get()
      .then(
        (snap) => {
          response.status(200).send(snap.docs.map((doc) => doc.data()));
        },
        (reason) => {
          response.status(404).send(reason);
        }
      );
  });
});

// exports.getQnasByCategory = functions.https.onRequest((request, response) => {
//   cors(request, response, () => {
//     //console.log("query : ", request.query);
//     var category = request.query.category;
//     return GetCurrentQnasHighestIndex().then((index) => {
//       var qnasRef = db.collection("qnas");
//       qnasRef
//         .where("category", "==", category)
//         .get()
//         .then(
//           (snap) => {
//             response.status(200).send(snap.docs.map((doc) => doc.data()));
//           },
//           (reason) => {
//             //console.log("query error");
//             response.status(404).send(reason);
//           }
//         );
//     });
//   });
// });

// exports.getNoticesByCategory = functions.https.onRequest(
//   (request, response) => {
//     cors(request, response, () => {
//       //console.log("query : ", request.query);
//       var category = request.query.category;
//       return GetCurrentNoticeHighestIndex().then((index) => {
//         var qnasRef = db.collection("notices");
//         qnasRef
//           .where("category", "==", category)
//           .get()
//           .then(
//             (snap) => {
//               response.status(200).send(snap.docs.map((doc) => doc.data()));
//             },
//             (reason) => {
//               //console.log("query error");
//               response.status(404).send(reason);
//             }
//           );
//       });
//     });
//   }
// );

// exports.getNoticesByIndexs = functions.https.onRequest((request, response) => {
//   cors(request, response, () => {
//     //console.log("query : ", request.query);
//     var from = Number(request.query.from);
//     var to = Number(request.query.to);
//     return GetCurrentNoticeHighestIndex().then((index) => {
//       if (from > to) {
//         response
//           .status(400)
//           .send({ message: "from param was bigger than to param" });
//         return;
//       }

//       if (from > index) {
//         response
//           .status(400)
//           .send({ message: "from param was bigger than whole indexes" });
//         return;
//       }

//       if (from < 0) {
//         response
//           .status(400)
//           .send({ message: "from param was smaller than zero" });
//         return;
//       }

//       var qnasRef = db.collection("notices");
//       qnasRef
//         .where("index", ">=", from)
//         .where("index", "<", to)
//         .get()
//         .then(
//           (snap) => {
//             response.status(200).send(snap.docs.map((doc) => doc.data()));
//           },
//           (reason) => {
//             //console.log("query error");
//             response.status(404).send(reason);
//           }
//         );
//     });
//   });
// });

function GetCurrentQnasHighestIndex() {
  var getCurrentMetadataPromise = db.doc("metadata/PpmSaO7W089QJuMBY9Md").get();
  return getCurrentMetadataPromise.then((snap) => {
    var index = snap.data()["qna_last_index"];
    return index;
  });
}

function GetCurrentNoticeHighestIndex() {
  var getCurrentMetadataPromise = db.doc("metadata/PpmSaO7W089QJuMBY9Md").get();
  return getCurrentMetadataPromise.then((snap) => {
    var index = snap.data()["notice_last_index"];
    return index;
  });
}
