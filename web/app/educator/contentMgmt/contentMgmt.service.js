(function() {

  angular
    .module('app.contentMgmt')
    .factory('contentMgmtService', contentMgmtService);


  contentMgmtService.$inject = ['$firebaseObject', '$firebaseAuth','$location', 'commonService'];
  
  function contentMgmtService($firebaseObject, $firebaseAuth,$location, commonService) {
  	//updating chapterNode
  	 	
  	// get node of course content and course map
  	var courseSeqNodeRef = commonService.firebaseRef().child('courseSequence');
	var chapterNodeRef = commonService.firebaseRef().child('course/chapters');
	var questionNodeRef = commonService.firebaseRef().child('course/questions');
	var answerKeyNodeRef = commonService.firebaseRef().child('answerKey');
	var service = {
      updateChapter: updateChapter,
      getAllChapters: getAllChapters,
      getCourseSeq:getCourseSeq,
	  getChapter:getChapter,
	  updateCourseSeq:updateCourseSeq,
	  deleteChapter:deleteChapter
    };
	
	return service;  
	  
	
  	//chapter functions
  	function updateChapter (chapter,isNewChapter) {
  		// retrieve courseSeq node
		var courseSeq = $firebaseObject(courseSeqNodeRef);
		courseSeq.$loaded().then(function(){
  		 	// if user wants to create chapter 
			var cid = chapter.cid; 
			if(isNewChapter) {
				// checking if chapterTitle already exist
				for(var element in courseSeq) {
					if(element.chapterTitle === chapter.chapterTitle) {
						//response this chapter is being used now.
						return "This chapter name is being used now.";
					}
				}
				
			}

			if(chapter.cid) {
				//generate new cid 
				cid = 000;
			}
			// create new chapter node & fill it up
			var chapterNode = {helpRoomCode:"",chapterTitle:""};
			// create courseSeq node & fill it up
			var courseSeqNode = {cid:cid,chapterTitle:""};
			// update database
			chapterNodeRef.update({cid:chapterNode});
			courseSeqNodeRef.update(courseSeqNode,function onComplete(){
				
				if(isNewChapter) {
					return "Chapter created!"
				}else {
					return "Chapter updated!"
				}
			});
			
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

	function getCourseSeq(){
		var courseSeq = $firebaseObject(courseSeqNodeRef);
		courseSeq.$loaded().then(function(){
			return courseSeq;
		});
		// return them
  	}

	function getChapter(cid) {
		chapterNodeRef.once("value", function(snapshot) {
			snapshot.forEach(function(element) {
				if(cid === element.key) {
					return $firebaseObject(chapterNodeRef.child(cid));
				}
			});	
		});
	}

	function updateCourseSeq(courseSeq) {
		var newCourseSeq = [];
		var currentSeq = getCourseSeq();
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

  	function deleteChapter (cid) {
		// get chapter qns and delete them
		var userProfileNodeRef = commonService.firebaseRef().child('userProfiles');

		courseSeqNodeRef.once("value", function(snapshot){
			
			snapshot.forEach(function(chapter) {
				if(chapter.cid === cid) {
					//delete each qns from qns node ,course progress and answerkey node
					for(var qns in chapter.qns) {
						commonService.firebaseRef().child('course/questions/'+qns.qnsid).remove();
						commonService.firebaseRef().child('answerKey/'+qns.qnsid).remove();
						
						// retrieve user profiles
						userProfileNodeRef.once("value", function(snapshot){
							// for each user, remove from their courseProgress the current qns
							snapshot.forEach(function(user) {
								var key = user.key();
								userProfileNodeRef.child(key+'/courseProgress/'+qns.qnsid).remove();
							});
						});
					}
				}

				return true;
			});
		});
  	}
  	
	//questions functions  
	function getQuestion(qid) {
		var questionNodeRef = commonService.firebaseRef().child('course/questions');
		questionNodeRef.once("value", function(snapshot) {
			snapshot.forEach(function(element) {
				if(qid === element.key) {
					return $firebaseObject(questionNodeRef.child(qid));
				}
			});		
		});
	}

	function updateQuestion(question,isNewQuestion) {
		
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

			if(qid) {
				//generate new qid 
				qid = 000;
			}
			// create new question node & fill it up
			var questionNode = {hint:"",qnsDescription:"",qnsInstruction:"",qnsTitle:"",qnsType:"",qns:"",link:""};
			// create courseSeq node & fill it up
			var questionSeqNode = {qid:qid,qnsTitle:""};
			// create answerkey node & fill it up
			var answerkeyNode = {answer:"",msg:[],syntax:[],values:[],answerCells:{}};

			// update database
			questionNodeRef.update({qid:questionNode});
			answerKeyNodeRef.update({qid:answerkeyNode});
			courseSeqNodeRef.child(cid+'/qns').update(questionSeqNode,function onComplete(){
				
				if(isNewQuestion) {
					return "Question created!"
				}else {
					return "Question updated!"
				}
			});
			
		});
	}

	function updateQuestionSeq(questionSeq,cid) {
		var newQuestionSeq = [];
		var index = getChapterIndex(cid);
		var currentSeq = $firebaseObject(courseSeqNodeRef.child(index+'/qns'));
		currentSeq.$loaded().then(function(){
			for(i=0;i<questionSeq.length;i++) {
				for(var chapter in questionSeq) {
					if(questionSeq[i].title === currentSeq.qnsTitle){
						newQuestionSeq.push(chapter);
					}
				}
			}
			courseSeqNodeRef.child(index+'/qns').update(newQuestionSeq);
		});
	}

	function getChapterIndex(cid) {
		var courseSeq = $firebaseObject(courseSeqNodeRef);
		courseSeqNodeRef.once("value", function(snapshot) {
			snapshot.forEach(function(element){
				if(element.key() === cid) {
					return element.key();
				}
			});
		});
  	}

	function deleteQuestion (cid,qid) {
		// get chapter qns and delete them
		var userProfileNodeRef = commonService.firebaseRef().child('userProfiles');
		var index = getChapterIndex(cid);

		courseSeqNodeRef.child('qns/'+index).once("value", function(snapshot){
			snapshot.forEach(function(question) {
				if(question.qid === qid) {
					//delete each qns from qns node ,course progress and answerkey node
					commonService.firebaseRef().child('course/questions/'+qid).remove();
					commonService.firebaseRef().child('answerKey/'+qid).remove();
					
					// retrieve user profiles
					userProfileNodeRef.once("value", function(snapshot){
						// for each user, remove from their courseProgress the current qns
						snapshot.forEach(function(user) {
							var key = user.key();
							userProfileNodeRef.child(key+'/courseProgress/'+qid).remove();
						});
					});
					
				}

				return true;
			});
		});
  	}  
    
  }

})();

