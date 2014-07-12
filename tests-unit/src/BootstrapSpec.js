
describe("org.korsakow.Bootstrap", function() {
	JsMockito.Integration.importTo(window);
	
	describe('findStartSnu', function() {
		it("should choose a start Snu when there is one", function() {
			var Snu = new org.korsakow.domain.Snu();

			var dao = mock(org.korsakow.domain.Dao.create);
			
			when(dao).find(new JsHamcrest.SimpleMatcher({
					matches: function (obj) {
						return obj.type == 'Snu' &&
							obj.props.starter == true;
					}
				})).thenReturn([Snu]);

			var bs = new org.korsakow.Bootstrap(dao);
			var startSnu = bs.findStartSnu();
			expect(startSnu).toEqual(Snu);
		});
		
		it("should choose any Snu when there are no start Snus", function() {
			var Snu = new org.korsakow.domain.Snu();

			var dao = mock(org.korsakow.domain.Dao.create);
			
			when(dao).find(new JsHamcrest.SimpleMatcher({
				matches: function (obj) {
					return obj.type == 'Snu' &&
						obj.props && obj.props.starter == true;
				}
			})).thenReturn([]);
			
			when(dao).find(new JsHamcrest.SimpleMatcher({
					matches: function (obj) {
						return obj.type == 'Snu' &&
							!obj.props;
					}
				})).thenReturn([Snu]);

			var bs = new org.korsakow.Bootstrap(dao);
			var startSnu = bs.findStartSnu();
			expect(startSnu).toEqual(Snu);
		});
	});
	
	describe('showSplashScreen', function() {
		it("should reject a promise when there is no media specified", function() {
			var dao = mock(org.korsakow.domain.Dao.create);
			var env = {
				project: {}
			};
			var bs = new org.korsakow.Bootstrap(dao);
			bs.env = env;
			var promise = bs.showSplashScreen();
			
			var rejected;
			promise.fail(function() {
				rejected = true;
			});
			expect(rejected).toEqual(true);
		});
		it("should resolve a promise when the splashscreen is clicked", function() {
			var domRoot = jQuery('<div/>');
			var view = jQuery('<div/>').attr('id', 'view').appendTo(domRoot);
			
			var dao = mock(org.korsakow.domain.Dao.create);
			var image = new org.korsakow.domain.Image();
			var env = {
				project: {
					splashScreenMedia: image
				},
				resolvePath: function(p) { return p; },
				createMediaUI: function(m) { return new org.korsakow.ui.ImageUI(m); }
			};
			var bs = new org.korsakow.Bootstrap(dao, domRoot);
			bs.env = env;
			bs.view = view;
			var promise = bs.showSplashScreen();
			
			var resolved;
			promise.done(function() {
				resolved = true;
			});
			
			view.find('.SplashScreen').click();
			expect(resolved).toEqual(true);
		});
	});
});
