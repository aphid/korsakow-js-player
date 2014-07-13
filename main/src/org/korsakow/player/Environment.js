NS('org.korsakow');

org.korsakow.Environment = Class.register('org.korsakow.Environment', {
	initialize: function(view, dao, localStorage) {
		this.currentSnu = null;
		this.currentInterface = null;
		this.project = null;
		this.interfaceController = null;
		this.currentMainMedia = null;
		this.backgroundSoundUI = null;
		
		this.view = view;
		this.dao = dao;
		this.soundManager = new org.korsakow.SoundManager();
		this.localStorage = localStorage;
	},
	getView: function() {
		return this.view;
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
	getLastSnu: function() {
		return this.localStorage.get('lastSnu');
	},
	setLastSnu: function(snu) {
		this.localStorage.set('lastSnu', snu);
	},
	clearLastSnu: function() {
		this.localStorage.remove('lastSnu');
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
	
	togglePause: function() {
		if (!this.currentMainMedia)
			return;
		
		// TODO: toggle background sounds
		
		var findPreviews = function() {
			return this.interfaceController.controllers.filter(function(ctrl) {
				if (ctrl.model.type === 'org.korsakow.widget.SnuAutoLink' ||
					ctrl.model.type === 'org.korsakow.widget.SnuFixedLink') {
					return true;
				}
			});
		}.bind(this);
		
		if (this.currentMainMedia.paused()) {
			this.currentMainMedia.play();
			this.view.prev('#pauseOverlay').hide();
			findPreviews().forEach(function(p) {
				p.resume();
			});
		} else {
			this.currentMainMedia.pause();
			this.view.prev('#pauseOverlay').show();
			findPreviews().forEach(function(p) {
				p.pause();
			});
		}
	},
	
	executeSnu: function(snu) {
		
		org.korsakow.log.debug('Executing SNU: ' + snu.name);
		
		if (this.currentSnu) {
			this.cancelEvents();
			this.currentSnu = null;
		}
		if (this.currentInterface) {
			this.interfaceController.destroy();
			this.interfaceController = null;
			this.currentInterface = null;
		}
		this.currentMainMedia = null;

		this.currentSnu = snu;
		this.setLastSnu(snu.id);
		
		if(this.currentSnu.lives > 0){
			--this.currentSnu.lives;
		}

		this.currentInterface = this.currentSnu.interface;
		this.interfaceController = new InterfaceController(this.currentInterface);
		this.interfaceController.setup(this);
		for (var j = 0; j < this.interfaceController.controllers.length; ++j) {
			var ctrl = this.interfaceController.controllers[j];
			ctrl.setup(this);
			if (ctrl.model.type === 'org.korsakow.widget.MainMedia') {
				this.currentMainMedia = ctrl;
			}
		}
		if (!this.currentMainMedia) {
			org.korsakow.log.warn('Current interface has no MainMedia widget: ' + this.currentInterface);
		}
		
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
