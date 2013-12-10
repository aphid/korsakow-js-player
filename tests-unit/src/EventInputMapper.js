describe("org.korsakow.domain.EventInputMapper", function() {
	it("should map an event XML node to an Event object", function specEventMap () {
		var data = createExampleEvent();
		var dao = org.korsakow.domain.Dao.create(data);
		var mapper = new org.korsakow.domain.EventInputMapper(dao);
		var event = mapper.map(data.children());

		console.log('hello sir', event);
		expect(event.id).toEqual(35);
		expect(event.trigger.id).toEqual(253);
		expect(event.trigger.type).toEqual('org.korsakow.trigger.SnuTime');
		expect(event.trigger.time).toEqual(0);
//		expect(event.predicate.id).toEqual(254);
//		expect(event.rule.id).toEqual(118);
	});

	function createExampleEvent() {
		var root = jQuery(jQuery.parseXML(
			'<Event> <id><![CDATA[252]]></id> </Event>'));
		var trigger = createExampleTrigger();
		root[0].appendChild(trigger[0]);
		return root;
		var node = jQuery.parseXML('<Event/>');
		var id_node = jQuery.parseXML('<id>35</id>');
		var trigger_node = jQuery.parseXML('<Trigger> <id>253</id> <type>org.korsakow.trigger.SnuTime</type> <time>0</time> </Trigger>');
		var pred_node = jQuery.parseXML('<Predicate> <id>254</id> <type>org.korsakow.predicate.True</type> <predicates/> </Predicate>');
		var rule_node = jQuery.parseXML('<Rule> <id>118</id> <type>org.korsakow.rule.Search</type> <keywords/> <rules> <Rule> <id>120</id> <type>org.korsakow.rule.KeywordLookup</type> <keywords> <Keyword>couple</Keyword> </keywords> <rules/> </Rule> </rules> <keepLinks>false</keepLinks> </Rule>');
		node.appendChild(id_node);
		node.appendChild(trigger_node);
		node.appendChild(pred_node);
		node.appendChild(rule_node);
		return node;
	}

	function createExampleTrigger() {
		var trigger = jQuery(jQuery.parseXML(
			'<Trigger> <id><![CDATA[253]]></id> <type><![CDATA[org.korsakow.trigger.SnuTime]]></type> <time><![CDATA[0]]></time> </Trigger>'));
		return trigger;
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
		var pred_node = jQuery.parseXML('<Predicate> <id>254</id> <type>org.korsakow.predicate.True</type> <predicates/> </Predicate>');
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
		var trigger_node = jQuery.parseXML('<Trigger> <id>253</id> <type>org.korsakow.trigger.SnuTime</type> <time>0</time> </Trigger>');
		return trigger_node;
	}
});
