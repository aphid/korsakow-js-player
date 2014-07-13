
describe("org.korsakow.ui.ImageUI", function() {
	JsMockito.Integration.importTo(window);
	
	it("should initialize duration, if available", function() {
		var image = new org.korsakow.domain.Image();
		image.duration = 1234;
		var ui = new org.korsakow.ui.ImageUI(image);
		expect(ui.duration()).toEqual(1234);
	});
	it("should initialize duration to default if not specified", function() {
		var image = new org.korsakow.domain.Image();
		image.duration = undefined;
		var ui = new org.korsakow.ui.ImageUI(image);
		expect(ui.duration()).toEqual(5000);
	});
	it("should get and set currentTime", function() {
		var image = new org.korsakow.domain.Image();
		var ui = new org.korsakow.ui.ImageUI(image);
		expect(ui.currentTime()).toEqual(0);
		ui.currentTime(1234);
		expect(ui.currentTime()).toEqual(1234);
	});
	it("should set isEnded when playback completes", function() {
		var image = new org.korsakow.domain.Image();
		image.duration = 0;
		var ui = new org.korsakow.ui.ImageUI(image);
		ui.play();
		org.korsakow.Timeout.flush(100);
		org.korsakow.Interval.flush(100);
		expect(ui.ended()).toEqual(true);
	});
	it("should emit events and set source on load", function() {
		var image = new org.korsakow.domain.Image();
		var ui = new org.korsakow.ui.ImageUI(image);
		var canplay = org.korsakow.mock.whenEvent(ui.element, 'canplay');
		var loadedmetadata = org.korsakow.mock.whenEvent(ui.element, 'loadedmetadata');
		var canplaythrough = org.korsakow.mock.whenEvent(ui.element, 'canplaythrough');
		
		ui.load('foo.jpg');
		
		verify(canplay);
		verify(loadedmetadata);
		verify(canplaythrough);
		expect(ui.element.attr('src')).toEqual('foo.jpg');
		expect(ui.element.prop('readyState')).toEqual(4);
	});
	it("should clear interval, set state and emit events on pause", function() {
		var image = new org.korsakow.domain.Image();
		var ui = new org.korsakow.ui.ImageUI(image);
		var paused = org.korsakow.mock.whenEvent(ui.element, 'paused');
		
		ui.interval = 1;
		ui.isPlaying = true;
		ui.pause();
		
		expect(ui.paused()).toEqual(true);
		expect(org.korsakow.Interval.isCleared(1));
		
		verify(paused);
	});
	it("should get and set currentTime and emit events", function() {
		var image = new org.korsakow.domain.Image();
		var ui = new org.korsakow.ui.ImageUI(image);
		var seeked = org.korsakow.mock.whenEvent(ui.element, 'seeked');
		
		ui.currentTime(123);
		expect(ui.currentTime()).toEqual(123);
		verify(seeked);
	});
	it("should cap currentTime at duration", function() {
		var image = new org.korsakow.domain.Image();
		image.duration = 1000;
		var ui = new org.korsakow.ui.ImageUI(image);
		ui.loop(false);
		ui.play();
		
		org.korsakow.mock.flushTimers(2000);
		expect(ui.currentTime()).toEqual(1000);
	});
	it("should loop", function() {
		var image = new org.korsakow.domain.Image();
		image.duration = 1000;
		var ui = new org.korsakow.ui.ImageUI(image);
		ui.loop(true);
		ui.play();
		
		org.korsakow.mock.flushTimers(600);
		expect(ui.currentTime()).toBeGreaterThan(550);
		expect(ui.currentTime()).toBeLessThan(650);
		
		org.korsakow.mock.flushTimers(600);
		expect(ui.currentTime()).toBeGreaterThan(150);
		expect(ui.currentTime()).toBeLessThan(250);
	});
});
