
describe("org.korsakow.domain.rule.SearchRule", function() {
	JsMockito.Integration.importTo(window);
	
	function makeKeywords(keywords) {
		return (keywords||[]).map(function(k){ return new org.korsakow.domain.Keyword(k); });
	}
	function makeSnu(id) {
		var s = new org.korsakow.domain.Snu();
		s.id = id;
		s.keywords = makeKeywords(keywords||[]);
		s.rating = rating || 1;
		s.lives = null;
		return s;
	}
	
	it("should randomize results with equal scores", function() {

		var N = 100;
		
		var previews = [];
		for (var i = 0; i < N; ++i) {
			var p = mock(org.korsakow.controller.PreviewWidgetController);
			p.index = i;
			when(p).setSnu().then(function(s) {
				this.snu = s;
			});
			previews.push(p);
		}

		var env = mock(org.korsakow.Environment);
		when(env).getWidgetsOfType().thenReturn(previews.concat());

		var setupResults = mock(new org.korsakow.domain.Rule());
		when(setupResults).execute().then(function(env, results) {
			for (var i = 0; i < N; ++i)
				results.results.push(new org.korsakow.SearchResult(new org.korsakow.domain.Snu(i), 1));
		});
		
		var rule = new org.korsakow.domain.rule.Search();
		rule.rules = [ setupResults ]; 
		rule.execute(env);
		// We hope N is "big enough" that the chances of random order == original order
		// is "low enough"
		expect(previews.some(function(p) { return this.index != p.snu.id; } )).toEqual(true);
	});
});

