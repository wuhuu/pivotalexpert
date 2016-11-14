(function() {

  // Initialize Firebase
  var config = {
    apiKey: "AIzaSyBzj8ivOz2gu-wpTvO-btGqFwcPjO7IpKM",
    authDomain: "your-project-name-d52d4.firebaseapp.com",
    databaseURL: "https://your-project-name-d52d4.firebaseio.com",
    storageBucket: "your-project-name-d52d4.appspot.com",
    messagingSenderId: "787059378519"
  };

  firebase.initializeApp(config);

  //Replace with the name of your course
  window.courseName = "My Library";
})();
