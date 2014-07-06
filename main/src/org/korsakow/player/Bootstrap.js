NS('org.korsakow');

org.korsakow.Bootstrap = Class.register('org.korsakow.Bootstrap',org.korsakow.Object,{
	initialize: function($super, dao) {
		$super();
		this.dao = dao;
	},
	
	findStartSnu: function() {
		var startSnus = this.dao.find({
			type: "Snu",
			props: {
				starter: true
			}
		});
		if (!startSnus.length)
			startSnus = this.dao.find({
				type: "Snu",
			});
		
		return startSnus[Math.floor(Math.random() * startSnus.length)];
	},
	
	/* Bootstraps the application.
	 * 
	 * @param dao an {org.korsakow.domain.Dao}
	 */
	start: function() {
		var This = this;
		var view = jQuery("#view");
		view.empty();
		var env = new org.korsakow.Environment(view, this.dao);
	
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
			//start BG music
			if (env.project.backgroundSoundMedia) {
				env.soundManager.playSound({
					uri:env.resolvePath(env.project.backgroundSoundMedia.filename),
					channel:"backgroundSound", // TODO: make into const
					fade:0,
					loop: env.project.backgroundSoundLooping,
					volume: env.project.backgroundSoundVolume
				});
			}
			
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
			
			var startSnu = This.findStartSnu();
			if (startSnu) {
				org.korsakow.log.debug('Start Snu: ' + startSnu.name);
				env.executeSnu(startSnu);
			} else {
				org.korsakow.log.warn('No start snu found');
			}
		};
		
		if (env.project.splashScreenMedia) {
			function dismiss() {
				centerContainer.remove();
				playFirstSnu();
			}
			
			var splashScreenUI = env.createMediaUI(env.project.splashScreenMedia.getClass().className, env.project.splashScreenMedia);
			splashScreenUI.load(env.resolvePath(env.project.splashScreenMedia.filename));
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
			view.append(centerContainer);
			
			splashScreenUI.play();
		} else
			playFirstSnu();
	}

});

