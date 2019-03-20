# firebase-image-chat

## Step One
People are uploading a lot of bad images. Let's not allow any user signing up with temporary email providers.

## TODO
* Run `firebase init functions`
* `firebase deploy --only functions`

## Code
```
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
```

## DOCS
[Firebase Functions](https://firebase.google.com/docs/functions/)

[Firebase Authentication triggers](https://firebase.google.com/docs/functions/auth-events)