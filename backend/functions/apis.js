const functions = require("firebase-functions");
const admin = require("firebase-admin");
const db = require("./adminInit").db;
const { firestore } = require("firebase-admin");
const cors = require("cors")({ origin: true });

const msgTopic = "event";

exports.sendMessageStringOnly = functions.https.onRequest(
  (request, response) => {
    return cors(request, response, () => {
      var jsn = JSON.parse(String(request.body));
      var msg = "msgtest " + String(jsn["message"]);
      var message = {
        topic: msgTopic,
        notification: {
          title: "Background Message Title",
          body: msg,
        },
        webpush: {
          fcm_options: {
            link: "https://dummypage.com",
          },
        },
        data: {
          message: msg,
        },
      };
      return admin
        .messaging()
        .send(message)
        .then(
          (response2) => {
            response.status(200).send({
              success: true,
            });
            return;
          },
          (reason) => {
            response.status(405).send(reason);
            return;
          }
        )
        .catch((error) => {
          response.status(405).send(error);
          return;
        });
    });
  }
);

exports.sendMessageDailyForce = functions.https.onRequest(
  (request, response) => {
    return cors(request, response, () => {
      var curDate = new Date();

      var curymd=new Date(curDate.getUTCFullYear(), curDate.getUTCMonth(), curDate.getUTCDate())
      var nextYmd=new Date(curDate.getUTCFullYear(), curDate.getUTCMonth(), curDate.getUTCDate()+1)

      var collectionName = "schedules";
      var scheduleRef = db.collection(collectionName);

      return scheduleRef
        .where("isenabled", "==", true)
        .where("start", ">=", curymd)
        .where("start", "<=", nextYmd)
        .get()
        .then((snap) => {
          //console.log("get data : length", snap.docs.length);
          if (snap.docs.length <= 0) {
            response.status(200).send({
              success: true,
            });
            return
          }

          var msgs = [];
          snap.docs.forEach((qsnap) => {
            var element = qsnap.data()
            const KR_TIME_DIFF = 9 * 60 * 60 * 1000;
            var from = new Date(element["start"]["_seconds"]*1000 + KR_TIME_DIFF)
            var to = new Date(element["end"]["_seconds"]*1000 + KR_TIME_DIFF)
            msgs.push(
              `오늘의 스케줄: ${
                element["name"]
              }, ${from.toLocaleTimeString()} 부터 ${to.toLocaleString()}까지`
            );
          });
          var msg = msgs.join("\n");
          var message = {
            topic: msgTopic,
            notification: {
              title: "MMESEUM 알림",
              body: msg,
            },
            webpush: {
              fcm_options: {
                link: "https://mme.dongguk.edu",
              },
            },
            data: {
              message: msg,
            },
          };
          return admin
            .messaging()
            .send(message)
            .then(
              (response2) => {
                response.status(200).send({
                  success: true,
                });
                return;
              },
              (reason) => {
                response.status(405).send(reason);
                return;
              }
            )
            .catch((error) => {
              response.status(405).send(error);
              return;
            });
        });
    });
  }
);

exports.sendMessageDaily = functions.pubsub
  .schedule("0 9,12 * * *")
  .timeZone("Asia/Seoul")
  .onRun((context) => {
    var curDate = new Date();

    var curymd=new Date(curDate.getUTCFullYear(), curDate.getUTCMonth(), curDate.getUTCDate())
    var nextYmd=new Date(curDate.getUTCFullYear(), curDate.getUTCMonth(), curDate.getUTCDate()+1)

    var collectionName = "schedules";
    var scheduleRef = db.collection(collectionName);

    return scheduleRef
    .where("isenabled", "==", true)
    .where("start", ">=", curymd)
    .where("start", "<=", nextYmd)
      .get()
      .then((snap) => {
        if (snap.docs.length <= 0) {
          return;
        }

        var msgs = [];
        snap.docs.forEach((qsnap) => {
          var element = qsnap.data()
          const KR_TIME_DIFF = 9 * 60 * 60 * 1000;
          var from = new Date(element["start"]["_seconds"]*1000 + KR_TIME_DIFF)
          var to = new Date(element["end"]["_seconds"]*1000 + KR_TIME_DIFF)
          msgs.push(
            `오늘의 스케줄: ${
              element["name"]
            }, ${from.toLocaleTimeString()} 부터 ${to.toLocaleString()}까지`
          );
        });
        var msg = msgs.join("\n");
        var message = {
          topic: msgTopic,
          notification: {
            title: "MMESEUM 알림",
            body: msg,
          },
          webpush: {
            fcm_options: {
              link: "https://mme.dongguk.edu",
            },
          },
          data: {
            message: msg,
          },
        };
        return admin
          .messaging()
          .send(message)
          .then(
            (response2) => {
              return;
            },
            (reason) => {
              console.log('daily push send failed reason : ',reason)
              return;
            }
          )
          .catch((error) => {
            console.log('daily push send failed error : ',error)
            return;
          });
      });
  });

exports.sendToken = functions.https.onRequest((request, response) => {
  cors(request, response, () => {
    var body = request.body;
    var token = body["token"];
    var tokenRef = db.collection("tokens");
    return tokenRef
      .where("token", "==", token)
      .get()
      .then((snap) => {
        if (snap.size <= 0) {
          return tokenRef
            .doc()
            .set({
              token: body.token,
            })
            .then(
              (result) => {
                admin
                  .messaging()
                  .subscribeToTopic(token, msgTopic)
                  .then((res) => {})
                  .catch((err) => {
                    response.status(405).send(err);
                  });
                response.status(200).send({
                  success: true,
                });
              },
              (reason) => {
                response.status(405).send(reason);
              }
            );
        } else {
          response.status(200).send({
            success: true,
          });
        }
      });
  });
});

exports.postData = functions.https.onRequest((request, response) => {
  return cors(request, response, () => {
    var body = JSON.parse(String(request.body));
    var indexName = "";
    var collectionName = "";

    if (body["type"] == "qna") {
      indexName = "qna_last_index";
      collectionName = "qnas";
    } else if (body["type"] == "notice") {
      indexName = "notice_last_index";
      collectionName = "notices";
    } else if (body["type"] == "schedule") {
      indexName = "schedule_last_index";
      collectionName = "schedules";
      var data = body["data"];
      var orgStart = data["start"];
      var orgEnd = data["end"];
      var dStart = new Date(orgStart);
      var dEnd = new Date(orgEnd);
      data["start"] = firestore.Timestamp.fromDate(dStart);
      data["end"] = firestore.Timestamp.fromDate(dEnd);
    } else if(body["type"] == "comment"){
      indexName="comment_last_index";
      collectionName="comments"
    }
    else {
      response.status(405).send({
        message: "write data type ! ",
      });
    }

    var getCurrentMetadataPromise = db
      .doc("metadata/PpmSaO7W089QJuMBY9Md")
      .get();
    getCurrentMetadataPromise.then((snap) => {
      var index = snap.data()[indexName];
      var dbRef = db.collection(collectionName);

      //console.log('got '+indexName+" : ",index);
      var newData = body["data"];
      newData["index"] = index + 1;
      newData["timestamp"] = firestore.Timestamp.fromDate(new Date());
      // console.log('final new databody : ',newData)
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

exports.editData = functions.https.onRequest((request, response) => {
  return cors(request, response, () => {
    var body = JSON.parse(String(request.body));
    var collectionName = "";

    if (body.type == "qna") {
      collectionName = "qnas";
    } else if (body.type == "notice") {
      collectionName = "notices";
    } else if (body.type == "schedule") {
      collectionName = "schedules";
    } else {
      response.status(405).send({
        message: "write data type ! ",
      });
    }

    var index = Number(body.index);

    //console.log("final index ", index, "final collectionName ", collectionName);

    var noticesref = db.collection(collectionName);
    var query = noticesref.where("index", "==", index);
    return query.get().then((snap) => {
      snap.docs[0].ref.set(body.data, { merge: true }).then(
        (snap2) => {
          response.status(200).send({
            success: true,
          });
        },
        (reason) => {
          response.status(405).send(reason);
        }
      );
    });
  });
});

exports.getCurrentLastIndex = functions.https.onRequest((request, response) => {
  return cors(request, response, () => {
    var type = request.query.type;
    var indexName = "";
    if (type == "qna") {
      indexName = "qna_last_index";
    } else if (type == "notice") {
      indexName = "notice_last_index";
    } else if (type == "schedule") {
      indexName = "schedule_last_index";
    } else {
      response.status(405).send({
        message: "write data type ! ",
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

exports.getDatasByIndexs = functions.https.onRequest((request, response) => {
  return cors(request, response, () => {
    var type = request.query.type;
    var from = Number(request.query.from);
    var to = Number(request.query.to);
    var collectionName = "";
    if (type == "qna") {
      collectionName = "qnas";
    } else if (type == "notice") {
      collectionName = "notices";
    } else if (type == "schedule") {
      collectionName = "schedules";
    } else {
      response.status(405).send({
        message: "write data type ! ",
      });
    }
    return GetCurrentHighestIndex(type).then((index) => {
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

exports.getWritingsByCategory = functions.https.onRequest(
  (request, response) => {
    return cors(request, response, () => {
      var type = request.query.type;
      var category = request.query.category;
      var collectionName = "";
      if (type == "qna") {
        collectionName = "qnas";
      } else if (type == "notice") {
        collectionName = "notices";
      } else {
        response.status(405).send({
          message: "write right data type ! ",
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
  }
);

exports.getSchedulesByMonth = functions.https.onRequest((request, response) => {
  cors(request, response, () => {
    var year = Number(request.query.year);
    var month = Number(request.query.month);
    var collectionName = "schedules";
    var qnasRef = db.collection(collectionName);

    if (year == 0 || month == 0) {
      response.status(405).send({
        message: "write right data type ! ",
      });
      return;
    }

    var fromMonth = new Date(year, month - 1);
    var toMonth = new Date(year, month);
    return qnasRef
      .where("start", ">=", fromMonth)
      .where("start", "<=", toMonth)
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

exports.getCommentsByTypeAndIndex=functions.https.onRequest((request, response) => {
  cors(request, response, () => {
    var type = request.query.type
    var index=Number(request.query.index)
   
    var collectionName = "comments";
    var qnasRef = db.collection(collectionName);

    if (type.length<=0) {
      response.status(405).send({
        message: "no type for comment ! ",
      });
      return;
    }

    //console.log('type : ', type, 'index : ',index)

    return qnasRef
      .where("comment_index", "==", index)
      .where("comment_type", "==", type)
      .get()
      .then(
        (snap) => {
          //console.log('get snaps: ', snap.docs.length)
          response.status(200).send(snap.docs.map((doc) => doc.data()));
        },
        (reason) => {
          response.status(404).send(reason);
        }
      );
  });
});

function GetCurrentHighestIndex(type){
  var indexName=""
  if (type == "qna") {
    indexName = "qna_last_index";
  } else if (type == "notice") {
    indexName = "notice_last_index";
  } else if (type == "schedule") {
    indexName = "schedule_last_index";
  } else{
    return -1
  }
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
