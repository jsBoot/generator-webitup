(function() {
  /*global it:false, describe:false, runs:false, expect:false, waits:false, waitsFor:false*/
  'use strict';

  describe('A test suite', function() {

    runs(function(){

    });

    waits(500);

    waitsFor(function(){

    }, 'Waiting for', 500);

    it('With a test', function(){
      expect(true).toBeTrue();
    });
  });

})();
