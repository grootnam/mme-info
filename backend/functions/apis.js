const functions = require("firebase-functions");
const admin =require("firebase-admin")
const db = require("./adminInit").db;
const cors = require("cors")({ origin: true });

const msgTopic = "event"

exports.sendMessageStringOnly = functions.https.onRequest((request, response) =>{
  return cors(request, response, ()=>{
    ////console.log('get sendmsg request body : ',request.body)
    var jsn = JSON.parse(String(request.body))
    var msg = 'msgtest '+ String(jsn["message"])
    //console.log('msg to send : ',msg)
    // var message = {
    //   data: {
    //     message : msg
    //   },
    //   topic : msgTopic
    // }
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
        // Response is a message ID string.
        //console.log('Successfully sent message:', response2);
        response.status(200).send({
          success: true,
        });
        return
      }, (reason)=>{
        response.status(405).send(reason);
        return
        //console.log('sent message failed:', reason);
      })
      .catch((error) => {
        response.status(405).send(error);
        return
        //console.log('Error sending message:', error);
      });
  })
})

exports.sendToken=functions.https.onRequest((request, response)=>{
  cors(request,response,()=>{
    var body = request.body
    //console.log("get token from phone: ", body["token"]);
    var token = body["token"]
    var tokenRef=db.collection('tokens');
    return tokenRef.where("token", "==", token).get().then((snap)=>{
      if(snap.size<=0){
        return tokenRef.doc().set({
          token : body.token
        }).then((result)=>{
          admin.messaging().subscribeToTopic(token, msgTopic).then((res)=>{
            //console.log('Successfully subscribed to topic:', res)
          }).catch((err)=>{
            //console.log('error subscribing to topic',err)
          })
          response.status(200).send({
            success: true,
          });
        }, (reason)=>{
          response.status(405).send(reason);
        })
      }
      else{
        //console.log('token ',token, ' is already added')
        response.status(200).send({
          success: true,
        });
      }
    })
  });
});

exports.postQna = functions.https.onRequest((request, response) => {
  cors(request, response, () => {
    ////console.log("get post qna");
    var body = request.body;
    ////console.log("question: ", body.question);
    ////console.log("category: ", body.category);
    var getCurrentMetadataPromise = db
      .doc("metadata/PpmSaO7W089QJuMBY9Md")
      .get();
    getCurrentMetadataPromise.then((snap) => {
      var index = snap.data()["qna_last_index"];
      var qnaRef = db.collection("qnas");
      ////console.log("try set");
      return qnaRef
        .doc()
        .set({
          index: index + 1,
          question: body.question,
          category: body.category,
          answer: null,
          timestamp: Date.now(),
        })
        .then(
          (snap2) => {
            ////console.log("try qna update");
            var item = {};
            item["qna_last_index"] = index + 1;
            snap.ref.set(item, { merge: true }).then((x) => {
              response.status(200).send({
                success: true,
              });
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

exports.postNotice = functions.https.onRequest((request, response) => {
  cors(request, response, () => {
    //console.log("get post notice");
    var body = request.body;
    //console.log("title: ", body.title);
    //console.log("category: ", body.category);
    var getCurrentMetadataPromise = db
      .doc("metadata/PpmSaO7W089QJuMBY9Md")
      .get();
    getCurrentMetadataPromise.then((snap) => {
      var index = snap.data()["notice_last_index"];
      var noticeRef = db.collection("notices");
      //console.log("try set");
      return noticeRef
        .doc()
        .set({
          index: index + 1,
          title: body.title,
          category: body.category,
          content: body.content,
          timestamp: Date.now(),
        })
        .then(
          (snap2) => {
            //console.log("try notice update");
            var item = {};
            item["notice_last_index"] = index + 1;
            snap.ref.set(item, { merge: true }).then((x) => {
              response.status(200).send({
                success: true,
              });
            });
          },
          (reason) => {
            //console.log("set error");
            response.status(405).send(reason);
          }
        );
    });
  });
});

// exports.getAllDocuments = functions.https.onRequest((request, response) => {
//   cors(request, response, () => {
//     var docusRef = db.collection("documents");
//     var query = docusRef.get();
//     return query.then((snap) => {
//       response.status(200).send(snap.docs.map((doc) => doc.data()));
//     });
//   });
// });

// exports.getDocumentById = functions.https.onRequest((request, response) => {
//   cors(request, response, () => {
//     //console.log("query : ", request.query);
//     var possibleId = Number(request.query.id);
//     var worksRef = db.collection("documents");
//     var query = worksRef.where("index", "==", possibleId);
//     return query.get().then((snap) => {
//       response.status(200).send(snap.docs.map((doc) => doc.data()));
//     });
//   });
// });

// exports.getWorksById = functions.https.onRequest((request, response) => {
//   cors(request, response, () => {
//     //console.log("query : ", request.query);
//     var possibleId = Number(request.query.id);
//     var worksRef = db.collection("works");
//     var query = worksRef.where("usedby", "==", possibleId);
//     return query.get().then((snap) => {
//       response.status(200).send(snap.docs.map((doc) => doc.data()));
//     });
//   });
// });

// exports.getImagesById = functions.https.onRequest((request, response) => {
//   ////console.log(request)
//   cors(request, response, () => {
//     //console.log("query : ", request.query);
//     var possibleId = Number(request.query.id);
//     var worksRef = db.collection("images");
//     var query = worksRef.where("usedby", "==", possibleId);
//     return query.get().then((snap) => {
//       response.status(200).send(snap.docs.map((doc) => doc.data()));
//     });
//   });
// });

exports.getQnaIndexs = functions.https.onRequest((request, response) => {
  cors(request, response, () => {
    var getCurrentMetadataPromise = db
      .doc("metadata/PpmSaO7W089QJuMBY9Md")
      .get();
    return getCurrentMetadataPromise.then((snap) => {
      var index = snap.data()["qna_last_index"];
      //console.log("get current qna indexs(count) = ", index);
      response.status(200).send({
        current_index: index,
      });
    });
  });
});

exports.getNoticeIndexs = functions.https.onRequest((request, response) => {
  cors(request, response, () => {
    return GetCurrentNoticeHighestIndex().then((index) => {
      //console.log("get current notice indexs(count) = ", index);
      response.status(200).send({
        current_index: index,
      });
    });
  });
});

exports.getQnasByIndexs = functions.https.onRequest((request, response) => {
  cors(request, response, () => {
    //console.log("query : ", request.query);
    var from = Number(request.query.from);
    var to = Number(request.query.to);
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

      var qnasRef = db.collection("qnas");
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

exports.getQnasByCategory = functions.https.onRequest((request, response) => {
  cors(request, response, () => {
    //console.log("query : ", request.query);
    var category = request.query.category;
    return GetCurrentQnasHighestIndex().then((index) => {
      var qnasRef = db.collection("qnas");
      qnasRef
        .where("category", "==", category)
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

exports.getNoticesByCategory = functions.https.onRequest(
  (request, response) => {
    cors(request, response, () => {
      //console.log("query : ", request.query);
      var category = request.query.category;
      return GetCurrentNoticeHighestIndex().then((index) => {
        var qnasRef = db.collection("notices");
        qnasRef
          .where("category", "==", category)
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
  }
);

exports.getNoticesByIndexs = functions.https.onRequest((request, response) => {
  cors(request, response, () => {
    //console.log("query : ", request.query);
    var from = Number(request.query.from);
    var to = Number(request.query.to);
    return GetCurrentNoticeHighestIndex().then((index) => {
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

      var qnasRef = db.collection("notices");
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
