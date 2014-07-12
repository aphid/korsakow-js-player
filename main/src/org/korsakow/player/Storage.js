NS('org.korsakow');

org.korsakow.WebStorage = Class.register('org.korsakow.WebStorage', org.korsakow.Object, {
	initialize: function($super, storage) {
		$super();
		this.storage = storage;
	},
	length: function() {
		return this.storage.length;
	},
	get: function(key) {
		return this.storage.getItem(key);
	},
	set: function(key, value) {
		return this.storage.setItem(key, value);
	},
	remove: function(key) {
		return this.storage.removeItem(key);
	},
	clear: function() {
		return this.storage.clear();
	}
});
org.korsakow.MemoryStorage = Class.register('org.korsakow.MemoryStorage', org.korsakow.Object, {
	initialize: function($super) {
		$super();
		this.heap = {};
	},
	length: function() {
		return Object.keys(this.heap).length;
	},
	get: function(key) {
		return this.heap[key];
	},
	set: function(key, value) {
		this.heap[key] = value;
	},
	remove: function(key) {
		delete this.heap[key];
	},
	clear: function() {
		this.heap = {};
	}
});
