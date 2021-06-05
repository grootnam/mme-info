const firebaseWebPushKey= "BPp9X_8OLhv6eyggatx5GXea65keYx9vzX65m8T8q6fftvChYJ_okyTMBW58AzDqnhoMjvkhyDn57k82QL_-Udo"


/*
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */

//const FCM = require("cordova-plugin-fcm-with-dependecy-updated")

//const { default: FCM } = require("cordova-plugin-fcm-with-dependecy-updated");

// Wait for the deviceready event before using any of Cordova's device APIs.
// See https://cordova.apache.org/docs/en/latest/cordova/events/events.html#deviceready

//import {FCM} from 'cordova-plugin-fcm-with-dependecy-updated'
document.addEventListener('deviceready', onDeviceReady, false);

function onDeviceReady() {
    // Cordova is now initialized. Have fun!

    console.log('Running cordova-' + cordova.platformId + '@' + cordova.version);
    //document.getElementById('deviceready').classList.add('ready');

    console.log(FCM)

    FCM.getToken({vapidKey : firebaseWebPushKey }).then((token)=>{
      console.log("token :"+ token)
		  alert("token : "+ token);
      fetch("https://us-central1-mme-info.cloudfunctions.net/apis-sendToken",{
        "method" : "POST",
        "headers": {
          "Content-Type": "application/json"
        },
        "body" : JSON.stringify({
          "token" : token
        })
      }).then((response) =>{
        console.log('get response ', response)
        alert("get response : " + response.body)
        FCM.subscribeToTopic("event")
      })
    })
	// FCM.getToken(
	//   function(token){
	// 	console.log("token :"+ token)
	// 	alert("token : "+ token);
	//   },
	//   function(err){
	// 	console.log('error retrieving token: ' + err);
	//   }
	// )

	FCM.onNotification(
	  function(data){
		if(data.wasTapped){
		  alert( JSON.stringify(data) );
		}else{
		  alert( JSON.stringify(data) );
		}
	  },
	  function(msg){
		alert('onNotification callback successfully registered: ' + msg)
		console.log('onNotification callback successfully registered: ' + msg);
	  },
	  function(err){
		console.log('Error registering onNotification callback: ' + err);
	  }
	);


    // FCM.getToken(function(data){
    //     var s=JSON.stringify(data) ;
    //     alert( s );
    //     console.log(s);
    // },function(data){
    //     alert( s );
    //     console.log(s);
    // })

    // FCM.onNotification(function(data){
    //     if(data.wasTapped){
    //       //Notification was received on device tray and tapped by the user.
    //       alert( s );
    //       console.log(s);
    //     }else{
    //       //Notification was received in foreground. Maybe the user needs to be notified.
    //       alert( s );
    //       console.log(s);
    //     }
    // });


}
