describe("org.korsakow.domain.Finder", function() {
	
	it("should find an element by it's ID", function() {
		var xml = jQuery(jQuery.parseXML("<Obj><id>12</id></Obj>"));
		var finder = new org.korsakow.domain.Finder(xml);
		var result = finder.findById(12);
		
		expect(result.text()).toEqual('12');
	});
	
	it("should find a media element by it's ID", function() {
		var xml = jQuery(jQuery.parseXML("<Video><id>4</id></Video>"));
		var finder = new org.korsakow.domain.Finder(xml);
		var result = finder.findById(4);
		
		expect(result.text()).toEqual('4');
	});
	
	it("should find nested elements by parent ID", function() {
		var xml = jQuery(jQuery.parseXML("<root><parent><id>2</id><child><id>4</id></child><child><id>6</id></child></parent></root>"));
		var finder = new org.korsakow.domain.Finder(xml);
		var result = finder.find({parent: 2, type: 'child'});
		expect(result.length).toEqual(2);
		expect(result.eq(0).children('id').text()).toEqual('4');
		expect(result.eq(1).children('id').text()).toEqual('6');
	});
	
	it("should find elements by type", function() {
		var xml = jQuery(jQuery.parseXML("<root><Snu><id>1</id></Snu><NotASnu><id>1</id></NotASnu><Snu><id>2</id></Snu><Snu><id>12</id></Snu></root>"));
		var finder = new org.korsakow.domain.Finder(xml);
		var result = finder.find({type: 'Snu'});
		expect(result.length).toEqual(3);
		expect(result.eq(0).children('id').text()).toEqual('1');
		expect(result.eq(1).children('id').text()).toEqual('2');
		expect(result.eq(2).children('id').text()).toEqual('12');
	});
	it("should find elements by path", function() {
		var xml = jQuery(jQuery.parseXML("<root><a><b><Snu><id>1</id></Snu><Snu><id>2</id></Snu></b></a><c><Snu><id>12</id></Snu></c></root>"));
		var finder = new org.korsakow.domain.Finder(xml);
		var result = finder.find({path:'root/a/b/Snu'});
		expect(result.length).toEqual(2);
		expect(result.eq(0).children('id').text()).toEqual('1');
		expect(result.eq(1).children('id').text()).toEqual('2');
	});
	it("should find elements by keyword", function() {
		var xml = jQuery(jQuery.parseXML("<root>\
				<Snu><id>1</id><keywords><Keyword>dog</Keyword></keywords></Snu>\
				<Snu><id>2</id><keywords><Keyword>dag</Keyword></keywords></Snu>\
				<Snu><id>3</id><keywords><Keyword>cat</Keyword></keywords></Snu>\
				<Snu><id>4</id><keywords><Keyword>dog</Keyword><Keyword>bird</Keyword></keywords></Snu>\
				</root>"));
		var finder = new org.korsakow.domain.Finder(xml);
		var result = finder.find({keyword:'dog', type: 'Snu'});
		expect(result.length).toEqual(2);
		expect(result.eq(0).children('id').text()).toEqual('1');
		expect(result.eq(1).children('id').text()).toEqual('4');
	});
	it("should find elements by property", function() {
		var xml = jQuery(jQuery.parseXML("<root>\
				<Snu><id>1</id><bar>miss</bar></Snu>\
				<Snu><id>2</id><foo>hit</foo></Snu>\
				<Snu><id>3</id><foo>miss</foo></Snu>\
				<Snu><id>4</id><bar>hit</bar></Snu>\
				</root>"));
		var finder = new org.korsakow.domain.Finder(xml);
		var result = finder.find({props: {foo: 'hit'}, type: 'Snu'});
		expect(result.length).toEqual(1);
		expect(result.eq(0).children('id').text()).toEqual('2');
	});
});