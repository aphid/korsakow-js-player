try {

NS('org.korsakow.domain.widget');


org.korsakow.domain.Widget = Class.register('org.korsakow.domain.Widget', org.korsakow.domain.DomainObject, {
	initialize: function($super, id, keywords, type, x, y, width, height) {
		if (this.getClass() == org.korsakow.domain.Widget)
			throw new org.korsakow.Exception("Widget is an Abstract class");
		$super(id);
		this.keyword = keywords;
		this.type = type;
		this.x = x;
		this.y = y;
		this.width = width;
		this.height = height;
	}
});

org.korsakow.domain.widget.MainMedia = Class.register('org.korsakow.domain.widget.MainMedia', org.korsakow.domain.Widget, {
	initialize: function($super, id, keywords, type, x, y, width, height) {
		$super(id, keywords, type, x, y, width, height);
	}
	
});

org.korsakow.domain.widget.Preview = Class.register('org.korsakow.domain.widget.Preview', org.korsakow.domain.Widget, {
	initialize: function($super, id, keywords, type, x, y, width, height, index) {
		$super(id, keywords, type, x, y, width, height);
		this.index = index;
	}
});

org.korsakow.domain.widget.FixedPreview = Class.register('org.korsakow.domain.widget.FixedPreview', org.korsakow.domain.Widget, {
	initialize: function($super, id, keywords, type, x, y, width, height, snuId) {
		$super(id, keywords, type, x, y, width, height);
		this.snuId = snuId;
	}
});

org.korsakow.domain.widget.InsertText= Class.register('org.korsakow.domain.widget.InsertText', org.korsakow.domain.Widget, {
	initialize: function($super, id, keywords, type, x, y, width, height, fontColor, fontBackgroundColor, fontFamily, fontSize, fontStyle, fontWeight, textDecoration) {
		$super(id, keywords, type, x, y, width, height);
		this.fontColor = fontColor;
		this.fontBackgroundColor = fontBackgroundColor;
		this.fontFamily = fontFamily;
		this.fontSize = fontSize;
		this.fontStyle = fontStyle;
		this.fontWeight = fontWeight;
		this.textDecoration = textDecoration;
	}
});
org.korsakow.domain.widget.PlayTime= Class.register('org.korsakow.domain.widget.PlayTime', org.korsakow.domain.Widget, {
	initialize: function($super, id, keywords, type, x, y, width, height, fontColor, fontFamily, fontSize, fontStyle, fontWeight, textDecoration) {
		$super(id, keywords, type, x, y, width, height);
		this.fontColor = fontColor;
		//this.fontBackgroundColor = fontBackgroundColor;
		this.fontFamily = fontFamily;
		this.fontSize = fontSize;
		this.fontStyle = fontStyle;
		this.fontWeight = fontWeight;
		this.textDecoration = textDecoration;
		
	}
});
org.korsakow.domain.widget.TotalTime= Class.register('org.korsakow.domain.widget.TotalTime', org.korsakow.domain.Widget, {
	initialize: function($super, id, keywords, type, x, y, width, height, fontColor, fontFamily, fontSize, fontStyle, fontWeight, textDecoration) {
		$super(id, keywords, type, x, y, width, height);
		this.fontColor = fontColor;
		//this.fontBackgroundColor = fontBackgroundColor;
		this.fontFamily = fontFamily;
		this.fontSize = fontSize;
		this.fontStyle = fontStyle;
		this.fontWeight = fontWeight;
		this.textDecoration = textDecoration;
		
	}
});
org.korsakow.domain.widget.Scrubber= Class.register('org.korsakow.domain.widget.Scrubber', org.korsakow.domain.Widget, {
	initialize: function($super, id, keywords, type, x, y, width, height, backgroundColor, foregroundColor, interactive, loading, loadingColor, barWidth, barHeight) {
		$super(id, keywords, type, x, y, width, height);
		this.backgroundColor = backgroundColor;
		this.foregroundColor = foregroundColor;
		this.interactive = interactive;
		this.loading = loading;
		this.loadingColor = loadingColor;
		this.barWidth = barWidth;
		this.barHeight = barHeight;
		
	}
});

org.korsakow.domain.widget.FullscreenButton = Class.register('org.korsakow.domain.widget.FullscreenButton', org.korsakow.domain.Widget, {
	initialize: function($super, id, keywords, type, x, y, width, height) {
		$super(id, keywords, type, x, y, width, height);
	}
});

org.korsakow.domain.widget.MasterVolume = Class.register('org.korsakow.domain.widget.MasterVolume', org.korsakow.domain.Widget, {
	initialize: function($super, id, keywords, type, x, y, width, height) {
		$super(id, keywords, type, x, y, width, height);
	}
});

org.korsakow.domain.widget.PlayButton = Class.register('org.korsakow.domain.widget.PlayButton', org.korsakow.domain.Widget, {
	initialize: function($super, id, keywords, type, x, y, width, height) {
		$super(id, keywords, type, x, y, width, height);
	}
});

org.korsakow.domain.widget.Subtitles = Class.register('org.korsakow.domain.widget.Subtitles', org.korsakow.domain.Widget, {
	initialize: function($super, id, keywords, type, x, y, width, height, subtitleCueArray) {
		$super(id, keywords, type, x, y, width, height);
		this.subtitles = new Array();
		this.subtitles = subtitleCueArray.slice(0);
	}
});

org.korsakow.domain.widget.SubtitleCuePoint = Class.register('org.korsakow.domain.widget.SubtitleCuePoint', org.korsakow.domain.Widget, {
	initialize: function($super, id, keywords, type, x, y, width, height, name, subtitles, startTime, endTime) {
		$super(id, keywords, type, x, y, width, height);
		this.name = name;
		this.subtitles = new Array();
		this.subtitles = subtitles.slice(0);
		//for(var i = 0; i < subtitles.length; i++){this.subtitles[i] = subtitles[i];} //Alternate deep copy
		this.startTime = startTime;
		this.endTime = endTime;
	}
});

}catch(e){alert(e);throw e;}
