describe("org.korsakow.domain.EventInputMapper", function() {
	it("should map an event XML node to an Event object", function specEventMap () {
		var node = createExampleEvent();
		var dao = new org.korsakow.domain.Dao(node);
		var mapper = new org.korsakow.domain.EventInputMapper(dao);
		var event = mapper.map(node);

		expect(event.id).toEqual(35);
		expect(event.predicate.id).toEqual(254);
		expect(event.trigger.id).toEqual(253);
		expect(event.trigger.type).toEqual('org.korsakow.trigger.SnuTime');
		expect(event.rule.id).toEqual(118);
	});

	function createExampleEvent() {
		var node = $('<Event/>');
		var id_node = $('<id>35</id>');
		var trigger_node = $('<Trigger> <id>253</id> <type>org.korsakow.trigger.SnuTime</type> <time>0</time> </Trigger>');
		var pred_node = $('<Predicate> <id>254</id> <type>org.korsakow.predicate.True</type> <predicates/> </Predicate>');
		var rule_node = $('<Rule> <id>118</id> <type>org.korsakow.rule.Search</type> <keywords/> <rules> <Rule> <id>120</id> <type>org.korsakow.rule.KeywordLookup</type> <keywords> <Keyword>couple</Keyword> </keywords> <rules/> </Rule> </rules> <keepLinks>false</keepLinks> </Rule>');
		node.append(id_node);
		node.append(trigger_node);
		node.append(pred_node);
		node.append(rule_node);
		return node;
	}
});

describe('org.korsakow.domain.PredicateInputMapper', function () {
	it("should map an event XML node to an Predicate object", function specPredicateMap () {
		var node = createExamplePredicate();
		var dao = new org.korsakow.domain.Dao(node);
		var mapper = new org.korsakow.domain.PredicateInputMapper(dao);
		var pred = mapper.map(node);

		expect(pred.id).toEqual(254);
		expect(pred.type).toEqual('org.korsakow.predicate.True');
	});

	function createExamplePredicate() {
		var pred_node = $('<Predicate> <id>254</id> <type>org.korsakow.predicate.True</type> <predicates/> </Predicate>');
		return pred_node;
	}
});

describe('org.korsakow.domain.TriggerInputMapper', function () {
	it("should map an event XML node to an Predicate object", function specTriggerMap () {
		var node = createExampleTrigger();
		var dao = new org.korsakow.domain.Dao(node);
		var mapper = new org.korsakow.domain.TriggerInputMapper(dao);
		var trig = mapper.map(node);

		expect(trig.id).toEqual(253);
		expect(trig.type).toEqual('org.korsakow.trigger.SnuTime');
	});

	function createExampleTrigger() {
		var trigger_node = $('<Trigger> <id>253</id> <type>org.korsakow.trigger.SnuTime</type> <time>0</time> </Trigger>');
		return trigger_node;
	}
});
