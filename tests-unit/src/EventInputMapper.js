(function () {
	JsMockito.Integration.importTo(window);

	describe("org.korsakow.domain.EventInputMapper", function() {
		it("should map an event XML node to an Event object", function specEventMap () {
			var data = createExampleEvent();
			var dao = mock(org.korsakow.domain.Dao.create);
//			var dao = new org.korsakow.domain.Dao.create(data);
			var mapper = new org.korsakow.domain.EventInputMapper(dao);

			var event_id = 35;

			var pred = {id: 254};
			var trigger = new org.korsakow.domain.trigger.SnuTime(253, 20);
			var rule = new org.korsakow.domain.rule.KeywordLookup(118, ['couple'], 'org.korsakow.domain.rule.KeywordLookup');

			when(dao).find(findMatcher(event_id, 'Trigger')).thenReturn([trigger]);
			when(dao).find(findMatcher(event_id, 'Rule')).thenReturn([rule]);
			when(dao).find(findMatcher(event_id, 'Predicate')).thenReturn([pred]);

			var event = mapper.map(data);

			expect(event.id).toEqual(event_id);
			expect(event.trigger.id).toEqual(trigger.id);
			expect(event.predicate.id).toEqual(pred.id);
			expect(event.rule.id).toEqual(rule.id);
		});
	});

	describe("org.korsakow.domain.TriggerInputMapper", function() {
		it("should map an event XML node to an Trigger object", function specEventMap () {
			var data = createExampleTrigger();
			var dao = mock(org.korsakow.domain.Dao.create);
			var mapper = new org.korsakow.domain.TriggerInputMapper(dao);

			var trigger = mapper.map(data);
			expect(trigger.id).toEqual(253);
			// This checks to see that the factory converted it properly.
			expect(trigger.time).toEqual(20);
		});
	});

	describe("org.korsakow.domain.RuleInputMapper", function() {
		it("should map an event XML node to an Rule object", function specEventMap () {
			var data = createExampleRule();
			var dao = mock(org.korsakow.domain.Dao.create);
			var mapper = new org.korsakow.domain.RuleInputMapper(dao);
			var subrule = new org.korsakow.domain.rule.KeywordLookup(120, ['couple'], 'org.korsakow.domain.rule.KeywordLookup');
			when(dao).find(findMatcher(118, 'rules/Rule'))
				.thenReturn([subrule]);

			var rule = mapper.map(data);
			expect(rule.id).toEqual(118);
			expect(rule.type).toEqual('org.korsakow.rule.Search');
			expect(rule.rules[0].id).toEqual(120);
			expect(rule.rules[0].type).toEqual('org.korsakow.domain.rule.KeywordLookup');
		});
	});

	function createExampleRule() {
		var rule_node = jQuery.parseXML('<Rule> <id>118</id> <type>org.korsakow.rule.Search</type> <keywords/> <rules> <Rule> <id>120</id> <type>org.korsakow.rule.KeywordLookup</type> <keywords> <Keyword>couple</Keyword> </keywords> <rules/> </Rule> </rules> <keepLinks>false</keepLinks> </Rule>');
		return jQuery(rule_node).children();
	}

	function createExamplePredicate() {
		var pred_node = jQuery.parseXML('<Predicate> <id>254</id> <type>org.korsakow.predicate.True</type> <predicates/> </Predicate>');
		return jQuery(pred_node).children();
	}

	function createExampleTrigger() {
		var trigger_node = jQuery.parseXML('<Trigger> <id>253</id> <type>org.korsakow.trigger.SnuTime</type> <time>20</time> </Trigger>');
		return jQuery(trigger_node).children();
	}

	function createExampleEvent() {
		var node = jQuery.parseXML('<Event/>');
		var jnode = jQuery(node).children();
		var id_node = jQuery.parseXML('<id>35</id>');
		var trigger_node = createExampleTrigger();
		var pred_node = createExamplePredicate();
		var rule_node = createExampleRule();
		jnode.append(jQuery(id_node).children());
		jnode.append(trigger_node);
		jnode.append(pred_node);
		jnode.append(rule_node);
		return jnode;
	}

	function findMatcher(id, path) {
		return new JsHamcrest.SimpleMatcher({
			matches: function (obj) {
				var result = (obj.parent == id) && (obj.path == path);
				return result;
			},
			describeTo: function (description) {
				description.append('hello');
			}
		});
	}

})();
