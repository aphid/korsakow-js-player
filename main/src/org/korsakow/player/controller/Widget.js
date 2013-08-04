try {

NS('org.korsakow.controller.widget');

var W = org.korsakow.WrapCallback;

org.korsakow.controller.WidgetControllerFactory = Class.register('org.korsakow.controller.WidgetControllerFactory', {
	initialize: function($super) {
		$super();
		this.registry = {};
	},
	register: function(id, clazz) {
		if (!clazz)
			throw new Error("Register WidgetController with null clazz: " + id);
		this.registry[id] = clazz;
	},
	create: function(model) {
		var clazz = this.registry[model.type];
		if (!clazz)
			throw new Error("No controller class registered for widget: '" + model.type + "'");
		var obj = new clazz(model);
		return obj;
	}
});
org.korsakow.controller.WidgetControllerFactory.instance = new org.korsakow.controller.WidgetControllerFactory();
org.korsakow.controller.WidgetControllerFactory.create = function() {
	return org.korsakow.controller.WidgetControllerFactory.instance.create.apply(org.korsakow.controller.WidgetControllerFactory.instance, arguments);
};
org.korsakow.controller.WidgetControllerFactory.register = function() {
	return org.korsakow.controller.WidgetControllerFactory.instance.register.apply(org.korsakow.controller.WidgetControllerFactory.instance, arguments);
};

org.korsakow.controller.AbstractWidgetController = Class.register('org.korsakow.controller.AbstractWidgetController', org.korsakow.controller.AbstractController, {
	initialize: function($super, model) {
		$super(model);
	},
	setup: function($super, env) {
		$super();
		this.env = env;
		this.element.addClass("widget");
	}
});
/*
var VideoWidgetController = Class.register('VideoWidgetController', AbstractWidgetController, {
	initialize: function($super, model, filename) {
		$super(model);
	},
	setup: function() {
		this.element = jQuery("<div />")
			.addClass("widget videoWidget");
		this.element.append("<Video />");
		var filename = env.resolvePath(this.filename.replace(/flv$/, "ogv"));
		vid.append("<source />")
			.attr("src", filename)
			.attr("type", "video/ogg")
			;
		vid.play();
		$("#view").append(this.element);
	}
});
*/

org.korsakow.controller.MainMediaWidgetController = Class.register('org.korsakow.controller.MainMediaWidgetController', org.korsakow.controller.AbstractWidgetController, {
	initialize: function($super, model) {
		$super(model);
	},
	setup: function($super, env) {
		$super(env);
		var snu = env.getCurrentSnu();
		var media = snu.mainMedia;

		this.element.addClass("MainMediaWidget");
		var mediaUI = this.view = org.korsakow.ui.MediaUIFactory.create(media.getClass().className);
		this.element.append(mediaUI.element);
		mediaUI.element.css({
			width: "100%",
			height: "100%"
		})
		.attr("loop", snu.looping?true:false);

		//this.element.append(mediaUI.element);
		mediaUI.load(env.resolvePath(media.filename));
		mediaUI.play();
	},
	togglePlay: function() {
		var video = this.view;
		if (video.paused()) {
			video.play();
			return true;
		}else{
			video.pause();
			return false;
		}
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

		this.element.addClass("PreviewWidget").addClass('clickable');
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

	},
	setSnu: function(snu) {
		this.clear();
		
		var media = snu.previewMedia;
		var mediaUI = org.korsakow.ui.MediaUIFactory.create(media.getClass().className);
		this.element.append(mediaUI.element);
		mediaUI.element.css({
			width: "100%",
			height: "100%"
		});
		mediaUI.load(this.env.resolvePath(media.filename));
		
		this.snu = snu;
		this.mediaUI = mediaUI;
	},
	clear: function() {
		if (this.mediaUI) {
			this.mediaUI.stop();
			this.mediaUI = null;
			this.element.empty();
		}
		this.mediaUI = null;
		this.snu = null;
	}
});

org.korsakow.controller.InsertTextWidgetController = Class.register('org.korsakow.controller.InsertTextWidgetController', org.korsakow.controller.AbstractWidgetController, {
	initialize: function($super, model) {
		$super(model);
	},
	setup: function($super, env) {
		$super(env);

		this.element.addClass("InsertText");
		this.element.css({
			'color' : this.model.fontColor,
			'background-color' : this.model.fontBackgroundColor,
			'font-family' : this.model.fontFamily,
			'font-weight' : this.model.fontWeight,
			'font-style' : this.model.fontStyle,
			'font-size' : this.model.fontSize+"pt",
			'text-decoration' : this.model.textDecoration

		});
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
		var vid = mainMedia.view;
		vid.bind("timeupdate", function() {
			playTimeContent.html(org.korsakow.Utility.formatTime(vid.currentTime()));
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
		
		var scrubberBuffer = jQuery("<div>").addClass('buffer').css({
			'margin' : (this.model.height-this.model.barHeight)/2 + "px 0px 0px 0px",
			'width' : this.model.barWidth + "px",
			'height' : this.model.barHeight + "px",
			'background-color' : this.model.loadingColor
		});
		var scrubberProgress = jQuery("<div>").addClass('progress').css({
			'width' : this.model.barWidth + "px",
			'height' : this.model.barHeight + "px",
			'background-color' : this.model.foregroundColor
		});
		
		//Buffering
		if (this.model.loading) {
			vid.bind("progress", function() {
				scrubberBuffer.css({
					'width': vid.buffered() / vid.duration() * This.model.width + "px"
				});
			}, false);
		}
		
		//Playhead / Current Progress
//		vid.element[0].addEventListener('timeupdate', function() {
//			alert(111)
//		});
		vid.bind("timeupdate", function() {
			var newWidth = vid.currentTime() / vid.duration() * This.model.width + "px";
			scrubberProgress.css({
				'width' : newWidth
			});
			//in case loading is false, we need to push the buffer container as well
			if (!This.model.loading) {
				scrubberBuffer.css({
					'width' : newWidth
				});
			}
		});
		
		//Scrub
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
		
		scrubberBuffer.append(scrubberProgress);
		this.element.append(scrubberBuffer);
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
			//var element = env.getMainMediaWidget().element.find('video')[0];
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
		var slider = $('<div>').addClass('volumeSlider').css({
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

org.korsakow.controller.WidgetControllerFactory.register("org.korsakow.widget.MainMedia", org.korsakow.controller.MainMediaWidgetController);
org.korsakow.controller.WidgetControllerFactory.register("org.korsakow.widget.SnuAutoLink", org.korsakow.controller.PreviewWidgetController);
org.korsakow.controller.WidgetControllerFactory.register("org.korsakow.widget.InsertText", org.korsakow.controller.InsertTextWidgetController);
org.korsakow.controller.WidgetControllerFactory.register("org.korsakow.widget.PlayButton", org.korsakow.controller.PlayButtonWidgetController);
org.korsakow.controller.WidgetControllerFactory.register("org.korsakow.widget.PlayTime", org.korsakow.controller.PlayTimeWidgetController);
org.korsakow.controller.WidgetControllerFactory.register("org.korsakow.widget.TotalTime", org.korsakow.controller.TotalTimeWidgetController);
org.korsakow.controller.WidgetControllerFactory.register("org.korsakow.widget.Scrubber", org.korsakow.controller.ScrubberWidgetController);
org.korsakow.controller.WidgetControllerFactory.register("org.korsakow.widget.FullscreenButton", org.korsakow.controller.FullscreenButtonWidgetController);
org.korsakow.controller.WidgetControllerFactory.register("org.korsakow.widget.MasterVolume", org.korsakow.controller.MasterVolumeWidgetController);
}catch(e) {alert(e);throw e;}