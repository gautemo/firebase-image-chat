const storageRef = firebase.storage().ref();
const db = firebase.firestore();
const dbImages = db.collection("images");

const loadImages = () => {
  dbImages.orderBy("created_at").onSnapshot(async function(snapshot) {
    for (const change of snapshot.docChanges()) {
      if (change.type === "added") {
        const url = await storageRef
          .child("images")
          .child(change.doc.id)
          .getDownloadURL();
        app.images.unshift({
          src: url,
          id: change.doc.id,
          likes: change.doc.data().likes,
          reported: change.doc.data().reported
        });
      } else if (change.type === "modified") {
        for (let i = 0; i < app.images.length; i++) {
          if (app.images[i].id === change.doc.id) {
            app.images[i].likes = change.doc.data().likes;
          }
        }
      }else if(change.type === "removed"){
        app.images.splice(app.images.findIndex(i => i.id === change.doc.id), 1);
      }
    }
  });
};

const app = new Vue({
  el: "#app",
  data: {
    images: [],
    signedIn: false
  },
  methods: {
    uploadImage: file => {
      storageRef.child(`images/${file.name}`).put(file);
      dbImages.doc(file.name).set({
        reported: [],
        likes: 0,
        created_at: new Date().getTime()
      });
    },
    signInUi: function() {
      const auth = firebase.auth();
      const ui = new firebaseui.auth.AuthUI(auth);

      auth.onAuthStateChanged(user => {
        if (user !== null) {
          this.signedIn = true;
          loadImages();
        } else {
          this.signedIn = false;
          ui.start("#firebaseui-auth-container", {
            signInOptions: [firebase.auth.EmailAuthProvider.PROVIDER_ID],
            callbacks: {
              signInSuccessWithAuthResult: () => false
            }
            // Other config options...
          });
        }
      });
    },
    signOut: function(){
      firebase.auth().signOut();
    },
    like: function(img) {
      const imgRef = dbImages.doc(img.id);
      db.runTransaction(async transaction => {
        const doc = await transaction.get(imgRef);
        transaction.update(imgRef, { likes: doc.data().likes + 1 });
      });
    },
    report: function(img) {
      img.reported.push({
        date: new Date().getTime(),
        user: firebase.auth().currentUser.uid
      });
      dbImages.doc(img.id).update({
        reported: img.reported
      });
    }
  },
  mounted: function() {
    const fileInput = document.getElementById("file");
    fileInput.addEventListener("change", e =>
      this.uploadImage(e.target.files[0])
    );
    this.signInUi();
  }
});
