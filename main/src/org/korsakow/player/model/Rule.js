NS('org.korsakow.domain.rule');

/* Parent class for rules
 * 
 * TODO: is this class useful?
 */
org.korsakow.domain.Rule = Class.register('org.korsakow.domain.Rule', org.korsakow.domain.DomainObject, {
	initialize: function($super, id, keywords, type) {
		$super(id);
		this.keywords = keywords;
		this.type = type;
	},
	execute: function(env) {
		
	}
});

/* Finds SNUs that contain this rule's keywords. SNU's scores increases for
 * each keyword that matches.
 */
org.korsakow.domain.rule.KeywordLookup = Class.register('org.korsakow.domain.rule.KeywordLookup', org.korsakow.domain.Rule, {
	initialize: function($super, id, keywords, type) {
		$super(id, keywords, type);
		// TODO: assert type == org.korsakow.rule.KeywordLookup
	},
	/*
	 * @param searchResults {org.korsakow.SearchResults}
	 */
	execute: function(env, searchResults) {
		org.korsakow.log.debug('KeywordLookup: ' + this.keywords);
		
		// for each time a snu appears in a list, increase its searchResults
		// (thus, snus searchResults proportionally to the number of keywords
		// they match)
		var currentSnu = env.getCurrentSnu();
		$.each(this.keywords, function(i, keyword) {
			var dao = env.getDao();
			var snus = dao.find({type: 'Snu', keyword: keyword.value});

			for (var j = 0; j < snus.length; ++j) {
				var snu = snus[j];
				if (snu == currentSnu || snu.lives === 0)
					continue;
				var result;
				var index = searchResults.indexOfSnu(snu);

				if ( index == -1 ) {
					result = new org.korsakow.SearchResult(snu, 0);
					searchResults.results.push(result);
				} else
					result = searchResults.results[index];
				result.score += env.getDefaultSearchResultIncrement() * snu.rating;
			}
		});
	}
});
/* Filters from the list any SNU that has any of this rule's keywords
 * 
 */
org.korsakow.domain.rule.ExcludeKeywords = Class.register('org.korsakow.domain.rule.ExcludeKeywords', org.korsakow.domain.Rule, {
	initialize: function($super, id, keywords, type) {
		$super(id, keywords, type);
	},
	execute: function(env, searchResults) {
		jQuery.each(this.keywords, function(i, keyword) {
			var snusToExclude = env.getDao().find({type: 'Snu', keyword: keyword.value});
			jQuery.each(snusToExclude, function(j, snu) {
				searchResults.results.splice( searchResults.indexOfSnu(snu), 1 );
			});
		});
	}
});

/* This Search rule finds a random SNU with the 'ender' property equal to TRUE and adds it to the search results.
*
*/
	org.korsakow.domain.rule.LookupEndfilm = Class.register('org.korsakow.domain.rule.LookupEndfilm', org.korsakow.domain.Rule, {
		initialize: function($super, id, keywords, type) {
	$super(id, keywords, type);
		},
	execute: function(env, searchResults) {
		var dao = env.getDao();
		var snus = dao.find({props: { ender: true }, type: 'Snu'});
		searchResults.results.push( snus[Math.floor(Math.random()*snus.length)]);
	}
});

/* Performs a search by running a series of subrules. Results are displayed
 * in Preview widgets.
 */
org.korsakow.domain.rule.Search = Class.register('org.korsakow.domain.rule.Search', org.korsakow.domain.Rule, {
	initialize: function($super, id, keywords, type, rules, maxLinks) {
		$super(id, keywords, type);
		this.rules = rules;
		this.maxLinks = maxLinks;
	},
	execute: function(env) {
		var searchResults = this.doSearch(env);
		this.processSearchResults(env, searchResults);
	},
	doSearch: function(env) {
		var searchResults = new org.korsakow.SearchResults();
		$.each(this.rules, function(i, rule) {
			rule.execute(env, searchResults);
		});

		searchResults.results.sort(function(a, b) {
			if (b.score == a.score)
				return Math.random()>0.5?1:-1;
			return b.score - a.score;
		});
		return searchResults;
	},
	processSearchResults: function(env, searchResults) {
		var previews = env.getWidgetsOfType('org.korsakow.widget.SnuAutoLink');

		// TODO: support for keeplinks
		jQuery.each(previews, function(i, preview) {
			preview.clear();
		});
		for (var i = 0; (i < searchResults.results.length) && previews.length && (this.maxLinks == null || i < this.maxLinks); ++i) {
			var snu = searchResults.results[i].snu;
			var preview = previews.shift();
			preview.setSnu(snu);
		}
	}
});
