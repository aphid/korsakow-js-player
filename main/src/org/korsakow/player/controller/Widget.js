NS('org.korsakow.controller.widget');

var W = org.korsakow.WrapCallback;

/* Factory that creates widgets based on widgetId's. See the mapping at the bottom of file.
 * 
 */
org.korsakow.controller.WidgetControllerFactory = new org.korsakow.Factory();

org.korsakow.controller.AbstractWidgetController = Class.register('org.korsakow.controller.AbstractWidgetController', org.korsakow.controller.AbstractController, {
	initialize: function($super, model) {
		$super(model);
	},
	setup: function($super, env) {
		$super(env);
		this.element
			.addClass("widget")
			.css({
				left: this.model.x,
				top: this.model.y,
				width: this.model.width,
				height: this.model.height
			})
			;

		var W = function(p) {
			return (100*p/env.project.width) + '%'; 
		};
		var H = function(p) {
			return (100*p/env.project.height) + '%'; 
		};
		
		this.element.css({
			left: W(this.model.x),
			top: H(this.model.y),
			width: W(this.model.width),
			height: H(this.model.height)
		});
		
		this.applyStyles();
	},
	destroy: function($super) {
		$super();
	},
	applyStyles: function() {
		this.element.css({
			'color': this.model.fontColor,
			'background-color' : this.model.fontBackgroundColor,
			'font-family': this.model.fontFamily,
			'font-size': this.model.fontSize,
			'font-weight': this.model.fontWeight,
			'font-style': this.model.fontStyle,
			'text-decoration': this.model.textDecoration,
			'text-align': this.model.horizontalTextAlignment,
			'vertical-align': this.model.verticalTextAlignment
		});
	}
});

org.korsakow.controller.MainMediaWidgetController = Class.register('org.korsakow.controller.MainMediaWidgetController', org.korsakow.controller.AbstractWidgetController, {
	initialize: function($super, model) {
		$super(model);
	},
	setup: function($super, env) {
		$super(env);
		var snu = env.getCurrentSnu();
		var media = snu.mainMedia;
		
		this.element.addClass("MainMedia");
		var mediaUI = this.view = env.createMediaUI(media.getClass().className, media);
		this.element.append(mediaUI.element);
		mediaUI.element.css({
			width: "100%",
			height: "100%"
		})
		.attr("loop", snu.looping?true:false);

		mediaUI.load(env.resolvePath(media.filename));
		mediaUI.play();
		
		// TODO: find a better place for this code to live
		env.getView().bind('keydown', function(event) {
			if (event.which == 32)
				env.togglePause();
		});
	},
	togglePlay: function() {
		var video = this.view;
		if (video.paused()) {
			video.play();
			return true;
		} else {
			video.pause();
			return false;
		}
	},
	paused: function() {
		return this.view && this.view.paused();
	},
	play: function() {
		this.view.play();
	},
	pause: function() {
		this.view.pause();
	}
	
});

org.korsakow.controller.PreviewWidgetController = Class.register('org.korsakow.controller.PreviewWidgetController', org.korsakow.controller.AbstractWidgetController, {
	initialize: function($super, model) {
		$super(model);
		this.mediaUI = null;
		this.snu = null;
	},
	setup: function($super, env) {
		$super(env);

		this.element.addClass("Preview");
		this.shouldPlay = false;
		var This = this;
		this.element.click(W(function() {
			if (!This.snu)
				return;
			if (env.getClickSound())
				env.soundManager.playSound({
					uri: env.resolvePath(env.getClickSound().filename),
					channel: "clickSound",
					fade: 1000
				});
			env.executeSnu(This.snu);
		}));
		this.element.bind('mouseenter touchstart', function() {
			if (this.mediaUI) {
				this.mediaUI.play();
				this.shouldPlay = true;
			}
		}.bind(this));
		this.element.bind('mouseleave touchend touchcancel', function() {
			if (this.mediaUI) {
				this.mediaUI.pause();
				this.shouldPlay = stop;
			}
		}.bind(this));
	},
	destroy: function($super) {
		this.clear();
		$super();
	},
	setSnu: function(snu) {
		this.clear();
		var media = snu.previewMedia;
		var mediaUI = this.env.createMediaUI(media.getClass().className, media);
		this.element.append(mediaUI.element);
		mediaUI.element.css({
			width: "100%",
			height: "100%"
		});
		mediaUI.load(this.env.resolvePath(media.filename));
		mediaUI.loop(true);
		this.snu = snu;
		this.mediaUI = mediaUI;
	},
	clear: function() {
		if (this.mediaUI !== null) {
			this.mediaUI.pause(); 
			this.element.empty();
		}
		this.mediaUI = null;
		this.snu = null;
	},
	resume: function() {
		if (this.shouldPlay) {
			this.play();
		}
	},
	play: function() {
		this.mediaUI && this.mediaUI.play();
	},
	pause: function() {
		this.mediaUI && this.mediaUI.pause();
	}
});

org.korsakow.controller.FixedPreviewWidgetController = Class.register('org.korsakow.controller.FixedPreviewWidgetController', org.korsakow.controller.PreviewWidgetController, {
	setup: function ($super, env) {
		$super(env);
		var snu = env.dao.findById(this.model.snuId);
		this.setSnu(snu);
	}
});

org.korsakow.controller.InsertTextWidgetController = Class.register('org.korsakow.controller.InsertTextWidgetController', org.korsakow.controller.AbstractWidgetController, {
	initialize: function($super, model) {
		$super(model);
	},
	setup: function($super, env) {
		$super(env);

		this.element.addClass("InsertText");

		// TODO: maybe just use a DIV instead of P
		var insertTextContent = jQuery("<p>").html(env.getCurrentSnu().insertText).css({
			'width' : '100%',
			'height' : '100%'
		});
		this.element.append(insertTextContent);

	}
});

org.korsakow.controller.PlayButtonWidgetController = Class.register('org.korsakow.controller.PlayButtonWidgetController', org.korsakow.controller.AbstractWidgetController, {
	initialize: function($super, model) {
		$super(model);
	},
	setup: function($super, env) {
		$super(env);
		this.element.addClass("PlayButton");
		
		This = this;
		var mainMedia = env.getMainMediaWidget();
		var vid = mainMedia.view;
		
		this.element.click(function() {
			mainMedia.togglePlay();
		});

		vid.bind('ended', function() {
			var stillPlaying = false;
			if (!vid.ended())
				stillPlaying = true;
			if (!stillPlaying) {
				This.setPause();
			}
		});
		vid.bind('pause', function() {
			var stillPlaying = false;
			if (!vid.paused())
				stillPlaying = true;
			if (!stillPlaying) {
				This.setPause();
			}
		});
		
		vid.bind('play', function() {
			This.setPlay();
		});
	},
	setPlay: function() {
		this.element.removeClass("paused");
		this.element.addClass("playing");
	},
	setPause: function() {
		this.element.removeClass("playing");
		this.element.addClass("paused");
	}
});

org.korsakow.controller.PlayTimeWidgetController = Class.register('org.korsakow.controller.PlayTimeWidgetController', org.korsakow.controller.AbstractWidgetController, {
	initialize: function($super, model) {
		$super(model);
	},
	setup: function($super, env) {
		$super(env);

		this.element.addClass("PlayTime");
		this.element.css({
			'color' : this.model.fontColor,
			//'background-color' : this.model.fontBackgroundColor,
			'font-family' : this.model.fontFamily,
			'font-weight' : this.model.fontWeight,
			'font-style' : this.model.fontStyle,
			'font-size' : this.model.fontSize+"pt",
			'text-decoration' : this.model.textDecoration

		});
		var playTimeContent = jQuery("<p>").html("00:00").css({
			'width' : '100%',
			'height' : '100%',
			'padding' : '1px',
			'margin' : 0
		});
		
		
		var mainMedia = env.getMainMediaWidget();
		var mediaUI = mainMedia.view;
		mediaUI.bind("timeupdate", function() {
			playTimeContent.html(org.korsakow.Utility.formatTime(mediaUI.currentTime()));
		});
		this.element.append(playTimeContent);
	}
});

org.korsakow.controller.TotalTimeWidgetController = Class.register('org.korsakow.controller.TotalTimeWidgetController', org.korsakow.controller.AbstractWidgetController, {
	initialize: function($super, model) {
		$super(model);
	},
	setup: function($super, env) {
		$super(env);

		this.element.addClass("TotalTime");
		this.element.css({
			'color' : this.model.fontColor,
			//'background-color' : this.model.fontBackgroundColor,
			'font-family' : this.model.fontFamily,
			'font-weight' : this.model.fontWeight,
			'font-style' : this.model.fontStyle,
			'font-size' : this.model.fontSize +"pt",
			'text-decoration' : this.model.textDecoration

		});
		var totalTimeContent = jQuery("<p>").html("00:00").css({
			'width' : '100%',
			'height' : '100%',
			'padding' : 1,
			'margin' : 0
		});
		
		
		var mainMedia = env.getMainMediaWidget();
		var vid = mainMedia.view;
		vid.bind("canplay", function() {
			var newTime = org.korsakow.Utility.formatTime(vid.duration());
			totalTimeContent.html(newTime);
		});
		this.element.append(totalTimeContent);
	}
});
org.korsakow.controller.ScrubberWidgetController = Class.register('org.korsakow.controller.ScrubberWidgetController', org.korsakow.controller.AbstractWidgetController, {
	initialize: function($super, model) {
		$super(model);
	},
	setup: function($super, env) {
		$super(env);

		this.element.addClass("Scrubber").css({
			'background-color' : this.model.backgroundColor
		});
		
		var mainMedia = env.getMainMediaWidget();
		var vid = mainMedia.view;

		var This = this;
		
		var bufferBar = jQuery("<div>").addClass('buffer').css({
			'left': 0,
			'background-color' : this.model.loadingColor,
			'height': this.model.barHeight,
			'position': 'absolute'
		});

		var positionBar = jQuery("<div>").addClass('progress').css({
			'left': 0,
			'background-color' : this.model.foregroundColor,
			'width' : this.model.barWidth + "px",
			'height' : this.model.barHeight + "px",
			'position': 'absolute'
		});
		
		vid.bind("progress", function() {
			bufferBar.css({
				'width': (100 * vid.buffered() / vid.duration()) + "%"
			});
		});
		
		vid.bind("timeupdate", function() {
			var pos = (100 * vid.currentTime() / vid.duration()) + "%";
			positionBar.css({
				'left' : pos
			});
		});
		
		if (this.model.interactive) {
			var positionMoved = function(e) {
				if (vid.ended()) {
					vid.play();
				}
				var time = (e.pageX-This.model.x)/This.model.width;
				vid.currentTime(time * vid.duration());
			};
			this.element.click(function(e) {
				positionMoved(e);
			});
			This = this;
			this.element.mousedown(function(e) {
				This.mouseDown = true;
			});
			this.element.mouseup(function(e) {
				This.mouseDown = false;
			});
			this.element.mousemove(function(e) {
				if (This.mouseDown) {
					positionMoved(e);
				}
			});
		}
		
		this.element.append(bufferBar);
		this.element.append(positionBar);
	}
});

org.korsakow.controller.FullscreenButtonWidgetController = Class.register('org.korsakow.controller.FullscreenButtonWidgetController', org.korsakow.controller.AbstractWidgetController, {
	initialize: function($super, model) {
		$super(model);
	},
	setup: function($super, env) {
		$super(env);

		this.element.addClass('FullscreenButton').addClass('closed');
		var fs = new org.korsakow.FullScreenAPI();
		var This = this;
		this.element.click(function() {
			var element = env.view;
			if (This.element.hasClass('closed')) {
				fs.requestFullScreen(element[0]);
				This.element.removeClass('closed');
				This.element.addClass('open');
			}else{
				fs.cancelFullScreen(element[0]);
				This.element.removeClass('open');
				This.element.addClass('closed');
			}
		});
	}
});

org.korsakow.controller.MasterVolumeWidgetController = Class.register('org.korsakow.controller.MasterVolumeWidgetController', org.korsakow.controller.AbstractWidgetController, {
	initialize: function($super, model) {
		$super(model);
	},
	setup: function($super, env) {
		$super(env);

		this.element.addClass('MasterVolume').css({
			'background-position' : "0px "+ (this.model.height - 21)/2 + "px"
		});
		var slider = jQuery('<div>').addClass('volumeSlider').css({
			'position' : 'relative',
			'width' : '10px',
			'height' : '25px',
			'margin' : (this.model.height - 25)/2 +"px 0"
		});
		this.element.append(slider);
		this.updateSlider(env.getGlobalVolume());
		var This = this;
		
		this.element.click(function(e) {
			var vol = (e.pageX - This.model.x) / (This.model.width);
			env.setGlobalVolume(vol);
		});
		this.element.mousemove(function(e) {
			if (org.korsakow.Utility.mouseIsPressed) {
				var vol = (e.pageX - This.model.x) / (This.model.width);
				env.setGlobalVolume(vol);
			}
		});
	},
	updateSlider: function(vol) {
		this.element.find('.volumeSlider').css({
			'left' : Math.max((this.model.width) * vol -15, 0) +"px"
		});
	}

});

org.korsakow.controller.SubtitlesController = Class.register('org.korsakow.controller.SubtitlesController', org.korsakow.controller.AbstractWidgetController, {
	initialize: function($super, model) {
		$super(model);
	},
	setup: function($super, env) {
		$super(env);
		var This = this;
		var snu = env.getCurrentSnu();
		var media = snu.mainMedia;
		this.element.addClass("SubtitlesWidget");
		var mediaUI = this.view = env.createMediaUI('org.korsakow.domain.Subtitles');
		this.element.append(mediaUI.element);
		
		var stFile = env.resolvePath(media.subtitlesFilename);
		if (stFile) {
			this.parseSubtitles(stFile, function onSubtitleDownload() {
				var mainmedia = env.getMainMediaWidget();
				var vid = mainmedia.view;
				vid.bind('timeupdate', function subtitleTimeUpdate(event) {
					This.handleTimeUpdate(this.currentTime);
				});
				vid.bind('ended', function subtitleTimeUpdate(event) {
					This.view.text('');
				});
			});
		}
		
		this.applyStyles();
	},
	handleTimeUpdate: function(time) {
		var cuepoint = this.cuePoints.find(function(cuepoint) {
			return cuepoint.time <= time && time < (cuepoint.time + cuepoint.duration);
		});
		this.view.text(cuepoint ? cuepoint.subtitle : []);
	},
	getSubtitles: function() {
		return this.model.subtitles;
	},
	parseSubtitles: function(filePath, cb) {
		var This = this;
		var cuePoints = new Array();
		this.env.ajax({
			url: filePath,
			success: function(data) {
				if (filePath.match(/[.]srt$/)) {
					var parser = new org.korsakow.util.StrSubtitleParser();
					cuePoints = parser.parse(data);
				} else if (filePath.match(/[.]txt$/)) {
					cuePoints = this.parseK3CuePoints(data);
				} else{
					throw new Error("Don't know how to parse subtitles of type: " + filePath);
				}
				This.cuePoints = cuePoints;
				cb();
			}
		}); //ajax request
			
	},
	parseK3CuePoint: function(line) {
		throw new Error("K3 subtitles not yet supported");
	}
});

org.korsakow.controller.WidgetControllerFactory.register("org.korsakow.widget.Subtitles", org.korsakow.controller.SubtitlesController);
org.korsakow.controller.WidgetControllerFactory.register("org.korsakow.widget.MainMedia", org.korsakow.controller.MainMediaWidgetController);
org.korsakow.controller.WidgetControllerFactory.register("org.korsakow.widget.SnuAutoLink", org.korsakow.controller.PreviewWidgetController);
org.korsakow.controller.WidgetControllerFactory.register("org.korsakow.widget.SnuFixedLink", org.korsakow.controller.FixedPreviewWidgetController);
org.korsakow.controller.WidgetControllerFactory.register("org.korsakow.widget.InsertText", org.korsakow.controller.InsertTextWidgetController);
org.korsakow.controller.WidgetControllerFactory.register("org.korsakow.widget.PlayButton", org.korsakow.controller.PlayButtonWidgetController);
org.korsakow.controller.WidgetControllerFactory.register("org.korsakow.widget.PlayTime", org.korsakow.controller.PlayTimeWidgetController);
org.korsakow.controller.WidgetControllerFactory.register("org.korsakow.widget.TotalTime", org.korsakow.controller.TotalTimeWidgetController);
org.korsakow.controller.WidgetControllerFactory.register("org.korsakow.widget.Scrubber", org.korsakow.controller.ScrubberWidgetController);
org.korsakow.controller.WidgetControllerFactory.register("org.korsakow.widget.FullscreenButton", org.korsakow.controller.FullscreenButtonWidgetController);
org.korsakow.controller.WidgetControllerFactory.register("org.korsakow.widget.MasterVolume", org.korsakow.controller.MasterVolumeWidgetController);
