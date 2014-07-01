/* Bootstraps the application.
 * 
 * @param dao an {org.korsakow.domain.Dao}
 */
function start(dao) {
	var view = jQuery("#view");
	view.empty();
	var env = new org.korsakow.Environment(view, dao);

	env.project = dao.find({type: "Project"})[0];
	
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
		
		// TODO: if no starter found, use any random SNU
		env.executeSnu( dao.find({
			type: "Snu",
			props: {
				starter: true
			}
		})[0] );
	};
	
	if (env.project.splashScreenMedia) {
		var splashScreenUI = env.createMediaUI(env.project.splashScreenMedia.getClass().className, env.project.splashScreenMedia);
		splashScreenUI.load(env.resolvePath(env.project.splashScreenMedia.filename));
		splashScreenUI.element.addClass('SplashScreen').css({
			width: '100%',
			height: '100%'
		});
		splashScreenUI.element.click(W(function() {
			$(this).remove();
			playFirstSnu();
		}));
		
		view.append(splashScreenUI.element);
	} else
		playFirstSnu();
	
	// TODO: handle spashscreen timeout
}
