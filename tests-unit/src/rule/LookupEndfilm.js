
describe("org.korsakow.domain.rule.KeywordLookup", function() {
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
        var nonEnderSnus = [
			makeSnu(0),
			makeSnu(1),
			makeSnu(2)
		];
        
		var enderSnus = [
            makeSnu(3, true),
            makeSnu(4, true),
			makeSnu(5, true)
        ];

		var dao = mock(org.korsakow.domain.Dao);
		when(dao).find().thenReturn(enderSnus.concat(nonEnderSnus));

		var env = mock(org.korsakow.Environment);
		when(env).getDao().thenReturn(dao);
		when(env).getCurrentSnu().thenReturn(nonEnderSnus[0]);

		var rule = new org.korsakow.domain.rule.LookupEndfilm(1, makeKeywords(['anything']), '');
		var results = new org.korsakow.SearchResults();
		rule.execute(env, results);
		
		expect(results.results.length).toEqual(1);
		console.log(results);
		expect(results.results[0].id).toBeGreaterThan(2);
		expect(results.results[0].id).toBeLessThan(6);

	});
});

