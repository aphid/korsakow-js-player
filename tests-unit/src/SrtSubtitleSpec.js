describe("SrtSubtitleParser", function() {
	
	it("should parse SRT text into cue points", function() {
		var parser = new org.korsakow.util.StrSubtitleParser();
		var data = '\n' +
		'1\n' +
		'00:00:01,478 --> 00:00:04,020\n' +
		'Srt Example\n' +
		'\n' +
		'2\n' +
		'00:00:05,045 --> 00:00:09,545\n' +
		'This multiline\n' +
		'Subtitle!\n' +
		'\n' +
		'';
		var subtitles = parser.parse(data);
		expect(subtitles.length).toEqual(2);
		expect(subtitles[0].name).toEqual('0');
		expect(subtitles[0].time).toEqual(1.478);
		expect(subtitles[0].duration).toEqual(4.02 - 1.478);
		expect(subtitles[0].subtitle).toEqual(['Srt Example']);
		expect(subtitles[1].name).toEqual('1');
		expect(subtitles[1].time).toEqual(5.045);
		expect(subtitles[1].duration).toEqual(9.545 - 5.045);
		expect(subtitles[1].subtitle).toEqual(['This multiline', 'Subtitle!']);
	});

	it("should trim whitespace from text lines", function() {
		var parser = new org.korsakow.util.StrSubtitleParser();
		var data = '\n' +
		'1\n' +
		'00:00:01,478 --> 00:00:04,020\n' +
		'          Text with whitespace around it \t\n' +
		'\n' +
		'';
		var subtitles = parser.parse(data);
		expect(subtitles[0].subtitle).toEqual(['Text with whitespace around it']);
	});
	
	it("should throw when the counter is out of order", function() {
		var parser = new org.korsakow.util.StrSubtitleParser();
		var data = '\n' +
		'1\n' +
		'00:00:01,478 --> 00:00:04,020\n' +
		'Srt Example\n' +
		'\n' +
		'3\n' +
		'00:00:05,045 --> 00:00:09,545\n' +
		'This multiline\n' +
		'Subtitle!\n' +
		'\n' +
		'';
		expect(function() {
			parser.parse(data);
		}).toThrow();
	});
	
	it("should throw when the time format is invalid", function() {
		var parser = new org.korsakow.util.StrSubtitleParser();
		var data = '\n' +
		'1\n' +
		'00.00.01,478 --> 00.00.04.020\n' +
		'Srt Example\n' +
		'\n' +
		'';
		expect(function() {
			parser.parse(data);
		}).toThrow();
	});
});