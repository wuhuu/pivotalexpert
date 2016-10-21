(function() {

  angular
    .module('app.contentMgmt')
    .factory('contentMgmtService', contentMgmtService);

    function contentMgmtService($q,$firebaseObject,$firebaseArray, $firebaseAuth,$location, commonService) {

        var ref = firebase.database().ref();
        var libraryNodeRef = ref.child('library');
        var courseSeqNodeRef = ref.child('courseSequence');
		var chapterNodeRef = ref.child('course/chapters');
		var questionNodeRef = ref.child('course/questions');
		var answerKeyNodeRef = ref.child('answerKey');
        var bookID = "";

        var adminSheetRef = ref.child('auth/admin/spreadsheetID');
		var service = {
            updateChapter: updateChapter,
            getAllChapters: getAllChapters,
            getCourseSeq:getCourseSeq,
            getChapter:getChapter,
            updateCourseSeq:updateCourseSeq,
            deleteChapter:deleteChapter,
            getQuestion:getQuestion,
            updateVideoQuestion:updateVideoQuestion,
            updateSlideQuestion:updateSlideQuestion,
            updateQuestionSeq:updateQuestionSeq,
            getChapterIndex:getChapterIndex,
            deleteQuestion:deleteQuestion,
            updateEntireSeq:updateEntireSeq,
            getAnswerKey:getAnswerKey,
            updateMCQ:updateMCQ,
            deleteQuestionFromCM:deleteQuestionFromCM,
            updateCodebox:updateCodebox,
            updateExcel:updateExcel,
            getCourseJson:getCourseJson,
            updateFormQuestion:updateFormQuestion,
            updateBook:updateBook,
            getLibrary:getLibrary,
            deleteBook:deleteBook,
            saveBookID:saveBookID,
            getBookID:getBookID,
            getBook:getBook,
            getAdminSpreadsheetID:getAdminSpreadsheetID,
            copySpreadsheetQns:copySpreadsheetQns,
        };

		return service;

        function saveBookID(bid) {
            bookID = bid;
        }

        function getBookID() {
            return bookID;
        }

        function getBookSeqRef() {
            return libraryNodeRef.child(bookID).child("sequence");
        }
        //add or update book function
        function updateBook(book,isNewBook) {
            var q = $q.defer();
            var libraryNode = $firebaseObject(libraryNodeRef);
            libraryNode.$loaded().then(function(){
                var bid = book.bid;
                if(isNewBook) {
                    // checking if bookTitle already exist
                    angular.forEach(libraryNode, function(value, key) {
                        if(value.bookTitle === book.bookTitle) {
                            //response this book is being used now.
                            return "This Book Title is being used now.";
                        }
                    });
                }

                if(!book.bid) {
                    //generate new bid
                    bid = commonService.guid();
                    book.bid= bid;
                }

                var bookNode = {bookTitle:book.bookTitle,bookDescription:book.bookDescription};
                // update/add to db
                var bookObj ={};
                bookObj[bid]=bookNode;
                libraryNodeRef.update(bookObj,function(error){
                    bookNode["bid"]=bid;
                    q.resolve(bookNode);
                });
            });
            return q.promise;
        }

        //retrieve books
        function getLibrary(){
            return $firebaseArray(libraryNodeRef);
        }

        //delete book
        function getBook(bid) {
            return $firebaseObject(libraryNodeRef.child(bid));
        }

        //delete book
        function deleteBook(bid) {
            libraryNodeRef.child(bid).remove();
        }

        //chapter functions
        function updateChapter (chapter,isNewChapter) {
            // retrieve courseSeq node
            var courseSeq = $firebaseObject(getBookSeqRef());
            courseSeq.$loaded().then(function(){
                    // if user wants to create chapter
                var cid = chapter.cid;
                if(isNewChapter) {
                    // checking if chapterTitle already exist
                    angular.forEach(courseSeq, function(value, key) {
                        if(value.chapterTitle === chapter.chapterTitle) {
                            //response this chapter is being used now.
                            return "This chapter name is being used now.";
                        }
                    });
                }

                if(!chapter.cid) {
                    //generate new cid
                    cid = commonService.guid();
                    chapter.cid= cid;
                }
                // create new chapter node & fill it up
                var chapterNode = {helpRoomCode:cid ,chapterTitle:chapter.chapterTitle};
                // create courseSeq node & fill it up
                //var courseSeqNode = {cid:cid,chapterTitle:chapterTitle};
                // update database
                var chapObj ={};
                chapObj[cid]=chapterNode;
                chapterNodeRef.update(chapObj);
                // courseSeqNodeRef.update(courseSeqNode,function onComplete(){
                // 	if(isNewChapter) {
                // 		return "Chapter created!"
                // 	}else {
                // 		return "Chapter updated!"
                // 	}
                // });
            });
        }

        function getAllChapters(){
        //get all editible chapter information for all chapters
            var chapters = $firebaseObject(chapterNodeRef);
            chapters.$loaded().then(function(){
                return chapters;
            });
        // return them
        }

        function getCourseSeq(bid){
            return $firebaseArray(libraryNodeRef.child(bid).child("sequence"));
        }

        function getCourseJson(){
            return $q.resolve($firebaseObject(ref));
        }

        function getChapter(cid) {
            var q = $q.defer();
            chapterNodeRef.once("value", function(snapshot) {
                snapshot.forEach(function(element) {
                    if(cid === element.key) {
                        q.resolve($firebaseObject(chapterNodeRef.child(cid)));
                    }
                });
            });
            return q.promise;
        }

        // UNUSED
        function updateCourseSeq(courseSeq) {
            var newCourseSeq = [];
            var currentSeq = getCourseSeq(getBookID());
            currentSeq.$loaded().then(function(){
                for(i=0;i<courseSeq.length;i++) {
                    for(var chapter in courseSeq) {
                        if(courseSeq[i].title === currentSeq.chapterTitle){
                            newCourseSeq.push(chapter);
                        }
                    }
                }

                courseSeqNodeRef.update(newCourseSeq);
            });
        }

        function updateEntireSeq(courseSequence) {
            var q = $q.defer();
            chapterNodeRef.once("value", function(snapshot) {
                angular.forEach(courseSequence, function(value, key) {
                    if(!value.cid){
                        var cid = commonService.guid();
                        value.cid = cid;
                        updateChapter(value,true);
                    }
                });

                getBookSeqRef().set(courseSequence,function(error){
                    q.resolve(courseSequence);
                });
            });

            return q.promise;
        }

        //questions functions
        function getQuestion(qid) {
            return $firebaseObject(ref.child('course/questions/'+qid));
        }

        function updateVideoQuestion(question,isNewQuestion) {
            var q =$q.defer();
            // retrieve courseSeq node
            var questionNode = $firebaseObject(questionNodeRef);
            questionNode.$loaded().then(function(){
                    // if user wants to create chapter
                var qid = question.qid;
                var cid = question.cid;

                if(isNewQuestion) {
                    // checking if chapterTitle already exist
                    for(var element in questionNode) {
                        if(element.qnsTitle === question.qnsTitle) {
                            //response this chapter is being used now.
                            return "This Question Title is being used now.";
                        }
                    }
                }

                if(!qid) {
                    //generate new qid
                    qid = commonService.guid();
                    question.qid = qid;
                }
                //set url to temp variable
                var youtubeUrl = question.link;

                //function to retrive Youtube ID
                function YouTubeGetID(url){
                  var ID = '';
                  url = url.replace(/(>|<)/gi,'').split(/(vi\/|v=|\/v\/|youtu\.be\/|\/embed\/)/);
                  if(url[2] !== undefined) {
                    ID = url[2].split(/[^0-9a-z_\-]/i);
                    ID = ID[0];
                  }
                  else {
                    ID = url;
                  }
                    return ID;
                }

                //change url to id
                question.link = YouTubeGetID(youtubeUrl);


                // create new question node & fill it up

                var questionNode = {
                    qnsDescription:question.qnsDescription,
                    qnsInstruction:question.qnsInstruction,
                    qnsTitle:question.qnsTitle,
                    qnsType:question.qnsType,
                    link:question.link
                };
                // create courseSeq node & fill it up
                var questionSeqNode = {qid:question.qid,qnsTitle:question.qnsTitle,qnsType:question.qnsType};

                // update database
                questionNodeRef.child(qid).update(questionNode);

                var courseArray = $firebaseObject(getBookSeqRef());
                getChapterIndex(cid).then(function(chapIndex){
                    if(!isNewQuestion) {
                        getQnsIndex(chapIndex,qid).then(function(qnsIndex){
                            courseArray.$loaded().then(function(){
                                if(courseArray[chapIndex]!=null) {
                                    qnsIndex = ""+qnsIndex;
                                    courseArray[chapIndex].qns[qnsIndex] = questionSeqNode;
                                        courseArray.$save(chapIndex).then(function(){
                                            q.resolve(true);
                                            if(isNewQuestion) {
                                                return "Question created!"
                                            }else {
                                                return "Question updated!"
                                            }
                                        });
                                }
                            });
                        });
                    }else {
                        courseArray.$loaded().then(function(){
                            if(courseArray[chapIndex]!=null) {
                                if(courseArray[chapIndex].qns) {
                                    courseArray[chapIndex].qns.push(questionSeqNode);
                                } else {
                                    courseArray[chapIndex].qns = [];
                                    courseArray[chapIndex].qns.push(questionSeqNode);
                                }
                                courseArray.$save(chapIndex).then(function(){
                                    q.resolve(true);
                                    if(isNewQuestion) {
                                        return "Question created!"
                                    }else {
                                        return "Question updated!"
                                    }
                                });
                            }
                        });
                    }
                });
            });
            return q.promise;
        }

        function updateSlideQuestion(question,isNewQuestion) {
            // retrieve courseSeq node
            var questionNode = $firebaseObject(questionNodeRef);
            var q =$q.defer();
            questionNode.$loaded().then(function(){
                    // if user wants to create chapter
                var qid = question.qid;
                var cid = question.cid;

                if(isNewQuestion) {
                    // checking if chapterTitle already exist
                    for(var element in questionNode) {
                        if(element.qnsTitle === question.qnsTitle) {
                            //response this chapter is being used now.
                            return "This Question Title is being used now.";
                        }
                    }

                }

                if(!qid) {
                    //generate new qid
                    qid = commonService.guid();
                    question.qid = qid;
                }
                // create new question node & fill it up
                var tempSlides = question.slides;
                question.slides =[];
                for(var i = 0; i<tempSlides.length;i++){
                    var currentSlide = {
                        explanation:tempSlides[i]['explanation'],
                        imageLink:tempSlides[i]['imageLink']
                    }
                    question.slides.push(currentSlide);
                }

                var questionNode = {
                                    qnsTitle:question.qnsTitle,
                                    qnsType:question.qnsType,
                                    slides:question.slides
                                };
                // create courseSeq node & fill it up
                var questionSeqNode = {qid:question.qid,qnsTitle:question.qnsTitle,qnsType:question.qnsType};
                // update database
                questionNodeRef.child(qid).update(questionNode);
                var courseArray = $firebaseObject(getBookSeqRef());
                getChapterIndex(cid).then(function(chapIndex){
                    if(!isNewQuestion) {
                        getQnsIndex(chapIndex,qid).then(function(qnsIndex){
                            courseArray.$loaded().then(function(){
                                if(courseArray[chapIndex]!=null) {
                                    qnsIndex = ""+qnsIndex;
                                    courseArray[chapIndex].qns[qnsIndex] = questionSeqNode;
                                        courseArray.$save(chapIndex).then(function(){
                                            q.resolve(true);
                                            if(isNewQuestion) {
                                                return "Question created!"
                                            }else {
                                                return "Question updated!"
                                            }
                                        });
                                }
                            });
                        });
                    }else {
                        courseArray.$loaded().then(function(){
                            if(courseArray[chapIndex]!=null) {
                                if(courseArray[chapIndex].qns) {
                                    courseArray[chapIndex].qns.push(questionSeqNode);
                                } else {
                                    courseArray[chapIndex].qns = [];
                                    courseArray[chapIndex].qns.push(questionSeqNode);
                                }
                                courseArray.$save(chapIndex).then(function(){
                                    q.resolve(true);
                                    if(isNewQuestion) {
                                        return "Question created!"
                                    }else {
                                        return "Question updated!"
                                    }
                                });
                            }
                        });
                    }
                });
            });
            return q.promise;
        }

        function updateQuestionSeq(questionSeq,cid) {
            var newQuestionSeq = [];
            var index = getChapterIndex(cid);
            var currentSeq = $firebaseObject(getBookSeqRef().child(index+'/qns'));
            currentSeq.$loaded().then(function(){
                for(i=0;i<questionSeq.length;i++) {
                    for(var chapter in questionSeq) {
                        if(questionSeq[i].title === currentSeq.qnsTitle){
                            newQuestionSeq.push(chapter);
                        }
                    }
                }
                getBookSeqRef().child(index+'/qns').update(newQuestionSeq);
            });
        }

        function getChapterIndex(cid) {
            var courseSeq = $firebaseObject(getBookSeqRef());
            var q =$q.defer();
            courseSeq.$loaded().then(function(){
                angular.forEach(courseSeq, function(value, key) {
                    if(value.cid === cid) {
                        q.resolve(key);
                        return false;
                    }
                });
            });
            return q.promise;
        }

        function getQnsIndex(chapIndex,qid) {
            var courseSeq = $firebaseArray(getBookSeqRef());
            var q =$q.defer();
            courseSeq.$loaded().then(function(){
                var qnsArr = courseSeq[chapIndex].qns;
                if(qnsArr) {
                }else {
                    qnsArr = [];
                }
                angular.forEach(qnsArr, function(value, key) {
                    if(value.qid === qid) {
                        q.resolve(key);
                        return false;
                    }
                });
                q.resolve(qnsArr.length);
                return false;
            });
            return q.promise;
        }

        function deleteQuestion (cid,qid) {
            // get chapter qns and delete them
            var userProfileNodeRef = ref.child('userProfiles');
            var courseArray = $firebaseObject(getBookSeqRef());
            var q = $q.defer();

            getChapterIndex(cid).then(function(chapIndex){
                getQnsIndex(chapIndex,qid).then(function(qnsIndex){
                    courseArray.$loaded().then(function(){
                        if(courseArray[chapIndex]!=null) {
                            courseArray[chapIndex].qns.splice(qnsIndex,1);
                            courseArray.$save().then(function(ref) {
                                // data has been deleted locally and in the database
                                console.log(ref);
                            }, function(error) {
                                console.log("Error:", error);

                            });
                            ref.child('course/questions/'+qid).remove();
                            ref.child('answerKey/'+qid).remove();

                            userProfileNodeRef.once("value", function(snapshot){
                                // for each user, remove from their courseProgress the current qns
                                snapshot.forEach(function(user) {
                                    var key = user.key;
                                    userProfileNodeRef.child(key+'/courseProgress/'+qid).remove();
                                });
                                q.resolve(true);
                            });
                        }
                    });
                });
            });

            return q.promise;
        }

        function deleteQuestionFromCM(qidList){
            if(qidList.length==0){
                return false;
            }
            var userProfileNodeRef = ref.child('userProfiles');
                $.each(qidList,function(key,value){
                    ref.child('course/questions/'+value).remove();
                    ref.child('answerKey/'+value).remove();

                    userProfileNodeRef.once("value", function(snapshot){
                        // for each user, remove from their courseProgress the current qns
                        snapshot.forEach(function(user) {
                            var key = user.key;
                            userProfileNodeRef.child(key+'/courseProgress/'+value).remove();
                        });
                    });
                });

        }

        function deleteChapter (cidList) {
            // get chapter qns and delete them
            var q = $q.defer();
            if(cidList.length==0){
                q.resolve(false);
            }else {
            var userProfileNodeRef = ref.child('userProfiles');
            var courseArray = $firebaseObject(getBookSeqRef());

                $.each(cidList,function(key,value){
                    if(value!=null) {
                        getChapterIndex(value).then(function(chapIndex){
                            courseArray.$loaded().then(function(){
                                if(courseArray[chapIndex]!=null) {
                                    var chapToDelete = courseArray[chapIndex];
                                    // deleting each question in this chapter from question and answerKey node
                                    angular.forEach(chapToDelete.qns, function(value, key) {
                                        ref.child('course/questions/'+value.qid).remove();
                                        ref.child('answerKey/'+value.qid).remove();
                                    });

                                    // deleting the chapter from course node
                                    ref.child('course/chapters/'+value).remove();

                                    userProfileNodeRef.once("value", function(snapshot){
                                        // for each user, remove from their courseProgress the current qns
                                        snapshot.forEach(function(user) {
                                            var key = user.key;
                                            angular.forEach(chapToDelete.qns, function(value, index) {
                                                userProfileNodeRef.child(key+'/courseProgress/'+value.qid).remove();
                                            });
                                        });
                                        q.resolve(true);
                                    });
                                }
                            });
                        });
                    }
                });
                q.resolve(true);
            }
            return q.promise;
        }

        function getAnswerKey(qid){
            return $firebaseObject(answerKeyNodeRef.child(qid));
        }

        function updateMCQ(question,isNewQuestion) {
            // retrieve courseSeq node
            var questionNode = $firebaseObject(questionNodeRef);
            var q =$q.defer();
            questionNode.$loaded().then(function(){
                    // if user wants to create chapter
                var qid = question.qid;
                var cid = question.cid;

                if(isNewQuestion) {
                    // checking if chapterTitle already exist
                    for(var element in questionNode) {
                        if(element.qnsTitle === question.qnsTitle) {
                            //response this chapter is being used now.
                            return "This Question Title is being used now.";
                        }
                    }

                }

                if(!qid) {
                    //generate new qid
                    qid = commonService.guid();
                    question.qid = qid;
                }
                // create new question node & fill it up
                var answer = [];
                // create answerkey node & fill it up
                $.each(question.mcq, function(index,value){
                    answer.push(value.answer);
                    delete value.answer;
                });

                delete question.$$conf;
                delete question.$priority;
                delete question.cid;
                delete question.$id;
                question.qnsType ="mcq";

                var questionNode = question;

                // create courseSeq node & fill it up
                var questionSeqNode = {qid:question.qid,qnsTitle:question.qnsTitle,qnsType:question.qnsType};

                // update database
                questionNodeRef.child(qid).update(questionNode);
                answerKeyNodeRef.child(qid).update({answer});
                var courseArray = $firebaseObject(getBookSeqRef());
                getChapterIndex(cid).then(function(chapIndex){
                    getQnsIndex(chapIndex,qid).then(function(qnsIndex){
                        courseArray.$loaded().then(function(){
                            if(courseArray[chapIndex]!=null) {
                                qnsIndex = ""+qnsIndex;
                                if(!courseArray[chapIndex].qns) {
                                    courseArray[chapIndex].qns=[];
                                }
                                courseArray[chapIndex].qns[qnsIndex] = questionSeqNode;
                                    courseArray.$save(chapIndex).then(function(){
                                        q.resolve(true);
                                        if(isNewQuestion) {
                                            return "Question created!"
                                        }else {
                                            return "Question updated!"
                                        }

                                    });
                            }

                        });
                    });
                })
                .catch(function(reason){
                    console.log("ERROR CAUGHT: "+ reason)
                });
            });
            return q.promise;
        }

        //ADDIION PART FOR excel and code and FORM
        function updateCodebox(question, isNewQuestion) {

            var q = $q.defer();

            // retrieve question node
            var questionNode = $firebaseObject(questionNodeRef);

            var validQnsTitle = true;
            var cid = question.cid;

            questionNode.$loaded().then(function(){

                //Create new
                if(isNewQuestion) {
                    var qid = commonService.guid();


                    // checking if chapterTitle already exist
                    questionNode.forEach(function(qns) {
                        if(qns.qnsTitle === question.qnsTitle) {
                            //Chapter Title Been used
                            validQnsTitle = false;
                            return;
                        }
                    });
                } else {
                    var qid = question.qid;
                }
                //Valid Question Title
                if(validQnsTitle || !isNewQuestion) {
                    // create new answer nodes & fill it up

                    var testcases = [];
                    for (i = 0; i < question.testcases.length; i++) {
                        testcases.push({name:question.testcases[i].name,expect:question.testcases[i].expect,toEqual:question.testcases[i].toEqual,hint:question.testcases[i].hint});
                    }
                    var functionCode = question.functionCode;
                    console.log(question.initialCode);
                    console.log(qid);

                    delete question.cid;
                    delete question.testcases;
                    delete question.functionCode;
                    delete question.$$conf;
                    delete question.$priority;
                    delete question.$id;
                    console.log(question);

                    //Update to firebase question node
                    questionNodeRef.child(qid).update(question);

                    //Update to firebase answer node
                    answerKeyNodeRef.child(qid).update({testcases:testcases});
                    answerKeyNodeRef.child(qid).update({functionCode:functionCode});

                    //Update course sequence
                    var questionSeqNode = {qid:qid, qnsTitle:question.qnsTitle, qnsType: "code"};

                    //find the chapter cidIndex
                    getChapterIndex(cid).then(function(chapIndex){

                        var courseArray = $firebaseObject(getBookSeqRef());
                        getQnsIndex(chapIndex,qid).then(function(qnsIndex){
                            courseArray.$loaded().then(function(){
                                if(courseArray[chapIndex]!=null) {
                                    //Update to firebase sequence node
                                    getBookSeqRef().child(chapIndex + "/qns/" + qnsIndex).update(questionSeqNode);
                                    q.resolve(true);
                                }
                            });
                        });
                    })
                    .catch(function(reason){
                        console.log("ERROR CAUGHT: "+ reason)
                    });
                } else {
                    q.resolve("This Question Title is being used now.");
                }
            });
            return q.promise;
        }

        function updateExcel(question, isNewQuestion) {

            var q = $q.defer();

            // retrieve question node
            var questionNode = $firebaseObject(questionNodeRef);

            var validQnsTitle = true;
            var cid = question.cid;

            questionNode.$loaded().then(function(){

                //Create new
                if(isNewQuestion) {
                    var qid = commonService.guid();

                    // checking if chapterTitle already exist
                    questionNode.forEach(function(qns) {
                        if(qns.qnsTitle === question.qnsTitle) {
                            //Chapter Title Been used
                            validQnsTitle = false;
                            return;
                        }
                    });

                } else {
                    var qid = question.qid;
                }

                //Valid Question Title
                if(validQnsTitle || !isNewQuestion) {

                    for (i = 0; i < question.testcases.length; i++) {
                        delete question.testcases[i].$$hashKey;
                    }

                    // create new answer nodes & fill it up
                    var answerNode = {testcases:question.testcases};

                    var questionContent = {
                        qnsInstruction:question.qnsInstruction,
                        qnsTitle:question.qnsTitle,
                        qnsType:question.qnsType,
                        sheetID:question.sheetID
                    };

                    //Update to firebase question node
                    questionNodeRef.child(qid).update(questionContent);

                    //Update to firebase answer node
                    answerKeyNodeRef.child(qid).update(answerNode);

                    //Update course sequence
                    var questionSeqNode = {qid:qid, qnsTitle:question.qnsTitle, qnsType: "excel"};

                    //find the chapter cidIndex
                    getChapterIndex(cid).then(function(chapIndex){
                        var courseArray = $firebaseObject(getBookSeqRef());
                        getQnsIndex(chapIndex,qid).then(function(qnsIndex){
                            courseArray.$loaded().then(function(){
                                if(courseArray[chapIndex]!=null) {
                                    //Update to firebase sequence node
                                    getBookSeqRef().child(chapIndex + "/qns/" + qnsIndex).update(questionSeqNode);
                                    q.resolve(true);
                                }
                            });
                        });
                    })
                    .catch(function(reason){
                        console.log("ERROR CAUGHT: "+ reason)
                    });
                } else {
                    q.resolve(false);
                }
            });
            return q.promise;
        }

        function updateFormQuestion(question,isNewQuestion) {

            var q = $q.defer();

            // retrieve question node
            var questionNode = $firebaseObject(questionNodeRef);

            var validQnsTitle = true;
            var cid = question.cid;

            questionNode.$loaded().then(function(){

                //Create new
                if(isNewQuestion) {
                    var qid = commonService.guid();

                    // checking if chapterTitle already exist
                    questionNode.forEach(function(qns) {
                        if(qns.qnsTitle === question.qnsTitle) {
                            //Chapter Title Been used
                            validQnsTitle = false;
                        }
                    });

                } else {
                    var qid = question.qid;
                }

                //Valid Question Title
                if(validQnsTitle || !isNewQuestion) {

                    // create new question node & fill it up
                    var questionContent = {
                        qnsTitle:question.qnsTitle,
                        qnsType:question.qnsType,
                        link:question.link
                    };

                    //Update to firebase question node
                    questionNodeRef.child(qid).update(questionContent);

                    //Update course sequence
                    var questionSeqNode = {qid:qid, qnsTitle:question.qnsTitle, qnsType: "form"};

                    //find the chapter cidIndex
                    getChapterIndex(cid).then(function(chapIndex){
                        var courseArray = $firebaseObject(getBookSeqRef());
                        getQnsIndex(chapIndex,qid).then(function(qnsIndex){
                            courseArray.$loaded().then(function(){
                                if(courseArray[chapIndex]!=null) {
                                    //Update to firebase sequence node
                                    getBookSeqRef().child(chapIndex + "/qns/" + qnsIndex).update(questionSeqNode);
                                    q.resolve(true);
                                }
                            });
                        });
                    })
                    .catch(function(reason){
                        console.log("ERROR CAUGHT: "+ reason);
                        q.resolve(false);;
                    });
                } else {
                    q.resolve(false);
                }
            });
            return q.promise;
        }

        function getAdminSpreadsheetID() {
            var q = $q.defer();
            adminSheetRef.once("value", function(snapshot) {
                q.resolve(snapshot.val());
            });
            return q.promise;
        }

        function copySpreadsheetQns(accessToken, IDCopyFrom, sheetID, IDCopyTo) {
            var discoveryUrl = 'https://sheets.googleapis.com/$discovery/rest?version=v4';
            var deferred = $q.defer();
            gapi.client.load(discoveryUrl).then(function() {
              gapi.client.sheets.spreadsheets.sheets.copyTo({
                spreadsheetId: IDCopyFrom,
                sheetId: sheetID,
                destinationSpreadsheetId: IDCopyTo,
              }).then(function(response) {
                var title = response.result.title.substring(8);
                deferred.resolve(response.result.sheetId);
                updateSheetTitle(IDCopyTo, title, response.result.sheetId);
              });
            });
            return deferred.promise;
        }

        function updateSheetTitle(spreadsheetID, titleName, sheetID) {
            gapi.client.sheets.spreadsheets.batchUpdate({
                spreadsheetId: spreadsheetID,
                requests: [
                  {
                    updateSheetProperties:{
                      properties:{
                        title: titleName,
                        sheetId: sheetID
                      },
                      fields: "title"
                    }
                  }
                ]
              }).then(function(response) {
            });
        }
    }

})();
