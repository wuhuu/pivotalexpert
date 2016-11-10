(function () {

  angular
    .module('app.analytics')
    .controller('AnalyticsController', AnalyticsController);

    function AnalyticsController ($scope,contentMgmtService,$firebaseObject,$firebaseArray) {
      var ref = firebase.database().ref();
      var activeUserNode = ref.child('analytics/activeUser');
      var challengeStats = ref.child('analytics/challengeStats')
      var libraryNode = ref.child('library');

      getActiveUser();
      $scope.books = bookRanking();


      $scope.bookPage = function () {
        window.location.href = '/#/educator/analytics/bid/stats';
      }
      function bookRanking(){
        var bookOrder = [];
        var library = $firebaseArray(libraryNode);
        var challengeStatsObject = $firebaseObject(challengeStats);
        challengeStatsObject.$loaded().then(function(){
          library.$loaded().then(function(){
            for(var b = 0; b<library.length; b++){
              var bid = library[b];
              var book = {};
              var uniqueUsersCompleted = {};
              var uniqueUsersAttempted = {};
              var totalQns = 0;
              book.title = bid.bookTitle;
              for(var i = 0; i < bid.sequence.length; i++){
                var chapter = bid.sequence[i];
                if(chapter.qns != null){
                  for(var a = 0 ; a < chapter.qns.length; a++){
                    totalQns++;
                    var qns = chapter.qns[a];
                    var qid = qns.qid;
                    if (challengeStatsObject[qid] != null){
                      var qnsStats = challengeStatsObject[qid];
                      Object.assign(uniqueUsersAttempted,qnsStats.userTimings);
                      if(qnsStats.userCompletedRecords != null){
                        for(var user in qnsStats.userCompletedRecords){
                          if(uniqueUsersCompleted[user] != null){
                            uniqueUsersCompleted[user]++;
                          }else{
                            uniqueUsersCompleted[user] = 1;
                          }
                        }
                      }
                    }
                  }
                }
              }
              var totalCompletedProgress = 0;
              for(var user in uniqueUsersCompleted){
                totalCompletedProgress+= (uniqueUsersCompleted[user]/totalQns);
              }
              var totalUserAttempted = Object.keys(uniqueUsersAttempted).length;
              book.avgProgress= parseFloat(Math.round((totalCompletedProgress / totalUserAttempted * 100) * 100) / 100).toFixed(2);;
              bookOrder.push(book);
              bookOrder.sort(function(a,b){return parseFloat(b.avgProgress) - parseFloat(a.avgProgress);})
            }
          });
        });
        return bookOrder;
      }


      function getActiveUser(){
        var activeUser = {};
        var date = new Date();
        var today = (date.getMonth()+1)+""+date.getDate() + date.getFullYear();
        var activeUserObject = $firebaseObject(activeUserNode);
        activeUserObject.$loaded().then(function(){
          //check today
          var todayActiveObject = activeUserObject[today];
          if(todayActiveObject != null){
            $scope.today = Object.keys(todayActiveObject).length;
          }else{
            $scope.today = 0 ;
          }

          //check 7 days
          var uniqueActiveObject = Object.assign({},todayActiveObject);
          for(var i = 1; i < 7; i++){
            date.setDate(date.getDate() - 1);
            var currentDate = (date.getMonth()+1)+""+date.getDate() + date.getFullYear();
            var currentActiveObject = activeUserObject[currentDate];
            if(currentActiveObject != null){
              Object.assign(uniqueActiveObject,currentActiveObject);
            }
          }
          if(uniqueActiveObject != null){
            $scope.sevenDays = Object.keys(uniqueActiveObject).length
          }else{
            $scope.sevenDays = 0 ;
          }

          //check 30 days
          activeUser.thirtyDays = activeUser.sevenDays;
          for(var i = 1; i < 23; i++){
            date.setDate(date.getDate() - 1);
            var currentDate = (date.getMonth()+1)+""+date.getDate() + date.getFullYear();
            var currentActiveObject = activeUserObject[currentDate];
            if(currentActiveObject != null){
              Object.assign(uniqueActiveObject,currentActiveObject);
            }
          }
          if(uniqueActiveObject != null){
            $scope.thirtyDays = Object.keys(uniqueActiveObject).length
          }else{
            $scope.thirtyDays = 0 ;
          }
          console.log(activeUser);
          return activeUser;
        });
      }
    }

})();
