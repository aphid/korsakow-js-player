
describe("org.korsakow.domain.rule.KeywordLookup", function() {
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
	
	it("should return results containing matching SNUs but not the current SNU", function() {
        var currentSnu = makeSnu(0);
        
		var expectedSnus = [
            makeSnu(1),
            makeSnu(2)
        ];

		var dao = mock(org.korsakow.domain.Dao);
		when(dao).find().thenReturn(expectedSnus.concat([currentSnu]));

		var env = mock(org.korsakow.Environment);
		when(env).getDao().thenReturn(dao);
		when(env).getCurrentSnu().thenReturn(currentSnu);

		var rule = new org.korsakow.domain.rule.KeywordLookup(1, makeKeywords(['anything']), '');
		var results = new org.korsakow.SearchResults();
		
		rule.execute(env, results);
		
		expect(results.results.length).toEqual(expectedSnus.length);
		expect(results.results[0].snu).toEqual(expectedSnus[0]);
		expect(results.results[1].snu).toEqual(expectedSnus[1]);
	});
	
	it("should rank SNUs proportional to the number of matching keywords", function() {
		var expectedKeywords = makeKeywords(['nonlinear', 'interactive', 'database']);
		
		var expectedSnus = [
            makeSnu(1, ['nonlinear']),
            makeSnu(2, ['interactive', 'awesome', 'database', 'nonlinear']),
            makeSnu(3, ['awesome', 'sauce', 'interactive', 'database'])
        ];

		var dao = mock(org.korsakow.domain.Dao);
		when(dao).find().then(function(opts) {
			return expectedSnus.filter(function(snu) {
				return snu.keywords.some(function(k) { return k.value == opts.keyword; });
			});
		});

		var env = mock(org.korsakow.Environment);
		when(env).getDao().thenReturn(dao);
		when(env).getDefaultSearchResultIncrement().thenReturn(1);
		
		var rule = new org.korsakow.domain.rule.KeywordLookup(1, expectedKeywords, '');
		var results = new org.korsakow.SearchResults();
		
		rule.execute(env, results);
		
		expect(results.results.length).toEqual(expectedSnus.length);
		expect(results.resultOfSnu(expectedSnus[0]).score).toEqual(1);
		expect(results.resultOfSnu(expectedSnus[1]).score).toEqual(3);
		expect(results.resultOfSnu(expectedSnus[2]).score).toEqual(2);
	});
	
	it("should rank SNUs proportional to their rating", function() {
		var expectedSnus = [
            makeSnu(1, [], 10),
            makeSnu(2, [], 20),
            makeSnu(3, [], 30),
        ];

		var dao = mock(org.korsakow.domain.Dao);
		when(dao).find().thenReturn(expectedSnus);

		var env = mock(org.korsakow.Environment);
		when(env).getDao().thenReturn(dao);
		when(env).getDefaultSearchResultIncrement().thenReturn(2);

		var rule = new org.korsakow.domain.rule.KeywordLookup(1, makeKeywords(['anything']), '');
		var results = new org.korsakow.SearchResults();
		
		rule.execute(env, results);
		
		expect(results.results.length).toEqual(expectedSnus.length);
		expect(results.resultOfSnu(expectedSnus[0]).score).toEqual(2*10);
		expect(results.resultOfSnu(expectedSnus[1]).score).toEqual(2*20);
		expect(results.resultOfSnu(expectedSnus[2]).score).toEqual2*(30);
	});
});

