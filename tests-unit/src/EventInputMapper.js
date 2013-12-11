(function () {
	JsMockito.Integration.importTo(window);

	describe("org.korsakow.domain.EventInputMapper", function() {
		it("should map an event XML node to an Event object", function specEventMap () {
			var data = createExampleEvent();
//			var dao = mock(org.korsakow.domain.Dao.create)(data);
			var dao = new org.korsakow.domain.Dao.create(data);
			var mapper = new org.korsakow.domain.EventInputMapper(dao);
			var event = mapper.map(data);

			expect(event.id).toEqual(35);
			expect(event.trigger.id).toEqual(253);
			expect(event.trigger.time).toEqual(20);
			expect(event.predicate.id).toEqual(254);
			expect(event.rule.id).toEqual(118);
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
})();
