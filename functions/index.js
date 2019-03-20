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