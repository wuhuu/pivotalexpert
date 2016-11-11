(function () {

  angular
    .module('app.analytics')
    .controller('AnalyticsController', AnalyticsController);

    function AnalyticsController ($scope,contentMgmtService,$firebaseObject,$firebaseArray,$location,$routeParams) {
      var ref = firebase.database().ref();
      var activeUserNode = ref.child('analytics/activeUser');
      var challengeStats = ref.child('analytics/challengeStats')
      var libraryNode = ref.child('library');

      var bookId = $routeParams.bid;
      if(bookId){
        console.log(bookId);
        $scope.bookStats = getBookStats(bookId);

      }else{
        getActiveUser();
        $scope.books = bookRanking();

        $scope.bookPage = function(bid) {
          $location.path('/educator/analytics/' + bid);
        }
      }

      function getBookStats(bookId){
        var bookStats = [];
        var bookNode = $firebaseArray(libraryNode);
        var challengeStatsObject = $firebaseObject(challengeStats);
        challengeStatsObject.$loaded().then(function(){
          bookNode.$loaded().then(function(){
            var currentBook;
            for(var c = 0 ; c<bookNode.length; c++){
              if(bookNode[c].$id === bookId){
                currentBook = bookNode[c];
                $scope.bookTitle = currentBook.bookTitle;
              }
            }
            for(var i = 0; i < currentBook.sequence.length;i++){
              var toBeSavedChapter = {};
              var currentChapter = currentBook.sequence[i];
              toBeSavedChapter.title = currentChapter.chapterTitle;
              toBeSavedChapter.qnsCount = 0;
              toBeSavedChapter.qns = [];
              var uniqueUsersCompleted = {};
              var uniqueUsersAttempted = {};
              if(currentChapter.qns != null){
                toBeSavedChapter.qnsCount = currentChapter.qns.length;
                for(var a = 0; a < currentChapter.qns.length; a++){
                  var qns = currentChapter.qns[a];
                  var qid = qns.qid;
                  var toBeSavedQns = {};
                  toBeSavedQns.title = qns.qnsTitle;
                  toBeSavedQns.totalUserAttempted = 0;
                  toBeSavedQns.totalUserCompleted = 0;
                  toBeSavedQns.avgDuration = "-";
                  toBeSavedQns.revisitCount = 0;
                  if (challengeStatsObject[qid] != null){
                    var qnsStats = challengeStatsObject[qid];
                    if(qnsStats.userTimings){
                      toBeSavedQns.totalUserAttempted = Object.keys(qnsStats.userTimings).length;
                    }
                    if(qnsStats.averageTime){
                      var avgTime = qnsStats.averageTime;
                      var min = (avgTime/1000/60) << 0;
                      var sec = (avgTime/1000) % 60;
                      sec = Math.round(sec);
                      toBeSavedQns.avgDuration = min+":"+sec ;
                    }else{
                      toBeSavedQns.avgDuration ="-";
                    }
                    if(qnsStats.revisitRecords){
                      toBeSavedQns.revisitCount = qnsStats.revisitRecords;
                    }
                    Object.assign(uniqueUsersAttempted,qnsStats.userTimings);
                    if(qnsStats.userCompletedRecords != null){
                      toBeSavedQns.totalUserCompleted = Object.keys(qnsStats.userCompletedRecords).length;
                      for(var user in qnsStats.userCompletedRecords){
                        if(uniqueUsersCompleted[user] != null){
                          uniqueUsersCompleted[user].completedCount ++;
                          var endDate = new Date(qnsStats.userTimings[user].endTime);
                          var startDate = new Date(qnsStats.userTimings[user].startTime);
                          uniqueUsersCompleted[user].totalTime += Math.abs(endDate-startDate);
                        }else{
                          uniqueUsersCompleted[user] = {};
                          uniqueUsersCompleted[user].completedCount = 1;
                          var endDate = new Date(qnsStats.userTimings[user].endTime);
                          var startDate = new Date(qnsStats.userTimings[user].startTime);
                          uniqueUsersCompleted[user].totalTime = Math.abs(endDate-startDate);
                        }
                      }
                    }
                  }
                  toBeSavedChapter.qns.push(toBeSavedQns);
                }
              }
              var totalChapterCompletedProgress = 0;
              toBeSavedChapter.totalUserCompleted = 0;
              var totalTimeForFullComplete = 0;

              for(var user in uniqueUsersCompleted){
                totalChapterCompletedProgress+= (uniqueUsersCompleted[user].completedCount/toBeSavedChapter.qnsCount);
                if(uniqueUsersCompleted[user].completedCount == toBeSavedChapter.qnsCount){
                  toBeSavedChapter.totalUserCompleted ++;
                  totalTimeForFullComplete += uniqueUsersCompleted[user].totalTime;
                }
              }
              var totalUserAttempted = Object.keys(uniqueUsersAttempted).length;
              toBeSavedChapter.totalUserAttempted = totalUserAttempted;
              if(totalUserAttempted == 0){
                toBeSavedChapter.avgProgress = 0;
              }else{
                toBeSavedChapter.avgProgress = parseFloat(Math.round((totalChapterCompletedProgress / totalUserAttempted * 100) * 100) / 100);
              }
              if(totalTimeForFullComplete != 0){
                var avgDuration = totalTimeForFullComplete / toBeSavedChapter.totalUserCompleted;
                var min = (avgDuration/1000/60) << 0;
                var sec = (avgDuration/1000) % 60;
                toBeSavedChapter.avgDuration = min+":"+sec;
              }else{
                toBeSavedChapter.avgDuration = "-";
              }
              bookStats.push(toBeSavedChapter);
              console.log(bookStats);
            }
          });
        });

        return bookStats;
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
              book.id = bid.$id;
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
          return activeUser;
        });
      }
    }

})();
