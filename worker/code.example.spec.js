//Code runs in  /var/task and files are saved to /tmp
var chai = require('chai'),
    expect = chai.expect;
    require('./code.js');

// user provided tests  
describe('The function', function () {       
   it('should add should add numbers', function () {
         expect(add(1,2)).to.equal(3);
    });
    it('should subtract numbers', function () {
         expect(subtract(2,1)).to.equal(1);
    });
}); 