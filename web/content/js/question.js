(function () {
  'use strict';
  angular
      .module('questionss',['ngMaterial', 'ngMessages', 'material.svgAssetsCache'])
      .controller('qnCtrl', function() {
        this.chosenChapter = '';
        this.chapters = ('Chapter 1  Chapter 2  Chapter 3').split('  ').map(function (chapter) { return { abbrev: chapter }; });
        this.chosenQnType = '';
        this.qnTypes = ('MCQ  Spreadsheet  Video  Slides').split('  ').map(function (qnType) { return { abbrev: qnType }; });
      });
})();
