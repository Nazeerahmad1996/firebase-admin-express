const express = require('express');
const jwt = require('jsonwebtoken')

const app = express();

var admin = require("firebase-admin");

var serviceAccount = require("./serviceAccountKey.json");

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: ""
});


app.get('/auth', (req, res) => {
    res({
        "message": 'Hello JWT'
    })
})

function validateEmail(email) {
    const re = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(String(email).toLowerCase());
}

function sliceIntoChunks(arr, chunkSize) {
    const res = [];
    for (let i = 0; i < arr.length; i += chunkSize) {
        const chunk = arr.slice(i, i + chunkSize);
        res.push(chunk);
    }
    return res;
}

app.listen(3000, (req, res) => {
    console.log('server started on 3000')
    const db = admin.database();
    const ref = db.ref('users');

    // ref.child('9slvJ15LBYMp91dXlZc2RpBmklw1').once('value').then(function (snapshot) {
    //     console.log(snapshot.val());
    //     ImageAvatar = (snapshot.val() && snapshot.val().Image);
    // });

    admin
        .auth()
        .getUserByEmail("nazeer@gmail.com")
        .then((userRecord) => {
            // See the UserRecord reference doc for the contents of userRecord.
            console.log(`Successfully fetched user data: ${userRecord.toJSON()}`);
        })
        .catch((error) => {
            console.log('Error fetching user data:', error);
        });

    // Attach an asynchronous callback to read the data at our posts reference
    let initMessages = [];

    ref.once("value", snapshot => {
        let data = snapshot.val()
        if (data) {
            Object
                .keys(data)
                .forEach(message => {
                    Object
                        .keys(data)
                        .forEach(message => {
                            let email = data[message].Email
                            let isValid = validateEmail(email)
                            if (isValid) initMessages.push(message)
                        })
                });

        }
    }, (errorObject) => {
        console.log('The read failed: ' + errorObject.name);
    }).then(d => {
        let mainArray = sliceIntoChunks(initMessages, 100);
        mainArray.forEach((e, i) => {
            e.forEach(e => {
                admin
                    .auth()
                    .getUser(e)
                    .then((userRecord) => {
                        console.log(userRecord);
                        // See the UserRecord reference doc for the contents of userRecord.
                        console.log(`Successfully fetched user data: ${userRecord.toJSON().uid}`);
                        console.log(`Successfully fetched user data: ${userRecord.toJSON().metadata.creationTime}`);
                        const usersRef = ref.child(userRecord.toJSON().uid);
                        usersRef.update({
                            'uid': userRecord.toJSON().uid,
                            "creationTime": userRecord.toJSON().metadata.creationTime
                        }).then(d => {
                            console.log('success')
                        }).catch(err => {
                            console.log(err);
                        });

                    })
                    .catch((error) => {
                        console.log('Error fetching user data:', error);
                    });
            })
        })

    });
})