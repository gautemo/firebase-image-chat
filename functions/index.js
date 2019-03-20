const functions = require('firebase-functions');

const admin = require('firebase-admin');
admin.initializeApp();

exports.sendVerifyEmail = functions.auth.user().onCreate((user) => {
    const bannedEmailProviders = ['temp', '@virtual-email.com'];
    if(bannedEmailProviders.find(x => user.email.includes(x))){
        const auth = admin.auth();
        auth.revokeRefreshTokens(user.uid);
        auth.deleteUser(user.uid);
    }
});

exports.report = functions.https.onCall((data, context) => {
    if (!context.auth) {
        throw new functions.https.HttpsError('failed-precondition', 'The function must be called while authenticated.');
    }
    const imgRef = admin.firestore().collection("images").doc(data.id);
    return imgRef.get().then(doc => {
        const img = doc.data();

        const uid = context.auth.token.uid;
        const time = new Date().getTime();
        if(!img.reported.find(r => r.user === uid && time - r.date < 60000)){
            img.reported.push({
                date: time,
                user: uid
              });

            if(img.reported.length > 5){
                return imgRef.delete().then(() => {
                    return admin.storage().bucket().file('images/' + data.id).delete();
                });
            }else{
                return imgRef.update({
                    reported: img.reported
                });
            }
        }
    });
});

