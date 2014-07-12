NS('org.korsakow');

org.korsakow.Bootstrap = Class.register('org.korsakow.Bootstrap',org.korsakow.Object,{
	initialize: function($super, dao, domRoot) {
		$super();
		this.dao = dao;
		this.domRoot = domRoot;
	},
	
	findStartSnu: function() {
		var startSnus = this.dao.find({
			type: "Snu",
			props: {
				starter: true
			}
		});
		if (!startSnus.length) {
			org.korsakow.log.debug('Film has no start Snus');
			
			startSnus = this.dao.find({
				type: "Snu",
			});
		}
		
		return startSnus[Math.floor(Math.random() * startSnus.length)];
	},

	showSplashScreen: function() {
		var deferred = jQuery.Deferred();

		if (this.env.project.splashScreenMedia) {
			function dismiss() {
				centerContainer.remove();
				deferred.resolve();
			}
			
			var splashScreenUI = this.env.createMediaUI(this.env.project.splashScreenMedia.getClass().className, this.env.project.splashScreenMedia);
			splashScreenUI.load(this.env.resolvePath(this.env.project.splashScreenMedia.filename));
			splashScreenUI.element.addClass('SplashScreen');

			splashScreenUI.element.click(W(dismiss));
			splashScreenUI.bind('ended', W(dismiss));
			
			var centerContainer = jQuery('<div/>')
				.addClass('vertical-center')
				.css({
				width: '100%',
				height: '100%',
				'text-align': 'center',
			});
			centerContainer.append(splashScreenUI.element);
			this.view.append(centerContainer);
			splashScreenUI.play();
		} else
			deferred.reject();
		
		return deferred.promise();
	},
	
	/* Bootstraps the application.
	 * 
	 * @param dao an {org.korsakow.domain.Dao}
	 */
	start: function() {
		var This = this;
		var view = this.view = this.domRoot.find("#view");
		view.empty();
		
		var localStorage = (function() {
			if (window.localStorage) {
				return new org.korsakow.WebStorage(window.localStorage);
			} else {
				org.korsakow.log.debuyg("localStorage is not available, using a non-persistent in-memory store instead");
				return new org.korsakow.MemoryStorage();
			}
		})();
		
		var env = this.env = new org.korsakow.Environment(view, this.dao, localStorage);
	
		env.project = this.dao.find({type: "Project"})[0];
		
		function aspect() {
			var doc = jQuery(window);
			
			var css = {};
			
			var containerWidth = doc.width();
			var containerHeight = doc.height();
			var projWidth = env.project.width;
			var projHeight = env.project.height;
			
			var scale = Math.min(containerWidth/projWidth, containerHeight/projHeight);
			
			css.width = projWidth*scale;
			css.height = projHeight*scale;
			css['margin-left'] = (containerWidth-css.width)/2;
			css['margin-top'] = (containerHeight-css.height)/2;
			
			view.css(css);
		}
	
		function throttledResize(fn) {
			var timeout;
			return function() {
				org.korsakow.Timeout.clear(timeout);
				timeout = org.korsakow.Timeout.create(fn, 500);
			};
		}
		jQuery(window).resize(throttledResize(aspect));
		aspect();
		
		function playFirstSnu() {
			function setBackgroundSound() {
				if (env.project.backgroundSoundMedia) {
					env.soundManager.playSound({
						uri:env.resolvePath(env.project.backgroundSoundMedia.filename),
						channel:"backgroundSound", // TODO: make into const
						fade:0,
						loop: env.project.backgroundSoundLooping,
						volume: env.project.backgroundSoundVolume
					});
				}
			}
			
			function setBackgroundImage() {
				if (env.project.backgroundImage) {
					var imageUI = new org.korsakow.ui.ImageUI(env.project.backgroundImage);
		
					imageUI.element.addClass("backgroundImage")
						.css({
							width: '100%',
							height: 'auto',
							position: 'absolute'
						});
					imageUI.load(env.resolvePath(env.project.backgroundImage.filename));
		
					view.append(imageUI.element);
				}
			}
			
			function showContinueScreen() {
				
				var deferred = jQuery.Deferred();
				
				if (env.getLastSnu()) {
					org.korsakow.log.debug('Attempting to continue from Snu #' + env.getLastSnu());
					//test the last snu and make sure it's legit
					var continueSnu = This.dao.find({
						type: "Snu",
						props: { id: env.getLastSnu() }
					})[0];
					
					if (!continueSnu) {
						org.korsakow.log.debug("Continue-Snu is not valid");
						env.clearLastSnu();
						deferred.reject();
					} else {
						var contScr = jQuery("<div/>", { "id": "continueScreen" }).appendTo(this.view).show();
						var buttonContainer = jQuery("<div/>").addClass("buttonContainer").appendTo(contScr);
						jQuery("<p/>", { "text": "Would you like to continue from where you left off?"}).appendTo(buttonContainer);
						var resetButton = jQuery("<button/>")
							.text("Reset");
						var continueButton = jQuery("<button/>")
							.text("Continue");
						resetButton.appendTo(buttonContainer);
						continueButton.appendTo(buttonContainer);
						resetButton.click(function() {
							env.clearLastSnu();
							contScr.remove();
							deferred.reject();
						});
						continueButton.click(function() {
							contScr.remove();
							deferred.resolve(continueSnu);
						});
					}
				} else {
					org.korsakow.log.debug('No continue Snu, starting from the beginning');
					deferred.reject();
				}
				
				return deferred.promise();
			}
			
			function beginPlaying(snu) {
				setBackgroundSound();
				setBackgroundImage();
				org.korsakow.log.debug('Starting film from Snu: ' + snu);
				env.executeSnu(snu);
			}
			
			showContinueScreen().then(
				function done(continueSnu) {
					beginPlaying(continueSnu);
				}, function fail() {
					var startSnu = This.findStartSnu();
					if (startSnu) {
						beginPlaying(startSnu);
					} else {
						org.korsakow.log.warn('No start snu found, nothing to do');
					}
				}
			);
		};
		
		this.showSplashScreen().always(playFirstSnu);
	}

});

