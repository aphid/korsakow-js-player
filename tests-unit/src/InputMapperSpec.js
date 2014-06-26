describe("org.korsakow.domain.InputMapper", function() {
	var ftor = org.korsakow.ftor;
	
	function i(x) {
		return $("<data/>").append($("<x/>").text(x));
	}
	
	function testFailure(parser) {
		var mapper = new org.korsakow.domain.InputMapper();
		parser = ftor(mapper, mapper[parser]);
		var input = $('<elem><id>123</id></elem>');
		var actual = function() { return mapper.parseInt(input, "test"); };
		
		expect(actual).toThrow(new Error("Not found: " + mapper.getClass().className + ".test:123"));
	}
	
	it("should parse an int", function() {
		var mapper = new org.korsakow.domain.InputMapper();
		var expected = 34;
		var input = i(34);
		var actual = mapper.parseInt(input);
		expect(actual).toEqual(expected);
	});
	it("should throw if int not found", function() {
		testFailure("parseInt");
	});

	it("should parse a float", function() {
		var mapper = new org.korsakow.domain.InputMapper();
		var expected = 3.4;
		var input = i(3.4);
		var actual = mapper.parseFloat(input);
		expect(actual).toEqual(expected);
	});
	it("should throw if float not found", function() {
		testFailure("parseFloat");
	});

	it("should parse a string", function() {
		var mapper = new org.korsakow.domain.InputMapper();
		var expected = "hello";
		var input = i("hello");
		var actual = mapper.parseString(input);
		expect(actual).toEqual(expected);
	});
	it("should throw if string not found", function() {
		testFailure("parseString");
	});

	it("should parse a boolean", function() {
		var mapper = new org.korsakow.domain.InputMapper();
		var expected = true;
		var input = i("true");
		var actual = mapper.parseBoolean(input);
		expect(actual).toEqual(expected);
	});
	it("should throw if boolean not found", function() {
		testFailure("parseBoolean");
	});

	it("should parse a color in hex notation", function() {
		var mapper = new org.korsakow.domain.InputMapper();
		var expected = "#FAFAFA";
		var input = i("#FAFAFA");
		var actual = mapper.parseColor(input);
		expect(actual).toEqual(expected);
	});
	it("should throw if color not found", function() {
		testFailure("parseColor");
	});

});