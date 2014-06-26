NS('org.korsakow.controller');

var W = org.korsakow.WrapCallback;

/* Abstract parent for Widget controllers
 * 
 * Each controller has a DIV to which its view gets added. This DIV establishes the view's
 * position and size.
 * 
 */
org.korsakow.controller.AbstractController = Class.register('org.korsakow.controller.AbstractController', {
	initialize: function($super, model) {
		$super();
		this.model = model || {}; // default value is for jsmock limitation in tests (Object.setPrototypeOf should fix this)
		this.element = null;
		this.env = null;

		this.element = jQuery("<div />");
	},
	setup: function(env) {
		this.env = env;
	}
});

/* Handles creating an interface's view based on it's widgets.
 * 
 */
var InterfaceController = org.korsakow.controller.InterfaceController = Class.register('org.korsakow.controller.InterfaceController', org.korsakow.controller.AbstractController, {
	initialize: function($super, model) {
		$super(model);
		this.controllers = [];
	},
	setup: function($super, env) {
		$super(env);

		this.element.addClass("interface")
			.css({
				width: '100%',
				height: '100%',
				'background-color': this.model.backgroundColor?this.model.backgroundColor:null
			});

		for (var i = 0; i < this.model.widgets.length; ++i) {
			var widget = this.model.widgets[i];
			var widgetController;
			try {
				widgetController = org.korsakow.controller.WidgetControllerFactory.create(widget);
			} catch (e) {
				org.korsakow.log.error(e);
				throw e;
			}
			this.controllers.push(widgetController);
			this.element.append(widgetController.element);
		}
	}
});

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
		css['padding-left'] = (containerWidth-css.width)/2;
		css['padding-top'] = (containerHeight-css.height)/2;
		
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
		// TODO: if no starter found, use any random SNU
		env.executeSnu( dao.find({
			type: "Snu",
			props: {
				starter: true
			}
		})[0] );

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
