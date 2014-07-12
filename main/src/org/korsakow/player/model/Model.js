NS('org.korsakow.domain.rule');
NS('org.korsakow.domain.trigger');

/* Parent class for all domain objects (models)
 * 
 */
org.korsakow.domain.DomainObject = Class.register('org.korsakow.domain.DomainObject', org.korsakow.Object, {
	initialize: function($super, id) {
		$super();
		this.id = id;
	},
	toString: function($super) {
		return $super("%"+this.id);
	}
});

org.korsakow.domain.Keyword = Class.register('org.korsakow.domain.Keyword', org.korsakow.Object, {
	initialize: function($super, value, weight) {
		$super(null);
		this.value = value;
		this.weight = weight;
	},
	toString: function() {
		return "[Keyword value='"+this.value+"'; weight='"+this.weight+"']";
	}
});

/* Parent class for all Media types
 * 
 * TODO: is this class useful?
 */
org.korsakow.domain.Media = Class.register('org.korsakow.domain.Media', org.korsakow.domain.DomainObject, {
	initialize: function($super, id, filename) {
		$super(id);
		this.filename = filename;
	}
});

org.korsakow.domain.Video = Class.register('org.korsakow.domain.Video', org.korsakow.domain.Media, {
	initialize: function($super, id, filename, subtitlesFilename) {
		$super(id, filename);
		this.subtitlesFilename = subtitlesFilename;
	}
});

org.korsakow.domain.Sound = Class.register('org.korsakow.domain.Sound', org.korsakow.domain.Media, {
	initialize: function($super, id, filename){
		$super(id,filename);
	}
});

org.korsakow.domain.Image = Class.register('org.korsakow.domain.Image', org.korsakow.domain.Media, {
	initialize: function($super, id, filename, duration) {
		$super(id, filename);
		this.duration = duration;
	}
});

org.korsakow.domain.Snu = Class.register('org.korsakow.domain.Snu', org.korsakow.domain.DomainObject, {
	initialize: function($super, id, name, keywords, mainMedia, previewMedia, interface, events, lives, looping, starter, insertText, rating, backgroundSoundMode, backgroundSoundLooping, backgroundSoundMedia, backgroundSoundVolume) {
		$super(id);
		this.name = name;
		this.keyword = keywords;
		this.mainMedia = mainMedia;
		this.previewMedia = previewMedia;
		this.interface = interface;
		this.events = events;
		this.lives = lives;
		this.looping = looping;
		this.start = starter;
		this.insertText = insertText;
		this.rating = rating;
		this.backgroundSoundMode = backgroundSoundMode;
		this.backgroundSoundLooping = backgroundSoundLooping;
		this.backgroundSoundMedia = backgroundSoundMedia;
		this.backgroundSoundVolume = backgroundSoundVolume;
	}
});

org.korsakow.domain.Event = Class.register('org.korsakow.domain.Event', org.korsakow.domain.DomainObject, {
	initialize: function($super, id, predicate, trigger, rule) {
		$super(id);
		this.id = id;
		this.predicate = predicate;
		this.trigger = trigger;
		this.rule = rule;
	},
	setup: function (env) {
		var This = this;
		this.trigger.setup(env, function triggeredRule () {
			// TODO check the predicate
			This.rule.execute(env);
		});
	},
	cancel: function (env) {
		this.trigger.cancel();
	}
});

/**
 * Executes an event's rules after <time> seconds.
 */
org.korsakow.domain.trigger.SnuTime = Class.register('org.korsakow.domain.trigger.SnuTime', org.korsakow.domain.DomainObject, {
	initialize: function($super, id, time) {
		$super(id);
		this.id = id;
		this.time = time;
	},
	setup: function (env, callback) {
		var This = this,
			mainMediaUI = env.getMainMediaWidget().view;

		// This needs to happen inside setup() so if the same
		// trigger is loaded for a new SNU it isn't already marked
		// as done.
		this.cancelled = false;
		this.done = false;

		mainMediaUI.bind('timeupdate', function triggerTimeUpdate () {
			var curTime = mainMediaUI.currentTime();
			var ready = (This.done === false && This.cancelled === false);
			if (curTime >= This.time && ready) {
				org.korsakow.log.debug('SnuTime triggered at: ' + curTime/1000 + 's');
				This.done = true;
				callback();
			}
		});
	},
	cancel: function () {
		this.cancelled = true;
	}
});

org.korsakow.domain.Interface = Class.register('org.korsakow.domain.Interface', org.korsakow.domain.DomainObject, {
	initialize: function($super, id, name, keywords, widgets, clickSound, backgroundColor, backgroundImage) {
		$super(id);
		this.name = name;
		this.keyword = keywords;
		this.widgets = widgets;
		this.clickSound = clickSound;
		this.backgroundColor = backgroundColor;
		this.backgroundImage = backgroundImage;
	}
});

org.korsakow.domain.Project = Class.register('org.korsakow.domain.Project', org.korsakow.domain.DomainObject, {
	initialize: function($super, id, name, width, height, splashScreenMedia, backgroundSoundMedia, backgroundSoundVolume, backgroundSoundLooping, clickSound, backgroundColor, backgroundImage) {
		$super(id);
		this.name = name;
		this.width = width;
		this.height = height;
		this.splashScreenMedia = splashScreenMedia;
		this.backgroundSoundMedia = backgroundSoundMedia;
		this.backgroundSoundLooping = backgroundSoundLooping;
		this.backgroundSoundVolume = backgroundSoundVolume;
		this.clickSound = clickSound;
		this.backgroundColor = backgroundColor;
		this.backgroundImage = backgroundImage;
	}
});

org.korsakow.SearchResults = Class.register('org.korsakow.SearchResults', {
	initialize: function() {
		this.results = [];
	},
	indexOfSnu: function(snu) {
		for (var i = 0; i < this.results.length; ++i)
			if (this.results[i].snu.id == snu.id)
				return i;
		return -1;
	},
	resultOfSnu: function(snu) {
		for (var i = 0; i < this.results.length; ++i)
			if (this.results[i].snu.id == snu.id)
				return this.results[i];
		return null;
	},
	toString: function() {
		return "[org.korsakow.SearchResults]";
	}
});
org.korsakow.SearchResult = Class.register('org.korsakow.SearchResult', {
	initialize: function(snu, score) {
		this.snu = snu;
		this.score = score;
	},
	toString: function() {
		return "[org.korsakow.SearchResult; snu="+this.snu.id+"("+this.snu.name+")]";
	}
});

org.korsakow.SoundManager = Class.register('org.korsakow.SoundManager', {
	initialize: function($super) {
		$super();
		this.channels = {};
	},
	playSound: function(opts) {
		var prev = this.channels[opts.channel];
		
		var f = org.korsakow.Fade.fade({
			duration: prev?opts.fade*0.75:0,
			begin: prev?prev.audio.volume():1,
			end: 0,
			target:prev?prev.audio:{volume:0},
			property: 'volume',
			complete: org.korsakow.ftor(this, function() {
				if (prev) prev.audio.cancel();
				
				if (this.channels[opts.channel]) {
					delete this.channels[opts.channel];
				}
				var audio = new org.korsakow.Audio(opts.uri, opts.volume);
				audio.play();
				if(opts.loop) audio.setLooping(opts.loop);
				
				var f = org.korsakow.Fade.fade({
					duration: opts.fade,
					begin: 0,
					end: opts.volume || 1,
					target: audio,
					property: 'volume'
				});
				this.channels[opts.channel] = {
					audio: audio,
					tween: f
				};
			})
		});
		if (prev) {
			prev.tween.cancel();
			prev.tween = f;
		}
	}
});

org.korsakow.Environment = Class.register('org.korsakow.Environment', {
	initialize: function(view, dao) {
		this.currentSnu = null;
		this.currentInterface = null;
		this.project = null;
		this.interfaceController = null;
		this.backgroundSoundUI = null;
		// this.globalVolume = 1.0;
		
		this.view = view;
		this.dao = dao;
		this.soundManager = new org.korsakow.SoundManager();
	},
	getDao: function() {
		return this.dao;
	},
	getDefaultSearchResultIncrement: function() {
		return 1;
	},
	resolvePath: function(path) {
		return path ? 'data/' + path : path;
	},
	ajax: function(opts) {
		return jQuery.ajax(opts);
	},
	getProject: function() {
		return this.project;
	},
	getCurrentSnu: function() {
		return this.currentSnu;
	},
	/*getCurrentSubtitles: function(){
		return this.currentSnu; //THIS IS NOT CORRECT!!
	},*/
	getSearchResults: function() {
		return this.searchResults;
	},
	getCurrentInterfaceController: function(){
		return this.interfaceController;
	},
	getWidgetById: function(id){
		for(var i = 0; i < this.interfaceController.controllers.length;i++){
			var cont = this.interfaceController.controllers[i];
			if(cont.model.id == id){
				return cont;
			}
		}
		return null;
	},
	getWidgetsOfType: function(type){
		var widgets = [];
		for(var i = 0; i < this.interfaceController.controllers.length;i++){
			var cont = this.interfaceController.controllers[i];
			if(cont.model.type == type){
				widgets.push(cont);
			}
		}
		return widgets;
	},
	getMainMediaWidget: function(){
		return this.getWidgetsOfType("org.korsakow.widget.MainMedia")[0];
	},
	getLastSnu: function(){
		if (!window.localStorage){
			org.korsakow.log.debuyg("localStorage not available");
			return false;
		} else if (localStorage.getItem("lastSnu") === null) {
			org.korsakow.log.debug('no snu in localstorage');
			return false;
		} else {
			org.korsakow.log.debug('getting previous snu' + localStorage.getItem("lastSnu"));
			return localStorage.getItem("lastSnu");	
		}
	},
	setLastSnu: function(snu){
		if (!window.localStorage){
			org.korsakow.log.debug("localStorage not available");
			return false;
		} else {
			org.korsakow.log.debug("setting a snu in localstorage");
			localStorage.setItem("lastSnu", snu);
		}
	},
	clearLastSnu: function(){
		if (!window.localStorage){
			org.korsakow.log.debu("localStorage not available");
			return false;
		} else {
			localStorage.removeItem("lastSnu");
		}
	},
	getClickSound: function() {
		if (this.currentSnu && this.currentSnu.clickSound)
			return this.currentSnu.clickSound;
		if (this.currentInterface && this.currentInterface.clickSound)
			return this.currentInterface.clickSound;
		if (this.project.clickSound)
			return this.project.clickSound;
		return null;
	},
	
	getGlobalVolume: function(){
		return org.korsakow.Audio.globalVolume;
	},
	setGlobalVolume: function(vol){
		if(vol < 0) vol = 0;
		if(vol > 1) vol = 1.0;
		// this.globalVolume = vol;
		org.korsakow.Audio.globalVolume = vol;
		
		this.applyGlobalVolume();
	},
	createMediaUI: function(className, opts) {
		return org.korsakow.ui.MediaUIFactory.create(className, opts);
	},
	applyGlobalVolume: function(){
		var vol = org.korsakow.Audio.globalVolume;
		this.view.find('video').each(function(){
			$(this)[0].volume = vol;
		});
		/*
		 * this.view.find('audio').each(function(){ $(this)[0].volume = vol; });
		 */
		// adjust position of all MV widgets in case there are multiple
		var volumeControllers = this.getWidgetsOfType('org.korsakow.widget.MasterVolume');
		for(var i = 0; i<volumeControllers.length;i++){
			volumeControllers[i].updateSlider(vol);
		}
		for(var key in this.soundManager.channels){
			var channel = this.soundManager.channels[key];
			channel.audio.volume(channel.audio.volume());
		}
	},
	cancelEvents: function () {
		for (var i = 0; i < this.currentSnu.events.length; ++i) {
			this.currentSnu.events[i].cancel();
		}
	},
	
	executeSnu: function(snu) {
		
		org.korsakow.log.debug('Executing SNU: ' + snu.name);
		
		this.view.find('.interface').remove();

		if(this.currentSnu) {
			this.cancelEvents();
		}

		this.currentSnu = snu;

		if(this.currentSnu.lives > 0){
			--this.currentSnu.lives;
		}

		this.currentInterface = this.currentSnu.interface;
		this.interfaceController = new InterfaceController(this.currentInterface);
		this.interfaceController.setup(this);
		for (var j = 0; j < this.interfaceController.controllers.length; ++j)
			this.interfaceController.controllers[j].setup(this);
		
		this.view.append(this.interfaceController.element);
	

		// handle BG sound
		switch(this.currentSnu.backgroundSoundMode){
			case "keep":
				break;
			case "clear":
				if(this.soundManager.channels['backgroundSound']){
					this.soundManager.channels['backgroundSound'].audio.cancel();
					delete this.soundManager.channels['backgroundSound'];
				}
				break;
			case "set":
				var prev = this.soundManager.channels['backgroundSound'];
				var next = this.resolvePath(this.currentSnu.backgroundSoundMedia.filename);
				if(prev && next){
					if(prev.audio.url == next)
						break;
				}
				this.soundManager.playSound({
					uri:next,
					channel:"backgroundSound",
					fade:1000,
					loop: this.currentSnu.backgroundSoundLooping,
					volume: this.currentSnu.backgroundSoundVolume
				});
				break;
		}
		
		for (var i = 0; i < snu.events.length; ++i) {
			snu.events[i].setup(this);
		}

		// set all audio/video components to the appropriate volume
		this.applyGlobalVolume();
	},
	toString: function() {
		return "[org.korsakow.Environment]";
	}
});
