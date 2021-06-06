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
    // var body = request.body;
    // console.log('postData get body : ',body)
    // response.set('Access-Control-Allow-Origin', "*")
    var body = JSON.parse(String(request.body))
    var indexName="";
    var collectionName="";

    //console.log('postdata get body type : ' + body["type"])

    if(body["type"] == "qna"){
      indexName = "qna_last_index"
      collectionName = "qnas"
    }
    else if(body["type"] == "notice"){
      indexName = "notice_last_index"
      collectionName = "notices"
    }
    else if(body["type"] == "schedule"){
      indexName="schedule_last_index"
      collectionName="schedules"
      var data=body["data"]
      var orgStart = data["start"]
      var orgEnd= data["end"]
      //console.log('org start and end: ',orgStart,orgEnd)
      var dStart = new Date(orgStart)
      var dEnd = new Date(orgEnd)
      //console.log('dt start and end: ',dStart,dEnd)
      data["start"] = firestore.Timestamp.fromDate(dStart)
      data["end"] = firestore.Timestamp.fromDate(dEnd)

     // console.log('altered body : ',body)
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

      //console.log('got '+indexName+" : ",index);
      var newData=body["data"];
      newData["index"] = index+1
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
    var body = request.body;
    var data=body.data;
    var collectionName="";

    if(body.type == 'qna'){
      collectionName = "qnas"
    }
    else if(body.type == 'notice'){
      collectionName = "notices"
    }
    else if(body.type == 'schedule'){
      collectionName="schedules"
    }
    else{
      response.status(405).send({
        message : 'write data type ! '
      });
    }

    var index = Number(data.index);

    var noticesref = db.collection(collectionName);
    var query = noticesref.where("index", "==", index);
    return query.get().then((snap) => {
      snap.docs[0].ref.set(data.newData, { merge: true }).then(
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

exports.getSchedulesByMonth= functions.https.onRequest((request, response) => {
  cors(request, response, () => {
    var year = Number(request.query.year);
    var month = Number(request.query.month);
    var collectionName="schedules"
    var qnasRef = db.collection(collectionName);

    if(year ==0 || month == 0){
      response.status(405).send({
        message : 'write right data type ! '
      });
      return
    }

    var fromMonth=new Date(year,month-1)
    var toMonth=new Date(year, month)
    console.log('fromMonth: ',fromMonth,'toMonth: ',toMonth)
    // toMonth.setDate(fromMonth.getDate() + 31)
    return qnasRef
      .where("start", ">=", fromMonth).where("start","<=",toMonth)
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
