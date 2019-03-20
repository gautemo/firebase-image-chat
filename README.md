# firebase-image-chat

## Step Two
People are uploading a lot of bad images. It's hard to manually check the reports.
Let's create a Firebase function that checks if a user spam reports
and deletes the image if it get's more than 5 reports.

## TODO
* `firebase deploy --only functions`

## Code
```
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
```

Change report function
```
const report = firebase.functions().httpsCallable('report');
report({ id: img.id });
```

## DOCS
[Firebase Functions](https://firebase.google.com/docs/functions/)

[Callable HTTP Triggers](https://firebase.google.com/docs/functions/callable)