
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
});
