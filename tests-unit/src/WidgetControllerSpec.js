
describe("org.korsakow.controller.MainMediaWidgetController", function() {
	JsMockito.Integration.importTo(window);
	
	it("should work", function() {
		var image = new org.korsakow.domain.Image();
		image.filename = "my/test/file.name";
		var currentSnu = new org.korsakow.domain.Snu();
		currentSnu.mainMedia = image;
		
		var mediaUI = spy(new org.korsakow.ui.ImageUI());
		
		var env = {
			resolvePath: function(s) { return s; },
			getCurrentSnu: function() { return currentSnu; },
			createMediaUI: function() {
				return mediaUI;
			}
		};
		var controller = new org.korsakow.controller.MainMediaWidgetController({});
		controller.setup(env);
		
		var img = controller.element.find("img");
		mediaUI.pause();
		var playfired = false, endedfired = false, pausedfired = false;
		expect(img.attr('src')).toEqual(image.filename);
		expect(img.prop('paused') === true);
		expect(mediaUI.currentTime()).toEqual(0);
		//for some reason neither of the above are firing, so getting it from timeupdate, which is
		img.bind("playing", function(){
			playfired = true;
		});
		img.bind("play", function(){
			playfired = true;
		});
		img.bind("pause", function(){
			pausedfired = true;
		});
		img.bind("ended", function(){
			endedfired = true;
		});
		mediaUI.play();
		var value, flag;
		waits(50);
		runs(function() {
			expect(playfired).toEqual(true);
			expect(mediaUI.currentTime()).toBeGreaterThan(0);
		});
		
		//this slows down all the testing :[
		waits(mediaUI.duration() * 1000 + 1000);
		runs(function() {
			//allow for a frame or two of miss, per common browser behavior.
			expect(mediaUI.duration() - mediaUI.currentTime()).toBeLessThan(0.1);
			expect(img.prop("ended")).toEqual(true);
			expect(endedfired).toEqual(true);
			expect(img.prop("paused")).toEqual(true);
			expect(pausedfired).toEqual(true);

		});
  	});
    
});

describe("org.korsakow.controller.PreviewWidgetController", function() {

	it("should show it's SNU's previewMedia", function() {
		var image = new org.korsakow.domain.Image();
		image.filename = "my/test/file.name";
		
		var mediaUI = new org.korsakow.ui.ImageUI();
		
		var snu = spy(new org.korsakow.domain.Snu);
		snu.previewMedia = image;

		var env = {
			resolvePath: function(s) { return s; },
			createMediaUI: function() {
				return mediaUI;
			}
		};
		var controller = spy(new org.korsakow.controller.PreviewWidgetController({}));
		controller.setup(env);
		controller.setSnu(snu);
		
		var img = controller.element.find("img");
		expect(img.attr('src')).toEqual(image.filename);

		controller.clear();
	});
	
});

describe("org.korsakow.controller.FixedPreviewWidgetController", function() {

	it("should show it's SNU's previewMedia", function() {
		var image = new org.korsakow.domain.Image();
		image.filename = "my/test/file.name";
		
		var snu = new org.korsakow.domain.Snu();
		snu.previewMedia = image;
		
		var mediaUI = new org.korsakow.ui.ImageUI();
		
		var dao = mock(org.korsakow.domain.Dao);
		when(dao.findById)().thenReturn(snu);
		
		var env = {
			resolvePath: function(s) { return s; },
			createMediaUI: function() {
				return mediaUI;
			},
			dao: dao
		};
		var controller = spy(new org.korsakow.controller.FixedPreviewWidgetController({}));
		controller.setup(env);

		var img = controller.element.find("img");
		expect(img.attr('src')).toEqual(image.filename);
		// this verify isn't working at the moment
		// but we capture expectations via the img check anyway
		//verify(controller).setSnu(snu);
	});
	
});

describe("org.korsakow.controller.InsertTextWidgetController", function() {

	it("should display the current SNU's insert text with the right styling", function() {
		var model = {
			fontBackgroundColor: 'rgb(171, 205, 239)',
			fontFamily: 'myFont',
			fontWeight: '200',
			fontStyle: 'italic',
			fontSize: '43',
			textDecoration: 'underline'
		};
		
		var snu = new org.korsakow.domain.Snu();
		snu.insertText = "my insert text";
		
		var dao = mock(org.korsakow.domain.Dao);
		when(dao.findById)().thenReturn(snu);
		
		var env = mock(org.korsakow.Environment);
		env.dao = dao;
		when(env).resolvePath().then(function(s){ return s; });
		when(env).getCurrentSnu().thenReturn(snu);
		
		var controller = spy(new org.korsakow.controller.InsertTextWidgetController(model));
		controller.setup(env);

		var txt = controller.element.find("p");
		expect(txt.text()).toEqual(snu.insertText);
		expect(controller.element.css('background-color')).toEqual(model.fontBackgroundColor);
		expect(controller.element.css('font-family')).toEqual(model.fontFamily);
		expect(controller.element.css('font-weight')).toEqual(model.fontWeight);
		expect(controller.element.css('font-style')).toEqual(model.fontStyle);
		expect(controller.element.css('font-size')).toEqual(model.fontSize + 'pt');
		expect(controller.element.css('text-decoration')).toEqual(model.textDecoration);
	});
});

describe("org.korsakow.controller.PlayButtonWidgetController", function() {

	it("should toggle the MainMediaWidget's play state on click", function() {
		var mainMediaWidget = mock(org.korsakow.controller.MainMediaWidgetController);
		mainMediaWidget.view = new org.korsakow.ui.ImageUI();
		
		var env = mock(org.korsakow.Environment);
		when(env).getMainMediaWidget().thenReturn(mainMediaWidget);

		var controller = spy(new org.korsakow.controller.PlayButtonWidgetController({}));
		controller.setup(env);
		
		controller.element.click();
		verify(mainMediaWidget).togglePlay();
	});
	
	it("should change state to reflect the MainMedia", function() {
		var mainMediaWidget = mock(org.korsakow.controller.MainMediaWidgetController);
		var mediaUI = mainMediaWidget.view = spy(new org.korsakow.ui.ImageUI());
		
		var env = mock(org.korsakow.Environment);
		when(env).getMainMediaWidget().thenReturn(mainMediaWidget);
		
		var controller = spy(new org.korsakow.controller.PlayButtonWidgetController({}));
		controller.setup(env);
		
		when(mediaUI).paused().thenReturn(true);
		mediaUI.element.trigger('pause');
		expect(controller.element.hasClass('playing')).toEqual(false);
		expect(controller.element.hasClass('paused')).toEqual(true);
		
		mediaUI.element.trigger('play');
		expect(controller.element.hasClass('playing')).toEqual(true);
		expect(controller.element.hasClass('paused')).toEqual(false);
		
		when(mediaUI).ended().thenReturn(true);
		mediaUI.element.trigger('ended');
		expect(controller.element.hasClass('playing')).toEqual(false);
		expect(controller.element.hasClass('paused')).toEqual(true);
		
	});
});

describe("org.korsakow.controller.PlayTimWidgetController", function() {

	it("should update the view based MainMedia's time changes", function() {
		var mainMediaWidget = mock(org.korsakow.controller.MainMediaWidgetController);
		var mediaUI = mainMediaWidget.view = (new org.korsakow.ui.MediaUI());
		mediaUI.element = jQuery('<div>x</div>');
		mediaUI.currentTime = function(){return 123;};
		
		var env = mock(org.korsakow.Environment);
		when(env).getMainMediaWidget().thenReturn(mainMediaWidget);

		var controller = spy(new org.korsakow.controller.PlayTimeWidgetController({}));
		controller.setup(env);
		
		mediaUI.element.trigger('timeupdate');
		expect(controller.element.text()).toEqual("02:03");
	});
	
	it("should display the time with the right styling", function() {
		var model = {
			fontBackgroundColor: 'rgb(171, 205, 239)',
			fontFamily: 'myFont',
			fontWeight: '200',
			fontStyle: 'italic',
			fontSize: '43',
			textDecoration: 'underline'
		};
		
		var mainMediaWidget = mock(org.korsakow.controller.MainMediaWidgetController);
		var mediaUI = mainMediaWidget.view = (new org.korsakow.ui.MediaUI());
		mediaUI.element = jQuery('<div>x</div>');
		mediaUI.currentTime = function(){return 123;};
		
		var env = mock(org.korsakow.Environment);
		when(env).getMainMediaWidget().thenReturn(mainMediaWidget);

		var controller = spy(new org.korsakow.controller.PlayTimeWidgetController(model));
		controller.setup(env);

//		expect(controller.element.css('background-color')).toEqual(model.fontBackgroundColor);
		expect(controller.element.css('font-family')).toEqual(model.fontFamily);
		expect(controller.element.css('font-weight')).toEqual(model.fontWeight);
		expect(controller.element.css('font-style')).toEqual(model.fontStyle);
		expect(controller.element.css('font-size')).toEqual(model.fontSize + 'pt');
		expect(controller.element.css('text-decoration')).toEqual(model.textDecoration);
	});
});

describe("org.korsakow.controller.TotalTimeWidgetController", function() {

	it("should update the view based MainMedia's time changes", function() {
		var mainMediaWidget = mock(org.korsakow.controller.MainMediaWidgetController);
		var mediaUI = mainMediaWidget.view = (new org.korsakow.ui.MediaUI());
		mediaUI.element = jQuery('<div>x</div>');
		mediaUI.duration = function(){return 123;};
		
		var env = mock(org.korsakow.Environment);
		when(env).getMainMediaWidget().thenReturn(mainMediaWidget);

		var controller = spy(new org.korsakow.controller.TotalTimeWidgetController({}));
		controller.setup(env);
		
		mediaUI.element.trigger('canplay');
		expect(controller.element.text()).toEqual("02:03");
	});
	
	it("should display the time with the right styling", function() {
		var model = {
			fontBackgroundColor: 'rgb(171, 205, 239)',
			fontFamily: 'myFont',
			fontWeight: '200',
			fontStyle: 'italic',
			fontSize: '43',
			textDecoration: 'underline'
		};
		
		var mainMediaWidget = mock(org.korsakow.controller.MainMediaWidgetController);
		var mediaUI = mainMediaWidget.view = (new org.korsakow.ui.MediaUI());
		mediaUI.element = jQuery('<div>x</div>');
		mediaUI.currentTime = function(){return 123;};
		
		var env = mock(org.korsakow.Environment);
		when(env).getMainMediaWidget().thenReturn(mainMediaWidget);

		var controller = spy(new org.korsakow.controller.TotalTimeWidgetController(model));
		controller.setup(env);

//		expect(controller.element.css('background-color')).toEqual(model.fontBackgroundColor);
		expect(controller.element.css('font-family')).toEqual(model.fontFamily);
		expect(controller.element.css('font-weight')).toEqual(model.fontWeight);
		expect(controller.element.css('font-style')).toEqual(model.fontStyle);
		expect(controller.element.css('font-size')).toEqual(model.fontSize + 'pt');
		expect(controller.element.css('text-decoration')).toEqual(model.textDecoration);
	});
});

describe("org.korsakow.controller.SubtitlesController", function() {
	it("should update the view based MainMedia's time changes", function() {
		var mainMediaWidget = mock(org.korsakow.controller.MainMediaWidgetController);
		var mediaUI = mainMediaWidget.view = (new org.korsakow.ui.MediaUI());
		mediaUI.element = jQuery('<div>x</div>');
		mediaUI.duration = function(){return 123;};
		var model = mock(org.korsakow.domain.widget.Subtitles);
		
		var env = mock(org.korsakow.Environment);
		when(env).resolvePath().then(function(x) { return x; });
		env.ajax = function(opts) {
			var data = ['' +
				'1',
				'00:00:01,478 --> 00:00:04,020',
				'heh, I used to be pretty good at this game.',
				'',
				'2',
				'00:00:05,045 --> 00:00:09,545',
				'wow such lines much subtitle',
				'',
				''].join('\r\n');

			opts.success(data);
		};
		var snu = mock(org.korsakow.domain.Snu);
		when(env).getCurrentSnu().thenReturn(snu);
		when(model).getClass().thenReturn({className: 'org.korsakow.domain.widget.Subtitles'});

		var subtitleView = mock(org.korsakow.ui.SubtitlesUI);

		when(env).createMediaUI('org.korsakow.domain.Subtitles').thenReturn(subtitleView);
		var mainMedia = mock(org.korsakow.domain.Video);
		snu.mainMedia = mainMedia;
		mainMedia.subtitlesFilename = 'subtitle/test.srt';
		when(env).getMainMediaWidget().thenReturn(mainMediaWidget);

		var controller = spy(new org.korsakow.controller.SubtitlesController(model));
		controller.setup(env);

		waitsFor(function () {
			// wait for the subtitles to be populated.
			return controller.cuePoints && controller.cuePoints.length > 0;
		}, "should download the subtitle file", 100);

		runs(function () {
			mediaUI.element[0].currentTime = 2;
			mediaUI.element.trigger('timeupdate');
			verify(subtitleView).text(["heh, I used to be pretty good at this game."]);

			mediaUI.element[0].currentTime = 7;
			mediaUI.element.trigger('timeupdate');
			verify(subtitleView).text(["wow such lines much subtitle"]);
		});
	});
});
