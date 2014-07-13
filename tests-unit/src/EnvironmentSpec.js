
describe("org.korsakow.Environment", function() {
	JsMockito.Integration.importTo(window);
	
	describe('togglePause', function() {
		var view, dao, localStorage, mockCtrl;
		var currentMainMedia, autoLink, fixedLink, other;
		
		beforeEach(function() {
			view = jQuery('<div></div>')
				.append('<div id="pause" />')
				.append('<div id="view" />')
				.find('#view');
			dao = {};
			localStorage = {};
			
			mockCtrl = function(data) {
				return mock(jQuery.extend({
					play: function() {},
					pause: function() {},
					paused: function() {},
					resume: function() {}
				}, data || {}));
			};
			
			currentMainMedia = mockCtrl();
			
			autoLink = mockCtrl({
				model: {
					type: 'org.korsakow.widget.SnuAutoLink'
				}
			});
			fixedLink = mockCtrl({
				model: {
					type: 'org.korsakow.widget.SnuFixedLink'
				}
			});
			other = mockCtrl({
				model: {
					type: 'org.korsakow.widget.Other'
				}
			});
			
			env = new org.korsakow.Environment(view, dao, localStorage);
			env.interfaceController = {
				controllers: []
			}
			env.currentMainMedia = currentMainMedia;
		});
		it('should pause the mainMedia and previews when already playing', function() {
			env.interfaceController.controllers = [
          		autoLink, fixedLink, other
   			];

			when(currentMainMedia).paused().thenReturn(false);
   			
   			env.togglePause();
   			verify(currentMainMedia).pause();
   			verify(autoLink).pause();
   			verify(fixedLink).pause();
   			verifyZeroInteractions(other);
		});
		it('should play the mainMedia and resume previews when already paused', function() {
			env.interfaceController.controllers = [
           		autoLink, fixedLink, other
			];
			when(currentMainMedia).paused().thenReturn(true);
			
			env.togglePause();
			
			verify(currentMainMedia).play();
			verify(autoLink).resume();
			verify(fixedLink).resume();
			verifyZeroInteractions(other);
		});
	});
});
