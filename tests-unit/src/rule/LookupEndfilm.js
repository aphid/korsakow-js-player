
describe("org.korsakow.domain.rule.LookupEndfilm", function() {
	JsMockito.Integration.importTo(window);
	
	function makeKeywords(keywords) {
		return (keywords||[]).map(function(k){ return new org.korsakow.domain.Keyword(k); });
	}
	function makeSnu(id, ender) {
		var s = new org.korsakow.domain.Snu();
		s.id = id;
		s.lives = null;
		if (ender !== undefined){
			s.ender = ender;	
		}
		return s;
	}
	
	it("should return results containing matching ender SNUs", function() {
        var expectedSnus = [
			makeSnu(0),
			makeSnu(1),
			makeSnu(2),
            makeSnu(3, true),
            makeSnu(4, true),
			makeSnu(5, true)
        ];

		var dao = mock(org.korsakow.domain.Dao);
		when(dao).find().then(function(opts) {
			return expectedSnus.filter(function(snu) {
				if (snu.ender === true){
					return snu;
				}
			});
		});
		var env = mock(org.korsakow.Environment);
		when(env).getDao().thenReturn(dao);
		var rule = new org.korsakow.domain.rule.LookupEndfilm(1, makeKeywords(['anything']), '');
		var results = new org.korsakow.SearchResults();
		rule.execute(env, results);
		expect(results.results.length).toEqual(1);
		expect(results.results[0].id).toBeGreaterThan(2);
		expect(results.results[0].id).toBeLessThan(6);

	});
});

