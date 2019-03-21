# firebase-image-chat

## Step Three
A problem is that the client is makeing two requests when uploading images.
And uploading a image might be slower than the firestore data. 
Which means you need to refresh the page to see the image. Let's create a function that handles the firestore data.

## TODO
* `firebase deploy --only functions`

## Code
```
exports.addFirestoreRef = functions.storage.object().onFinalize((object) => {
    const filename = object.name.replace('images/', '');
    const dbImages = admin.firestore().collection("images");
    return dbImages.doc(filename).set({
        reported: [],
        likes: 0,
        created_at: new Date().getTime()
      });
});
```

Change upload to firestore in uploadImage function


## DOCS
[Firebase Functions](https://firebase.google.com/docs/functions/)

[Callable HTTP Triggers](https://firebase.google.com/docs/functions/callable)
