
describe("org.korsakow.domain.rule.ExcludeKeyword", function() {
	JsMockito.Integration.importTo(window);
	
	function makeKeywords(keywords) {
		return (keywords||[]).map(function(k){ return new org.korsakow.domain.Keyword(k); });
	}
	function makeSnu(id, keywords, rating) {
		var s = new org.korsakow.domain.Snu();
		s.id = id;
		s.keywords = makeKeywords(keywords||[]);
		s.rating = rating || 1;
		s.lives = null;
		return s;
	}
	
	it("should remove any results with matching keywords", function() {

		var matchingSnus = [
            makeSnu(0),
            makeSnu(1),
            makeSnu(2),
        ];
		var otherSnus = [
            makeSnu(10),
            makeSnu(11),
            makeSnu(12),
        ];

		var dao = mock(org.korsakow.domain.Dao);
		when(dao).find().thenReturn(matchingSnus);

		var env = mock(org.korsakow.Environment);
		when(env).getDao().thenReturn(dao);

		var results = new org.korsakow.SearchResults();
		results.results = matchingSnus.concat(otherSnus).map(function(snu) {
			return new org.korsakow.SearchResult(snu);
		});
		
		var rule = new org.korsakow.domain.rule.ExcludeKeywords(1, makeKeywords(['anything']), '');
		rule.execute(env, results);
		
		expect(results.results.length).toEqual(otherSnus.length);
		expect(results.indexOfSnu(matchingSnus[0])).toEqual(-1);
		expect(results.indexOfSnu(matchingSnus[1])).toEqual(-1);
		expect(results.indexOfSnu(matchingSnus[2])).toEqual(-1);
		expect(results.indexOfSnu(otherSnus[0])).not.toEqual(-1);
		expect(results.indexOfSnu(otherSnus[1])).not.toEqual(-1);
		expect(results.indexOfSnu(otherSnus[2])).not.toEqual(-1);
	});
});

