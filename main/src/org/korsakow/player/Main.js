try {
/* Custom jQuery selectors */
$.expr[":"].contenteq = function(obj, index, meta, stack){
	return (obj.textContent || obj.innerText || $(obj).text() || "") == meta[3];
};
$.expr[":"].tagName = function(obj, index, meta, stack){
	return (obj.tagName || "") == meta[3];
};

/* */
if(!Object.keys) Object.keys = function(o){
	if (o !== Object(o))
		throw new TypeError('Object.keys called on non-object');
	var ret=[];
	for(var p in o) if(Object.prototype.hasOwnProperty.call(o,p)) ret.push(p);
	return ret;
};
/* */

function NS(ns) {
	ns = ns.split('.');
	var ctx = window;
	for (var i = 0; i < ns.length; ++i) {
		var n = ns[i];
		if (!ctx[n])
			ctx[n] = {};
		ctx = ctx[n];
	}
	return ctx;
}
NS('org.korsakow');
NS('org.korsakow.domain');
NS('org.korsakow.domain.rule');
NS('org.korsakow.domain.widget');

Class.register = function(name) {
	var className = name;
	var args = jQuery.makeArray(arguments);
	args.shift();
	if (name != 'org.korsakow.Object' && args.length >= 1 && !args[0].className)
		args.unshift(org.korsakow.Object);
	var clazz = Class.create.apply(null, args);
	clazz.className = className;
	return clazz;
};

org.korsakow.WrapCallback = function(f) {
	return function() {
		try {
			return f.apply(this, arguments);
		} catch (e) {
			alert('Uncaught exception in anonymous function: ' + e.fileName + "(" + e.lineNumber + "): " + e);
			throw e;
		}
	};
};


org.korsakow.Object = Class.register('org.korsakow.Object', {
	initialize: function(name) {
		this._uniqueId = ++org.korsakow.Object._uniqueIdGen;
	},
	getClass: function() {
		return this.__proto__.constructor;
	},
	toString: function(s) {
		return "[" + this.getClass().className + "#" + this._uniqueId + ";" + (s?s:"") + "]";
	}
});
org.korsakow.Object._uniqueIdGen = 0;

org.korsakow.Exception = Class.register('org.korsakow.Exception', {
	initialize: function($super, message) {
		$super();
		this.message = message;
	},
	toString: function() {
		return "Exception: "+this.message;
	}
});
org.korsakow.Exception = Error;
org.korsakow.NullPointerException = org.korsakow.Exception;
org.korsakow.Exception.getStackString = function() {
	return org.korsakow.Exception.getStackTrace().join("\n");
};
/*
 * http://www.eriwen.com/javascript/js-stack-trace/
 */
org.korsakow.Exception.getStackTrace = function() {
    var callstack = [];
    var isCallstackPopulated = false;
    try {
        i.dont.exist+=0; //doesn't exist- that's the point
    } catch(e) {
        if (e.stack) { //Firefox
            var lines = e.stack.split('\n');
            for (var i=0, len=lines.length; i<len; i++) {
//                if (lines[i].match(/^\s*[A-Za-z0-9\-_\$]+\(/)) {	// dr
                    callstack.push(lines[i]);
//                }	// dr
            }
            //Remove call to printStackTrace()
            callstack.shift();
            isCallstackPopulated = true;
        }
        else if (window.opera && e.message) { //Opera
            var lines = e.message.split('\n');
            for (var i=0, len=lines.length; i<len; i++) {
                if (lines[i].match(/^\s*[A-Za-z0-9\-_\$]+\(/)) {
                    var entry = lines[i];
                    //Append next line also since it has the file info
                    if (lines[i+1]) {
                        entry += ' at ' + lines[i+1];
                        i++;
                    }
                    callstack.push(entry);
                }
            }
            //Remove call to printStackTrace()
            callstack.shift();
            isCallstackPopulated = true;
        }
    }
    if (!isCallstackPopulated) { //IE and Safari
        var currentFunction = arguments.callee.caller;
        while (currentFunction) {
            var fn = currentFunction.toString();
            var fname = fn.substring(fn.indexOf("function") + 8, fn.indexOf('')) || 'anonymous';
            callstack.push(fname);
            currentFunction = currentFunction.caller;
        }
    }
    return callstack;	// dr
};
org.korsakow.NullPointerException = org.korsakow.Exception;

org.korsakow.Factory = Class.register('org.korsakow.Factory', org.korsakow.Object, {
	initialize: function($super, name) {
		$super();
		// dynamically setup static delegate methods in case the factory is a singleton
		var clazz = this.getClass();
		if (!clazz.create) {
			clazz.create = function() {
				return clazz.instance.create.apply(clazz.instance, arguments);
			};
		}
		if (!clazz.register) {
			clazz.register = function() {
				return clazz.instance.register.apply(clazz.instance, arguments);
			};
		}

		this.name = name;
		this.registry = {};
		
	},
	register: function(id, clazz) {
		if (!clazz)
			throw new Error(this + " - Register with null clazz: " + id);
		this.registry[id] = clazz;
	},
	create: function(type, args) {
		var clazz = this.registry[type];
		if (!clazz)
			throw new Error(this +  " - No class registered for: \"" + type + "\"");
		var obj = new clazz(args);
		return obj;
	},
	toString: function() {
		return "[Factory: " + this.name + "]";
	}
});

org.korsakow.Logger = Class.register('org.korsakow.Logger', org.korsakow.Object, {
	initialize: function($super) {
		$super();
	},
	debug: function() {
		console.log(arguments);
	},
	info: function() {
		console.log(arguments);
	},
	warn: function() {
		console.log(arguments);
	},
	error: function() {
		console.log(arguments);
	}
});

org.korsakow.log = new org.korsakow.Logger();

org.korsakow.Utility = Class.register('org.korsakow.Utility', org.korsakow.Object, {
	initialize: function($super){
		$super();
	}
});

org.korsakow.Utility.leadingZeros = function(number, zeros){
	var n = "" + number;
	while(n.length < zeros){
		n = "0" + n;
	}
	return n;
};
org.korsakow.Utility.formatTime = function(time, hours){
	var m,s;
	if (hours) {
        var h = Math.floor(time / 3600);
        time = time - h * 3600;

        m = Math.floor(time / 60);
        s = Math.floor(time % 60);

        return this.leadingZeros(h,2)  + ":" + this.leadingZeros(m,2) + ":" + this.leadingZeros(s,2);
    } else {
        m = Math.floor(time / 60);
        s = Math.floor(time % 60);

        return this.leadingZeros(m,2) + ":" + this.leadingZeros(s,2);
    }
};
org.korsakow.Utility.apply = function(target, property) {
	if (typeof target[property] == "function")
		return target[property]();
	else
		return target[property];
};
org.korsakow.Utility.update = function(target, property, value) {
	var current = target[property];
	if (typeof target[property] == "function")
		target[property](value);
	else
		target[property] = value;
};
org.korsakow.Utility.applyOperators = function(value, current) {
	var t;
	var vs = value?value.toString():"";
	if (vs.indexOf("+=") === 0)
		t = current + value;
	else if (vs.indexOf("-=") === 0)
		t = current - value;
	else if (vs.indexOf("*=") === 0)
		t = current * value;
	else if (vs.indexOf("%") === vs.length-1)
		t = current * value/100;
	else
		t = value;
	return t;
};

org.korsakow.FullScreenAPI = Class.register('org.korsakow.FullScreenAPI',org.korsakow.Object,{
	//derived from: http://johndyer.name/native-fullscreen-javascript-api-plus-jquery-plugin/
	initialize: function($super){
		$super();
		
		this.supportsFullScreen = false;
		this.fullScreenEventName = '';
        this.prefix = '';

		// check for native support
		if (typeof document.cancelFullScreen != 'undefined') {
			this.supportsFullScreen = true;
		} else {
			// check for fullscreen support by vendor prefix
			var browserPrefixes = 'webkit moz o ms khtml'.split(' ');
			for (var i = 0, il = browserPrefixes.length; i < il; i++ ) {
				this.prefix = browserPrefixes[i];
				if (typeof document[this.prefix + 'CancelFullScreen' ] != 'undefined' ) {
					this.supportsFullScreen = true;
					this.fullScreenEventName = this.prefix + 'fullscreenchange';
					break;
				}
			}
		}
	},
	isFullScreen: function() {
		if(this.supportsFullScreen){
			switch (this.prefix) {
				case '':
					return document.fullScreen;
				case 'webkit':
					return document.webkitIsFullScreen;
				default:
					return document[this.prefix + 'FullScreen'];
			}
		}
		else{
			return false;
		}
	},
    requestFullScreen: function(element) {
		if(this.supportsFullScreen){
			return (this.prefix === '') ? element.requestFullScreen() : element[this.prefix + 'RequestFullScreen']();
		}
		else return null;
	},
    cancelFullScreen: function(element) {
		if(this.supportsFullScreen){
			return (this.prefix === '') ? document.cancelFullScreen() : document[this.prefix + 'CancelFullScreen']();
		}
		else return null;
	}
});


org.korsakow.Assert = Class.register('org.korsakow.Assert', org.korsakow.Object, {
	isArray: function(a) {
		// http://stackoverflow.com/questions/1058427/how-to-detect-if-a-variable-is-an-array
		return Object.prototype.toString.call(obj) === '[object Array]';
	},
	isMap: function(m) {
		if (typeof(m) != "Object")
			return false;
		if (m instanceof org.korsakow.Object)
			return false;
		return true;
	}
});
org.korsakow.assert = new org.korsakow.Assert();

org.korsakow.Functor = Class.register('org.korsakow.Functor', {
});
org.korsakow.ftor =
org.korsakow.Functor.create = function(This, func) {
	return function() {
		func.apply(This, arguments);
	};
};

org.korsakow.domain.Player = Class.register('org.korsakow.domain.Player', {
	
});

org.korsakow.Audio = Class.register('org.korsakow.domain.Audio', {
	initialize: function($super, url, vol) {
		$super();
		this.url = url;
		this.innerVolume = vol || 1.0;
		//this.globalVolume = 1.0;
		this.init(url);
	},
	init: function(url) {
		var src = url.substring(0,url.lastIndexOf('.'));
		var This = this;
		this.elem = $("<audio/>")
		/*.attr('src', url)
		.attr('type', 'audio/ogg')*/
		.bind('error', function(event) {
			alert('Audio error: ' + org.korsakow.Audio.errorToString(event.currentTarget.error.code) + "\n" + org.korsakow.Exception.getStackString());
		});
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
			}],
			function(i,info){
				if(This.elem[0].canPlayType(info.type)){
					var source = jQuery("<source />")
						.attr("src", info.src)
						.attr("type", info.type);
					This.elem.append(source);
				}
			}
		);
	},
	play: function() {
		this.elem[0].play();
	},
	pause: function() {
		this.elem[0].pause();
	},
	stop: function() {
		this.elem.stop();
	},
	volume: function(v) {
		if (arguments.length) {
			var t = org.korsakow.Utility.applyOperators(v, this.innerVolume);
			if (isNaN(t)) {
				console.log(v,t);
			}
			this.innerVolume = t;
			this.elem[0].volume = t * org.korsakow.Audio.globalVolume;
		}
		return this.innerVolume;
	},
	cancel: function(opts) {
		opts = opts || {};
		org.korsakow.Fade.fade({
			duration: opts.fade || 0,
			begin: 1,
			end: 0,
			target: this.elem[0],
			property: 'volume',
			complete: org.korsakow.ftor(this, function() {
				if (this.elem) {
					// https://developer.mozilla.org/en-US/docs/Using_HTML5_audio_and_video
					this.elem[0].pause();
					this.elem[0].src = "";
					this.elem.remove();
				}
				this.init(this.url);
			})
		});
	},
	currentTime: function() {
		if (arguments.length) {
			var t = org.korsakow.Utility.applyOperators(v, this.elem[0].currentTime);
			e.currentTime = t;
		}
		return this.elem[0].currentTime;
	},
	playTime: function() {
		return this.elem[0].played.end();
	},
	length: function() {
		return this.elem[0].seekable.end() - this.elem[0].seekable.start();
	},
	setLooping: function(loop){
		this.elem[0].loop = loop;
	}

});

org.korsakow.Audio.globalVolume = 1.0;

org.korsakow.Audio.ERR_ABORTED = 1;
org.korsakow.Audio.ERR_NETWORK = 2;
org.korsakow.Audio.ERR_DECODE = 3;
org.korsakow.Audio.ERR_SRC_NOT_SUPPORTED = 4;
org.korsakow.Audio.errorToString = function(e) {
	switch (e) {
	case org.korsakow.Audio.ERR_ABORTED: return "aborted";
	case org.korsakow.Audio.ERR_NETWORK: return "network error";
	case org.korsakow.Audio.ERR_DECODE: return "decoding error";
	case org.korsakow.Audio.ERR_SRC_NOT_SUPPORTED: return "source not supported";
	default: return "unknown #" + e;
	}
};

org.korsakow.Time = Class.register('org.korsakow.Time', {
});
org.korsakow.getTimer =
org.korsakow.Time.getTimer = function() {
	return new Date().getTime() - org.korsakow.Time.init;
};
org.korsakow.Time.init = new Date().getTime();

org.korsakow.Tween = Class.register('org.korsakow.Tween', {
	initialize: function($super, duration, begin, end) {
		$super();
		this.running = false;
		this.begin = begin;
		this.end = end;
		this.duration = duration;
		this.position = 0;
		this.time = 0;
		this.prev = 0;
	},
	start: function() {
		if (this.running) return;
		this.running = true;
		prev = org.korsakow.Time.getTimer();
		this.timeout = setInterval(org.korsakow.ftor(this, this.onTimer), Math.min(50, this.duration));
	},
	stop: function() {
		if (!this.running) return;
		this.cancel();
		this.position = this.end;
		$(this).trigger('change');
		$(this).trigger('complete');
	},
	cancel: function() {
		if (!this.running) return;
		this.running = false;
		clearInterval(this.timeout);
		this.timeout = null;
	},
	onTimer: function() {
		var now = org.korsakow.Time.getTimer();
		this.time = (now-prev);
		this.prev = now;
		if (this.time > this.duration)
			this.time = this.duration;
		this.position = this.begin + (this.end-this.begin) * (this.duration?(this.time / this.duration):1);
		if (this.time >= this.duration)
			this.stop();
		else
			$(this).trigger('change');
	}
});

org.korsakow.Fade = Class.register('org.korsakow.Fade', {
	
});
org.korsakow.Fade.fade = function(opts) {
	var t = new org.korsakow.Tween(opts.duration, opts.begin, opts.end);
	var init = org.korsakow.Utility.apply(opts.target, opts.property);
	$(t).bind('change', function() {
		org.korsakow.Utility.update(opts.target, opts.property, t.position);
	});
	if (opts.complete)
		$(t).bind('complete', opts.complete);
	org.korsakow.Utility.update(opts.target, opts.property, 0);
	t.start();
	return t;
};

}catch(e){alert(e);throw e;}