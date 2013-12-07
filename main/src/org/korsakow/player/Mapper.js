/* Classes related to unmarshalling domain objects
 * 
 * Finder: a finder knows how to locate a certain type of domain object in various ways from the project.xml
 * 		finder methods return a jQuery-wrapped XML node
 * 
 * Mapper: knows how to create a domain object from an XML node
 * 
 */
try {

NS('org.korsakow.domain.rule');
NS('org.korsakow.domain.widget');


/* Locates XML nodes by various criteria
 * 
 */
org.korsakow.domain.Finder = Class.register('org.korsakow.domain.Finder', {
	/*
	 * @param data jQuery-wrapped XML
	 */
	initialize: function($super, data) {
		$super();
		this.data = data;
	},
	/**
	 * @param id the id of the object to find, corresponds to the <id> tag in the xml
	 * @param opts currently not used
	 */
	findById: function(id, opts) {
		opts = opts || {};
		var result = this.data;
		result = result.find("id:contenteq(" + id + "):");
		result = result.parent();
		return result;
	},
	findMediaById:function(id, opts) {
		opts = opts || {};
		opts.type = ['Video','Image','Sound'];
		return this.findById(id, opts);
	},
	/**
	 * @param opts {
	 * 	parent: id of containing element
	 *  keyword
	 *  type: element name to match on
	 *  path: the list / separates path of elements to find
	 *  	one of type or path is requred
	 *  props: key/value map to match on
	 * }
	 * @returns {Array}
	 */
	find: function(opts) {
		opts = opts || {};
		var result = this.data;
		if (opts.parent) {
			result = result.find("id:contenteq("+opts.parent+"):")
							.parent();
			if (opts.list) {
				opts.list = $(opts.list);
				for (var i = 0; i < opts.list.length; ++i)
					result = result.children(opts.list[i]);
			}
		}
		if (opts.path) {
			opts.path = opts.path.split('/');
			var p = result;
			while (opts.path.length) {
				var path = opts.path.shift();
				p = p.children("*:tagName(" + path + "):");
			}
			result = p;
		} else if (opts.type) {
			result = result.find("*:tagName(" + opts.type + "):");
		}
		
		if (opts.keyword) {
			result = result.filter(function() {
				var x = $(this).children('keywords').children('Keyword');
				for (var i = 0; i < x.length; ++i)
					if ($(x[i]).text() == opts.keyword) {
						return true;
					}
				return false;
			});
		}
		
		if (opts.props) {
			$.each(opts.props, function(propName, propValue) {
				result = result.filter(function() {
					// TODO: something other than string convertion
					return $(this).children(propName).text() == ""+propValue;
				});
			});
		}
		
		return result;
	}
});

org.korsakow.domain.MapperException = org.korsakow.Exception;
org.korsakow.domain.DomainObjectNotFoundException = org.korsakow.Exception;

/* Data Access Object
 * Finds domain objects
 */
org.korsakow.domain.Dao = Class.register('org.korsakow.domain.Dao', {
	/*
	 * @param $super
	 * @param finder
	 * @param mappers Array[{org.korsakow.Mapper}
	 */
	initialize: function($super, finder, mappers) {
		$super();
		this.idmap = {};
		this.mappers = mappers;
		this.finder = finder;
	},
	getMapper: function(clazz) {
		var mapper = this.mappers[clazz];
		if (!mapper)
			throw new org.korsakow.domain.MapperException("No mapper for: " + clazz);
		return mapper;
	},
	findById: function(id) {
		if (this.idmap[id])
			return this.idmap[id];
		var data = this.finder.findById.apply(this.finder, arguments);
		if (data.length === 0)
			throw new org.korsakow.domain.DomainObjectNotFoundException("DomainObject not found: #" + id);
		if (data.length > 1)
			throw new org.korsakow.domain.DomainObjectNotFoundException("Multiple DomainObjects found: #" + id);
		data = data[0];
		var mapper = this.getMapper(data.tagName);
		var obj = mapper.map($(data));
		this.idmap[obj.id] = obj;
		return obj;
	},
	findMediaById: function(id) {
		if (this.idmap[id])
			return this.idmap[id];
		var data = this.finder.findMediaById.apply(this.finder, arguments);
		if (data.length === 0)
			throw new org.korsakow.domain.DomainObjectNotFoundException("DomainObject not found: #" + id);
		if (data.length > 1)
			throw new org.korsakow.domain.DomainObjectNotFoundException("Multiple DomainObjects found: #" + id);
		data = data[0];
		var mapper = this.getMapper(data.tagName);
		var obj = mapper.map($(data));
		this.idmap[obj.id] = obj;
		return obj;
	},
	find: function(opts) {
		var data = this.finder.find.apply(this.finder, arguments);
		var result = [];
		for (var i = 0; i < data.length; ++i) {
			var datum = $(data[i]);
			
			var id = datum.children("id");
			var haveId = id.length > 0;
			if (haveId) {
				id = PU.parseInt(id, 'Dao.find');
				if (this.idmap[id]) {
					result.push(this.idmap[id]);
					continue;
				}
			}
			
			var mapper = this.getMapper(datum[0].tagName);
			var obj;
			try {
				obj = mapper.map(datum);
			} catch (e) {
				if (opts.ignoreError) {
					continue;
				}
				throw e;
			}
			
			if (haveId) // keywords don't have id...
				this.idmap[obj.id] = obj;
			
			result.push(obj);
		}

		return result;
	}
});
/* Factory method
 * @param data jQuery-wrapped XML
 * @returns {org.korsakow.domain.Dao}
 */
org.korsakow.domain.Dao.create = function(data) {
	
	var dao = new org.korsakow.domain.Dao();
	dao.initialize(new org.korsakow.domain.Finder(data), {
		'Keyword': new org.korsakow.domain.KeywordInputMapper(dao),
		'Video': new org.korsakow.domain.VideoInputMapper(dao),
		'Sound' : new org.korsakow.domain.SoundInputMapper(dao),
		'Image': new org.korsakow.domain.ImageInputMapper(dao),
		'Snu': new org.korsakow.domain.SnuInputMapper(dao),
		'Interface': new org.korsakow.domain.InterfaceInputMapper(dao),
		'Widget': new org.korsakow.domain.WidgetInputMapper(dao),
		'Rule': new org.korsakow.domain.RuleInputMapper(dao),
		'Project': new org.korsakow.domain.ProjectInputMapper(dao)
	});
	return dao;
};

org.korsakow.domain.ParseException = org.korsakow.Exception;
/*
Class.create(Error, {
	initialize: function($super, message) {
		$super(message);
	}
});
*/

var PU = org.korsakow.domain.ParseUtil = Class.register('org.korsakow.domain.ParseUtil', {
});

org.korsakow.domain.ParseUtil.parseInt = function(expr, message) {
	if (!expr.length)
		throw new org.korsakow.domain.ParseException("Not found: " + message);
	return parseInt(expr.text(), null);
};
org.korsakow.domain.ParseUtil.parseFloat = function(expr, message) {
	if (!expr.length)
		throw new org.korsakow.domain.ParseException("Not found: " + message);
	return parseFloat(expr.text());
};
org.korsakow.domain.ParseUtil.parseString = function(expr, message) {
	if (!expr.length)
		throw new org.korsakow.domain.ParseException("Not found: " + message);
	return expr.text();
};
org.korsakow.domain.ParseUtil.parseBoolean = function(expr, message) {
	if (!expr.length)
		throw new org.korsakow.domain.ParseException("Not found: " + message);
	return expr.text() == "true";
};
org.korsakow.domain.ParseUtil.parseColor = function(expr, message) {
	if (!expr.length)
		throw new org.korsakow.domain.ParseException("Not found: " + message);
	return expr.text();
};

org.korsakow.domain.ParseUtil.parseFloat = function(expr,message) {
	if(!expr.length)
		throw new org.korsakow.domain.ParseException("Not found: " + message);
	return parseFloat(expr.text());
};

org.korsakow.domain.InputMapper = Class.register('org.korsakow.domain.InputMapper', {
	initialize: function($super, dao) {
		$super();
		this.dao = dao;
	}
});

org.korsakow.domain.KeywordInputMapper = Class.register('org.korsakow.domain.KeywordInputMapper', org.korsakow.domain.InputMapper, {
	initialize: function($super, dao) {
		$super(dao);
	},
	map: function(data) {
//		var value = PU.parseString(data.children("value"), "Keyword.value");
//		var weight = PU.parseString(data.children("weight"), "Keyword.weight");
		var value = PU.parseString(data, "Keyword.value");
		var weight = 1;
		return new org.korsakow.domain.Keyword(value, weight);
	}
});

org.korsakow.domain.VideoInputMapper = Class.register('org.korsakow.domain.VideoInputMapper', org.korsakow.domain.InputMapper, {
	initialize: function($super, dao) {
		$super(dao);
	},
	map: function(data) {
		var id = PU.parseInt(data.children("id"), "Video.id");
		var filename = PU.parseString(data.children("filename"), "Video.filename");
		filename = filename.substring(0, filename.lastIndexOf('.'));
		return new org.korsakow.domain.Video(id, filename);
	}
});
/*org.korsakow.domain.SoundInputMapper = Class.register('org.korsakow.domain.SoundInputMapper', org.korsakow.domain.InputMapper, {
	initialize: function($super, dao) {
		alert("init");
		$super(dao);
	},
	map: function(data) {
		var id = PU.parseInt(data.children("id"), "Sound.id");
		var filename = PU.parseString(data.children("filename"), "Sound.filename");
		filename = filename.substring(0, filename.lastIndexOf('.'));
		return new org.korsakow.domain.Sound(id, filename);
	}
});*/

org.korsakow.domain.ImageInputMapper = Class.register('org.korsakow.domain.ImageInputMapper', org.korsakow.domain.InputMapper, {
	initialize: function($super, dao) {
		$super(dao);
	},
	map: function(data) {
		var id = PU.parseInt(data.children("id"), "Image.id");
		var filename = PU.parseString(data.children("filename"), "Image.filename");
		return new org.korsakow.domain.Image(id, filename);
	}
});

org.korsakow.domain.SoundInputMapper = Class.register('org.korsakow.domain.SoundInputMapper', org.korsakow.domain.InputMapper, {
	initialize: function($super, dao) {
		$super(dao);
	},
	map: function(data) {
		var id = PU.parseInt(data.children("id"), "Sound.id");
		var filename = PU.parseString(data.children("filename"), "Sound.filename");
		return new org.korsakow.domain.Sound(id, filename);
	}
});

org.korsakow.domain.SnuInputMapper = Class.register('org.korsakow.domain.SnuInputMapper', org.korsakow.domain.InputMapper, {
	initialize: function($super, dao) {
		$super(dao);
	},
	map: function(data) {
		var id = PU.parseInt(data.children("id"), "Snu.id");
		var name = PU.parseString(data.children("name"), "Snu.name");
		var mainMedia = this.dao.findMediaById(PU.parseInt(data.children("mainMediaId"), "Snu.mainMedia"));
		var previewMedia = this.dao.findMediaById(PU.parseInt(data.children("previewMediaId"), "Snu.previewMedia"));
		var interface = this.dao.findById(PU.parseInt(data.children("interfaceId"), "Snu.interface"));
		var starter = PU.parseBoolean(data.children("starter"), "Snu.starter");
		var rules = this.dao.find({parent:id, path: 'events/Event/Rule', ignoreError: true});
		var lives = (function(){
			var temp = data.children("lives");
			if(temp == "NaN")
				return number.NaN;
			else
				return PU.parseInt(temp, "Snu.lives");
		}).apply(this);
		var looping = PU.parseBoolean(data.children("looping"), "Snu.looping");
		var insertText = PU.parseString(data.children("insertText"), "Snu.insertText");
		var rating = PU.parseFloat(data.children("rating"), "Snu.rating");
		var backgroundSoundMode = PU.parseString(data.children("backgroundSoundMode"), "Snu.backgroundSoundMode");
		var backgroundSoundLooping = PU.parseString(data.children("backgroundSoundLooping"), "Snu.backgroundSoundLooping");
		var backgroundSoundVolume = 1.0;
		var backgroundSoundMedia = (function(){
			if(data.children("backgroundSoundId").length){
				backgroundSoundVolume = PU.parseFloat(data.children("backgroundSoundVolume"), "Snu.backgroundSoundVolume");
				return this.dao.findById(PU.parseInt(data.children("backgroundSoundId"), "Snu.backgroundSoundMedia"));
			} else
				return null;
		}).apply(this);
		return new org.korsakow.domain.Snu(id, name, [], mainMedia, previewMedia, interface, rules, lives, looping, starter, insertText, rating,
			backgroundSoundMode,backgroundSoundLooping, backgroundSoundMedia, backgroundSoundVolume);
	}
});

org.korsakow.domain.InterfaceInputMapper = Class.register('org.korsakow.domain.InterfaceInputMapper', org.korsakow.domain.InputMapper, {
	initialize: function($super, dao) {
		$super(dao);
	},
	map: function(data) {
		var id = PU.parseInt(data.children("id"), "Interface.id");
		var name = PU.parseString(data.children("name"), "Interface.id");
		var keywords = [];
		var widgets = this.dao.find({parent:id, path: 'widgets/Widget', ignoreError: true});
		var clickSound = (function() {
			if (data.children("clickSoundId").length) {
				var clickSoundId = PU.parseInt(data.children("clickSoundId"), "Interface.clickSound");
				return this.dao.findById(clickSoundId);
			} else
				return null;
		}).apply(this);
		var backgroundColor = data.children("backgroundColor").length?PU.parseColor(data.children("backgroundColor"), "Interface.backgroundColor"):null;
		return new org.korsakow.domain.Interface(id, name, keywords, widgets, clickSound, backgroundColor);
	}
});

//
/**
 * This is actually a sort of MetaInputMapper in that it does a lookup for the actual mapper based on the widget's type
 */
org.korsakow.domain.WidgetInputMapper = Class.register('org.korsakow.domain.WidgetInputMapper', org.korsakow.domain.InputMapper, {
	initialize: function($super, dao) {
		$super(dao);
	},
	map: function(data) {
		var type = PU.parseString(data.children("type"), "Widget.type");
		var mapper = org.korsakow.domain.InputMapperFactory.create(type, this.dao);
		return mapper.map(data);
	}
});

org.korsakow.domain.MainMediaInputMapper = Class.register('org.korsakow.domain.MainMediaInputMapper', org.korsakow.domain.InputMapper, {
	initialize: function($super, dao) {
		$super(dao);
	},
	map: function(data) {
		var type = PU.parseString(data.children("type"), "MainMedia.type");
		var id = PU.parseInt(data.children("id"), "MainMedia.id");
		var x = PU.parseInt(data.children("x"), "MainMedia.x");
		var y = PU.parseInt(data.children("y"), "MainMedia.y");
		var width = PU.parseInt(data.children("width"), "MainMedia.width");
		var height = PU.parseInt(data.children("height"), "MainMedia.height");
		var widget = new org.korsakow.domain.widget.MainMedia(id, [], type, x, y, width, height);
		return widget;
	}
});

org.korsakow.domain.PreviewInputMapper = Class.register('org.korsakow.domain.PreviewInputMapper', org.korsakow.domain.InputMapper, {
	initialize: function($super, dao) {
		$super(dao);
	},
	map: function(data) {
		var type = PU.parseString(data.children("type"), "Preview.type");
		var id = PU.parseInt(data.children("id"), "Preview.id");
		var x = PU.parseInt(data.children("x"), "Preview.x");
		var y = PU.parseInt(data.children("y"), "Preview.y");
		var width = PU.parseInt(data.children("width"), "Preview.width");
		var height = PU.parseInt(data.children("height"), "Preview.height");
		var index = PU.parseInt(data.children("index"), "Preview.index");
		var widget = new org.korsakow.domain.widget.Preview(id, [], type, x, y, width, height, index);
		return widget;
	}
});

org.korsakow.domain.FixedLinkMapper = Class.register('org.korsakow.domain.FixedLinkMapper', org.korsakow.domain.InputMapper, {
	initialize: function($super, dao) {
		$super(dao);
	},
	map: function(data) {
		var type = PU.parseString(data.children("type"), "FixedPreview.type");
		var id = PU.parseInt(data.children("id"), "FixedPreview.id");
		var x = PU.parseInt(data.children("x"), "FixedPreview.x");
		var y = PU.parseInt(data.children("y"), "FixedPreview.y");
		var width = PU.parseInt(data.children("width"), "FixedPreview.width");
		var height = PU.parseInt(data.children("height"), "FixedPreview.height");
		var snuId = PU.parseInt(data.children("snuId"), "FixedPreview.snuId");
		var widget = new org.korsakow.domain.widget.FixedPreview(id, [], type, x, y, width, height, snuId);
		return widget;
	}
});

org.korsakow.domain.InsertTextInputMapper = Class.register('org.korsakow.domain.InsertTextInputMapper', org.korsakow.domain.InputMapper, {
	initialize: function($super, dao) {
		$super(dao);
	},
	map: function(data) {
		var type = PU.parseString(data.children("type"), "InsertText.type");
		var id = PU.parseInt(data.children("id"), "InsertText.id");
		var x = PU.parseInt(data.children("x"), "InsertText.x");
		var y = PU.parseInt(data.children("y"), "InsertText.y");
		var width = PU.parseInt(data.children("width"), "InsertText.width");
		var height = PU.parseInt(data.children("height"), "InsertText.height");
		var fontColor = PU.parseString(data.children("fontColor"), "InsertText.fontColor");
		var fontBackgroundColor = PU.parseString(data.children("fontBackgroundColor"), "InsertText.fontBackgroundColor");
		var fontFamily = PU.parseString(data.children("fontFamily"), "InsertText.fontFamily");
		var fontSize = PU.parseInt(data.children("fontSize"), "InsertText.fontSize");
		var fontStyle = PU.parseString(data.children("fontStyle"), "InsertText.fontStyle");
		var fontWeight = PU.parseString(data.children("fontWeight"), "InsertText.fontWeight");
		var textDecoration = PU.parseString(data.children("textDecoration"), "InsertText.textDecoration");
		
		var widget = new org.korsakow.domain.widget.InsertText(id, [], type, x, y, width, height, fontColor, fontBackgroundColor, fontFamily, fontSize, fontStyle, fontWeight, textDecoration);
		return widget;
	}
});
org.korsakow.domain.PlayButtonInputMapper = Class.register('org.korsakow.domain.PlayButtonInputMapper', org.korsakow.domain.InputMapper, {
	initialize: function($super, dao) {
		$super(dao);
	},
	map: function(data) {
		var type = PU.parseString(data.children("type"), "PlayButton.type");
		var id = PU.parseInt(data.children("id"), "PlayButton.id");
		var x = PU.parseInt(data.children("x"), "PlayButton.x");
		var y = PU.parseInt(data.children("y"), "PlayButton.y");
		var width = PU.parseInt(data.children("width"), "PlayButton.width");
		var height = PU.parseInt(data.children("height"), "PlayButton.height");
		
		var widget = new org.korsakow.domain.widget.PlayButton(id, [], type, x, y, width, height);
		return widget;
	}
});
org.korsakow.domain.PlayTimeInputMapper = Class.register('org.korsakow.domain.PlayTimeInputMapper', org.korsakow.domain.InputMapper, {
	initialize: function($super, dao) {
		$super(dao);
		
	},
	map: function(data) {
		var type = PU.parseString(data.children("type"), "PlayTime.type");
		var id = PU.parseInt(data.children("id"), "PlayTime.id");
		var x = PU.parseInt(data.children("x"), "PlayTime.x");
		var y = PU.parseInt(data.children("y"), "PlayTime.y");
		var width = PU.parseInt(data.children("width"), "PlayTime.width");
		var height = PU.parseInt(data.children("height"), "PlayTime.height");
		var fontColor = PU.parseString(data.children("fontColor"), "PlayTime.fontColor");
		//var fontBackgroundColor = PU.parseString(data.children("fontBackgroundColor"), "PlayTime.fontBackgroundColor");
		var fontFamily = PU.parseString(data.children("fontFamily"), "PlayTime.fontFamily");
		var fontSize = PU.parseInt(data.children("fontSize"), "PlayTime.fontSize");
		var fontStyle = PU.parseString(data.children("fontStyle"), "PlayTime.fontStyle");
		var fontWeight = PU.parseString(data.children("fontWeight"), "PlayTime.fontWeight");
		var textDecoration = PU.parseString(data.children("textDecoration"), "PlayTime.textDecoration");
		
		var widget = new org.korsakow.domain.widget.PlayTime(id, [], type, x, y, width, height, fontColor, fontFamily, fontSize, fontStyle, fontWeight, textDecoration);
		return widget;
	}
});

org.korsakow.domain.TotalTimeInputMapper = Class.register('org.korsakow.domain.TotalTimeInputMapper', org.korsakow.domain.InputMapper, {
	initialize: function($super, dao) {
		$super(dao);
		
	},
	map: function(data) {
		var type = PU.parseString(data.children("type"), "TotalTime.type");
		var id = PU.parseInt(data.children("id"), "TotalTime.id");
		var x = PU.parseInt(data.children("x"), "TotalTime.x");
		var y = PU.parseInt(data.children("y"), "TotalTime.y");
		var width = PU.parseInt(data.children("width"), "TotalTime.width");
		var height = PU.parseInt(data.children("height"), "TotalTime.height");
		var fontColor = PU.parseString(data.children("fontColor"), "TotalTime.fontColor");
		//var fontBackgroundColor = PU.parseString(data.children("fontBackgroundColor"), "TotalTime.fontBackgroundColor");
		var fontFamily = PU.parseString(data.children("fontFamily"), "TotalTime.fontFamily");
		var fontSize = PU.parseInt(data.children("fontSize"), "TotalTime.fontSize");
		var fontStyle = PU.parseString(data.children("fontStyle"), "TotalTime.fontStyle");
		var fontWeight = PU.parseString(data.children("fontWeight"), "TotalTime.fontWeight");
		var textDecoration = PU.parseString(data.children("textDecoration"), "TotalTime.textDecoration");
		
		var widget = new org.korsakow.domain.widget.TotalTime(id, [], type, x, y, width, height, fontColor, fontFamily, fontSize, fontStyle, fontWeight, textDecoration);
		return widget;
	}
});

org.korsakow.domain.ScrubberInputMapper = Class.register('org.korsakow.domain.ScrubberInputMapper', org.korsakow.domain.InputMapper, {
	initialize: function($super, dao) {
		$super(dao);
		
	},
	map: function(data) {
		var type = PU.parseString(data.children("type"), "Scrubber.type");
		var id = PU.parseInt(data.children("id"), "Scrubber.id");
		var x = PU.parseInt(data.children("x"), "Scrubber.x");
		var y = PU.parseInt(data.children("y"), "Scrubber.y");
		var width = PU.parseInt(data.children("width"), "Scrubber.width");
		var height = PU.parseInt(data.children("height"), "Scrubber.height");
		var backgroundColor = PU.parseString(data.children("backgroundColor"), "Scrubber.backgroundColor");
		var foregroundColor = PU.parseString(data.children("foregroundColor"), "Scrubber.backgroundColor");
		var interactive = PU.parseBoolean(data.children("interactive"), "Scrubber.interactive");
		var loading = PU.parseBoolean(data.children("loading"), "Scrubber.loading");
		var loadingColor = PU.parseString(data.children("loadingColor"), "Scrubber.loadingColor");
		var barWidth = PU.parseInt(data.children("barWidth"), "Scrubber.barWidth");
		var barHeight = PU.parseInt(data.children("barHeight"), "Scrubber.barHeight");
		
		var widget = new org.korsakow.domain.widget.Scrubber(id, [], type, x, y, width, height, backgroundColor, foregroundColor, interactive, loading, loadingColor, barWidth, barHeight);
		return widget;
	}
});
org.korsakow.domain.FullscreenButtonInputMapper = Class.register('org.korsakow.domain.FullscreenButtonInputMapper', org.korsakow.domain.InputMapper, {
	initialize: function($super, dao) {
		$super(dao);
		
	},
	map: function(data) {
		var type = PU.parseString(data.children("type"), "FullscreenButton.type");
		var id = PU.parseInt(data.children("id"), "FullscreenButton.id");
		var x = PU.parseInt(data.children("x"), "FullscreenButton.x");
		var y = PU.parseInt(data.children("y"), "FullscreenButton.y");
		var width = PU.parseInt(data.children("width"), "FullscreenButton.width");
		var height = PU.parseInt(data.children("height"), "FullscreenButton.height");
		
		var widget = new org.korsakow.domain.widget.FullscreenButton(id, [], type, x, y, width, height);
		return widget;
	}
});

org.korsakow.domain.MasterVolumeInputMapper = Class.register('org.korsakow.domain.MasterVolumeButtonInputMapper', org.korsakow.domain.InputMapper, {
	initialize: function($super, dao) {
		$super(dao);
		
	},
	map: function(data) {
		var type = PU.parseString(data.children("type"), "FullscreenButton.type");
		var id = PU.parseInt(data.children("id"), "FullscreenButton.id");
		var x = PU.parseInt(data.children("x"), "FullscreenButton.x");
		var y = PU.parseInt(data.children("y"), "FullscreenButton.y");
		var width = PU.parseInt(data.children("width"), "FullscreenButton.width");
		var height = PU.parseInt(data.children("height"), "FullscreenButton.height");
		
		var widget = new org.korsakow.domain.widget.MasterVolume(id, [], type, x, y, width, height);
		return widget;
	}
});

//
/**
 * This is actually a sort of MetaInputMapper in that it does a lookup for the actual mapper based on the rule's type
 */
org.korsakow.domain.RuleInputMapper = Class.register('org.korsakow.domain.RuleInputMapper', org.korsakow.domain.InputMapper, {
	initialize: function($super, dao) {
		$super(dao);
	},
	map: function(data) {
		var type = PU.parseString(data.children("type"), "Rule.type");
		var mapper = org.korsakow.domain.InputMapperFactory.create(type, this.dao);
		return mapper.map(data);
	}
});

org.korsakow.domain.KeywordLookupInputMapper = Class.register('org.korsakow.domain.KeywordLookupInputMapper', org.korsakow.domain.InputMapper, {
	initialize: function($super, dao) {
		$super(dao);
	},
	map: function(data) {
		var type = PU.parseString(data.children("type"), "KeywordLookupe.type");
		var id = PU.parseInt(data.children("id"), "KeywordLookup.id");
		var keywords = this.dao.find({parent: id, path: 'keywords/Keyword', });
		var rule = new org.korsakow.domain.rule.KeywordLookup(id, keywords, type);
		return rule;
	}
});
org.korsakow.domain.ExcludeKeywordsInputMapper = Class.register('org.korsakow.domain.ExcludeKeywordsInputMapper', org.korsakow.domain.InputMapper, {
	initialize: function($super, dao) {
		$super(dao);
	},
	map: function(data) {
		var type = PU.parseString(data.children("type"), "ExcludeKeywords.type");
		var id = PU.parseInt(data.children("id"), "ExcludeKeywords.id");
		var keywords = this.dao.find({parent: id, path: 'keywords/Keyword'});
		var rule = new org.korsakow.domain.rule.ExcludeKeywords(id, keywords, type);
		return rule;
	}
});

org.korsakow.domain.SearchInputMapper = Class.register('org.korsakow.domain.SearchInputMapper', org.korsakow.domain.InputMapper, {
	initialize: function($super, dao) {
		$super(dao);
	},
	map: function(data) {
		var type = PU.parseString(data.children("type"), "Search.type");
		var id = PU.parseInt(data.children("id"), "Search.id");
		var rules = this.dao.find({parent:id, path: 'rules/Rule'});
		var maxLinks = data.children("maxLinks").length?PU.parseInt(data.children("maxLinks"), "Search.maxLinks"):null;
		var rule = new org.korsakow.domain.rule.Search(id, [], type, rules, maxLinks);
		return rule;
	}
});
//

org.korsakow.domain.ProjectInputMapper = Class.register('org.korsakow.domain.ProjectInputMapper', org.korsakow.domain.InputMapper, {
	initialize: function($super, dao) {
		$super(dao);
	},
	map: function(data) {
		var id = PU.parseInt(data.children("id"), "Project.id");
		var name = PU.parseString(data.children("name"), "Project.name");
		var width = PU.parseInt(data.children("movieWidth"), "Project.width");
		var height = PU.parseInt(data.children("movieHeight"), "Projec.height");
		var splashScreenMedia = this.dao.findById(PU.parseInt(data.children("splashScreenMediaId"), "Project.splashScreenMedia"));
		
		var backgroundSoundVolume = 1.0;
		var backgroundSoundLooping = true;
		var backgroundSoundMedia = (function(){
			if(data.children("backgroundSoundId").length){
				backgroundSoundVolume = PU.parseFloat(data.children("backgroundSoundVolume"), "Project.backgroundSoundVolume");
				backgroundSoundLooping = PU.parseBoolean(data.children("backgroundSoundLooping"), "Project.backgroundSoundLooping");
				return this.dao.findById(PU.parseInt(data.children("backgroundSoundId"), "Project.backgroundSoundMedia"));
			} else
				return null;
		}).apply(this);

		var clickSound = (function() {
			if (data.children("clickSoundId").length) {
				var clickSoundId = PU.parseInt(data.children("clickSoundId"), "Project.clickSound");
				return this.dao.findById(clickSoundId);
			} else
				return null;
		}).apply(this);
		var backgroundColor = data.children("backgroundColor").length?PU.parseColor(data.children("backgroundColor"), "Project.backgroundColor"):null;
		return new org.korsakow.domain.Project(id, name, width, height, splashScreenMedia, backgroundSoundMedia, backgroundSoundVolume, backgroundSoundLooping, clickSound, backgroundColor);

	}
});

org.korsakow.domain.InputMapperFactory = Class.register('org.korsakow.domain.InputMapperFactory', org.korsakow.Factory, {
	initialize: function($super) {
		$super("InputMapperFactory");
	}
});

org.korsakow.domain.InputMapperFactory.instance = new org.korsakow.domain.InputMapperFactory();
org.korsakow.domain.InputMapperFactory.register("org.korsakow.widget.MainMedia", org.korsakow.domain.MainMediaInputMapper);
org.korsakow.domain.InputMapperFactory.register("org.korsakow.widget.SnuAutoLink", org.korsakow.domain.PreviewInputMapper);
org.korsakow.domain.InputMapperFactory.register("org.korsakow.widget.SnuFixedLink", org.korsakow.domain.FixedLinkMapper);
org.korsakow.domain.InputMapperFactory.register("org.korsakow.widget.InsertText", org.korsakow.domain.InsertTextInputMapper);
org.korsakow.domain.InputMapperFactory.register("org.korsakow.widget.PlayTime", org.korsakow.domain.PlayTimeInputMapper);
org.korsakow.domain.InputMapperFactory.register("org.korsakow.widget.TotalTime", org.korsakow.domain.TotalTimeInputMapper);
org.korsakow.domain.InputMapperFactory.register("org.korsakow.widget.Scrubber", org.korsakow.domain.ScrubberInputMapper);
org.korsakow.domain.InputMapperFactory.register("org.korsakow.widget.PlayButton", org.korsakow.domain.PlayButtonInputMapper);
org.korsakow.domain.InputMapperFactory.register("org.korsakow.widget.FullscreenButton", org.korsakow.domain.FullscreenButtonInputMapper);
org.korsakow.domain.InputMapperFactory.register("org.korsakow.widget.MasterVolume", org.korsakow.domain.MasterVolumeInputMapper);
org.korsakow.domain.InputMapperFactory.register("org.korsakow.rule.KeywordLookup", org.korsakow.domain.KeywordLookupInputMapper);
org.korsakow.domain.InputMapperFactory.register("org.korsakow.rule.ExcludeKeywords", org.korsakow.domain.ExcludeKeywordsInputMapper);
org.korsakow.domain.InputMapperFactory.register("org.korsakow.rule.Search", org.korsakow.domain.SearchInputMapper);

}catch(e){alert(e);throw e;}
