NS('org.korsakow.mock');

org.korsakow.mock.whenEvent = function(elm, event) {
	var handler = function() {
		
	};
	elm.bind(event, handler);
	return spy(handler);
};

org.korsakow.mock.Date = Class.register('org.korsakow.mock.Date', org.korsakow.Object, {
});
org.korsakow.mock.Date._now = 0;
org.korsakow.mock.Date.now = function(x) {
	if (typeof x !== 'undefined')
		org.korsakow.mock.Date._now = x;
	return org.korsakow.mock.Date._now;
};
org.korsakow.mock.Date.advance = function(x) {
	org.korsakow.mock.Date._now += x;
	return org.korsakow.mock.Date._now;
};
org.korsakow.Date = org.korsakow.mock.Date;

org.korsakow.mock.Timeout = Class.register('org.korsakow.mock.Timeout', org.korsakow.Object, {
	initialize: function($super) {
		$super();
		this.queue = [];
		this.cleared = [];
		this.t = 0;
	},
	create: function(func, delay) {
		var id = this.queue.length;
		this.queue.push({
			id: id,
			func: func,
			time: this.t + delay
		});
	},
	clear: function(id) {
		var index = this.queue.findIndex(function(q) { return q.id === id; });
		if (index !== -1) {
			this.cleared.push(id);
			clearTimeout(id);
		}
	},
	isTimeout: function(id) {
		return -1 !== this.queue.findIndex(function(q) { return q.id === id; });
	},
	isCleared: function(id) {
		return -1 !== this.cleared.findIndex(function(q) { return q.id === id; });
	},
	flush: function(time) {
		var now = this.t + (time||0);
		this.queue.forEach(function(q) {
			if (now >= q.time)
				q.func.apply();
		});
		this.t = now;
	}
});
org.korsakow.Timeout = new org.korsakow.mock.Timeout();

org.korsakow.mock.Interval = Class.register('org.korsakow.mock.Interval', org.korsakow.Object, {
	initialize: function($super) {
		$super();
		this.queue = [];
		this.cleared = [];
		this.t = 0;
	},
	create: function(func, delay) {
		var id = this.queue.length;
		this.queue.push({
			id: id,
			func: func,
			time: this.t + delay
		});
	},
	clear: function(id) {
		var index = this.queue.findIndex(function(q) { return q.id === id; });
		if (index !== -1) {
			this.cleared.push(id);
			clearTimeout(id);
		}
	},
	isInterval: function(id) {
		return -1 !== this.queue.findIndex(function(q) { return q.id === id; });
	},
	isCleared: function(id) {
		return -1 !== this.cleared.findIndex(function(q) { return q.id === id; });
	},
	flush: function(time) {
		var now = this.t + (time||0);
		this.queue.forEach(function(q) {
			if (now >= q.time)
				q.func.apply();
		});
		this.t = now;
	}
});
org.korsakow.Interval = new org.korsakow.mock.Interval();

org.korsakow.mock.flushTimers = function(time) {
	org.korsakow.mock.Date.advance(time);
	org.korsakow.Timeout.flush(time);
	org.korsakow.Interval.flush(time);
};
