/* Wrappers for the media types.
 * 
 * An attempt is made at creating a consistent API.
 * 
 */
NS('org.korsakow.ui');

org.korsakow.ui.MediaUI = Class.register('org.korsakow.ui.MediaUI', {
	initialize: function($super) {
		$super();
	},
	bind: function() {
		this.element.bind.apply(this.element, arguments);
	},
	play: function () { },
	pause: function() { },
	paused: function() { },
	ended: function() { },
	currentTime: function() { }
});

/* Wrapper around HTML images.
 * 
 */
org.korsakow.ui.ImageUI = Class.register('org.korsakow.ui.ImageUI', org.korsakow.ui.MediaUI, {
	initialize: function($super, model) {
		$super();
		
		this.element = jQuery("<img />")
			.addClass("ImageUI");
		
		this.isPlaying = false;
		this.isEnded = false;
		this.startTime = 0;
		this.updateInterval = 16; //ms
		this._currentTime = 0;
		if (typeof model.duration !== "undefined") {
			this._duration = model.duration;
		} else {
			this._duration = 5000;
		}

	},
	bind: function(eventType, cb) {
		var args = arguments;
		this.element.bind.apply(this.element, arguments);
	},
	load: function(src) {
		this.element.attr("src", src);
		this.element.trigger("canplay");
		this.element.trigger("loadedmetadata");
		this.element.trigger("canplaythrough");
		this.element.prop("readyState", 4);

	},
	source: function() {
		return this.element.attr("src");
	},
	play: function() {
		if (this.isPlaying === true){
			return false;
		}
		this.isPlaying = true;
		this.startTime = org.korsakow.Date.now();
		var that = this;
		this.interval = org.korsakow.setInterval(function() { that.imagePlay(); }, that.updateInterval);
		this.element.trigger("play");
		this.element.trigger("playing");
	},
	imagePlay: function(){
		if (this.isPlaying === false){
			return false;
		}
		this.currentTime(this.currentTime() + (( org.korsakow.Date.now() - this.startTime ))) ;
		this.startTime = org.korsakow.Date.now();
		this.element.trigger("timeupdate");
		if (this.currentTime() >= this.duration()){
			this.element.trigger("ended");
			this.element.trigger("pause");
			this.isEnded = true;
			this.isPlaying = false;
			clearInterval(this.interval);
		}
	},
	pause: function() { 
		if (this.isPlaying === false){
			return false;
		}
		org.korsakow.clearInterval(this.interval);
		this.interval = null;
		this.isPlaying = false;
		this.element.trigger("paused");
	},
	paused: function() { return !this.isPlaying; },
	ended: function() { 
		return this.isEnded;
	},
	currentTime: function(x) {
		if (typeof x != "undefined"){
			this._currentTime = x;
			this.element.trigger("seeked");
		}
		return this._currentTime;
	},
	duration: function(){
		return this._duration;
	}
});

/* Wrapper around HTML videos.
 * 
 */
org.korsakow.ui.VideoUI = Class.register('org.korsakow.ui.VideoUI', org.korsakow.ui.MediaUI, {
	initialize: function($super, model) {
		$super();
		this.element = jQuery("<video />");
		this.element.addClass("VideoUI");
	},
	bind: function() {
		this.element.bind.apply(this.element, arguments);
	},
	load: function(src) {
		var This = this;

		$.each([
			{
				type: 'video/ogg',
				src: src + '.ogv'
			},
			{
				type: 'video/webm',
				src: src + '.webm'
			},
			{
				type: 'video/mp4',
				src: src + '.mp4'
			}],
			function(i, info) {
				if(This.element[0].canPlayType(info.type)){
					var source = jQuery("<source />")
						.attr("src", info.src)
						.attr("type", info.type);
					This.element.append(source);
				}
			}
		);
		this.element[0].load();
	},
	play: function() {
		var This = this;
		// firefox 7 needs async between append <source> & play
		org.korsakow.setTimeout(function() {
			This.element[0].play();
		});
	},
	pause: function() {
		this.element[0].pause();
	},
	paused: function() {
		return this.element.prop('paused');
	},
	ended: function() {
		return this.element.prop('ended');
	},
	buffered: function() {
		var total = 0;
		var b = this.element.prop('buffered');
		var len = b.length;
		for (var i = 0; i < len; ++i)
			total += b.end(i) - b.start(i);
		return total * 1000;
	},
	currentTime: function(x) {
		if (typeof x != "undefined")
			this.element.prop('currentTime', Math.floor(x/1000));
		return Math.floor(this.element.prop('currentTime')*1000);
	},
	duration: function() {
		return Math.floor(this.element.prop('duration')*1000);
	},
	source: function() {
		return this.element.find("source").attr("src");
	},
	volume: function(x) {
		if (typeof x != "undefined")
			this.element.prop("volume", x);
		return this.element.prop("volume");
	}
});

org.korsakow.ui.SubtitlesUI = Class.register('org.korsakow.ui.SubtitlesUI', {
	initialize: function($super, opts) {
		$super();
		this.element = jQuery("<div></div>");
		this.element.addClass("SubtitlesUI");
		this.element.css({
			color: 'white'
		});
	},
	text: function(text) {
		this.element.children().remove();

		this.element.append(text.map(function(t) {
			return $('<p/>').html(t).addClass('subtitleLine')[0];
		}));
	}
});

/*org.korsakow.ui.AudioUI = Class.create({
	initialize: function(opts) {
		this.element = jQuery("<audio />");
		this.element.attr("preload", true);
		if (opts && opts.src) {
			alert('todo! AudioUI');
		}
	},
	load: function(src){
		var This = this;
		$.each([
			{
				type: 'audio/mpeg',
				src: src + '.mp3'
			},
			{
				type: 'audio/wav',
				src: src + '.wav'
			},
			{
				type: 'audio/ogg',
				src: src + '.ogg'
			}
		], function(i,info){
			var source = jQuery("<source />")
				.attr("src", info.src)
				.attr("type", info.type);
			This.element.append(source);
		});
		This.element[0].load();
	},
	play: function(){
		var This = this;
		setTimeout(function(){
			This.element[0].play();
		});
	},
	source:function(){
		return this.element.find("source").attr("src");
	}
});*/

/* Maps the domain objects' class names to the UI classes.
 * 
 */
org.korsakow.ui.MediaUIFactory = Class.register("org.korsakow.ui.MediaUIFactory", org.korsakow.Factory, {
	initialize: function($super) {
		$super("MediaUIFactory");
	}
});
org.korsakow.ui.MediaUIFactory.instance = new org.korsakow.ui.MediaUIFactory();
org.korsakow.ui.MediaUIFactory.register("org.korsakow.domain.Image", org.korsakow.ui.ImageUI);
org.korsakow.ui.MediaUIFactory.register("org.korsakow.domain.Video", org.korsakow.ui.VideoUI);
org.korsakow.ui.MediaUIFactory.register("org.korsakow.domain.Subtitles", org.korsakow.ui.SubtitlesUI);
//org.korsakow.ui.MediaUIFactory.register("org.korsakow.domain.Sound", org.korsakow.ui.AudioUI);
