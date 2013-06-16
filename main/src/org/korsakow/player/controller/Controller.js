try {

NS('org.korsakow.controller');

var W = org.korsakow.WrapCallback;

org.korsakow.controller.AbstractController = Class.register('org.korsakow.controller.AbstractController', {
	initialize: function($super, model) {
		if (!model) throw new org.korsakow.NullPointerException('AbstractController.model');
		$super();
		this.model = model;
		this.element = null;
		this.env = null;

		this.element = jQuery("<div />")
		.css({
			left: this.model.x,
			top: this.model.y,
			width: this.model.width,
			height: this.model.height
		})
		;
},
	setup: function(env) {
	}
});


var InterfaceController = org.korsakow.controller.InterfaceController = Class.register('org.korsakow.controller.InterfaceController', org.korsakow.controller.AbstractController, {
	initialize: function($super, model) {
		$super(model);
		this.controllers = [];
	},
	setup: function($super, env) {
		$super(env);
		this.element.addClass("interface")
			.css({
				width: env.getProject().width,
				height: env.getProject().height,
				'background-color': this.model.backgroundColor?this.model.backgroundColor:null
			});

		for (var i = 0; i < this.model.widgets.length; ++i) {
			var widget = this.model.widgets[i];
			var widgetController;
			try {
				widgetController = org.korsakow.controller.WidgetControllerFactory.create(widget);
			} catch (e) {
				alert("Error: " + e);
				throw e;
			}
			this.controllers.push(widgetController);
			this.element.append(widgetController.element);
		}
	}
});

function start(dao) {
	var view = jQuery("#view");
	view.empty();
	var env = new org.korsakow.Environment(view, dao);

	env.project = dao.find({type: "Project"})[0];
	//env.searchResults = dao.find({type: "Snu"});
	//env.currentSnu = dao.find({type: "Snu"})[0];
	//var interf = dao.find({type:"Interface"})[0];
	//loadInterface(interf);
	view.css({
		width: env.project.width,
		height: env.project.height,
		backgroundColor: env.project.backgroundColor?env.project.backgroundColor:null
	});

	var splashScreenUI = org.korsakow.ui.MediaUIFactory.create(env.project.splashScreenMedia.getClass().className);
	splashScreenUI.load(env.resolvePath(env.project.splashScreenMedia.filename));
	splashScreenUI.element.addClass('clickable').css({
		width: '100%',
		height: '100%'
	});
	splashScreenUI.element.click(W(function() {
		$(this).remove();
		
		env.executeSnu( dao.find({
			type: "Snu",
			props: {
				starter: true
			}
		})[0] );

		//start BG music
		if(env.project.backgroundSoundMedia){
			env.soundManager.playSound({
				uri:env.resolvePath(env.project.backgroundSoundMedia.filename),
				channel:"backgroundSound",
				fade:0,
				loop: env.project.backgroundSoundLooping,
				volume: env.project.backgroundSoundVolume
			});
		}
	}));
	
	view.append(splashScreenUI.element);
	

	//	env.executeSnu( dao.find({type: "Snu"})[0] );
}


}catch(e){alert(e);throw e;}