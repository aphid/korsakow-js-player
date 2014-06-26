describe('org.korsakow.domain.trigger.SnuTime', function () {
	it('should call a given callback after n milliseconds', function () {
		var snutime = new org.korsakow.domain.trigger.SnuTime(1, 0.001);
		var triggered = false;

		var env1 = mkFakeEnv([0, 0.0005, 0.001]);

		triggered = false;
		snutime.setup(env1, function () {
			triggered = true;
		});
		env1.getMainMediaWidget().view.currentTime(10);
		env1.run();

		expect(triggered).toEqual(true);
	});

	it('should not call a given callback before n milliseconds', function () {
		var snutime = new org.korsakow.domain.trigger.SnuTime(1, 0.001);

		var env1 = mkFakeEnv([0, 0.0005]);

		var triggered = false;
		snutime.setup(env1, function () {
			triggered = true;
		});
		env1.run();

		expect(triggered).toEqual(false);
	});

	it('should not call a given callback if it is cancelled', function () {
		var snutime = new org.korsakow.domain.trigger.SnuTime(1, 0.001);

		var env1 = mkFakeEnv([0, 0.0005, 0.001]);

		var triggered = false;
		snutime.setup(env1, function () {
			triggered = true;
		});
		env1.next();
		env1.next();
		snutime.cancel();
		env1.next();

		expect(triggered).toEqual(false);
	});

	// TODO Maybe clean this up.
	function mkFakeEnv (timeUpdates) {
		var envCallback = null;
		var videl = null;
		var mainMediaView = {
			bind: function (eventType, cb) {
				expect(eventType).toEqual('timeupdate');
				envCallback = cb;
			},
			_currentTime: 0,
			currentTime: function(x) {
				if (typeof x !== "undefined") {
					this._currentTime = x;
				}
				return this._currentTime;
			}
		};
		var mainMediaWidget = {
			view: mainMediaView
		};
		var thisEnv = {
			timeUpdates: timeUpdates,
			next: function () {
				curTime = timeUpdates.shift();
				mainMediaView.currentTime(curTime);
				envCallback.call(videl);
			},
			run: function () {
				var tulength = timeUpdates.length;
				for (var i = 0; i < tulength; i++) {
					this.next();
				}
			},
			getMainMediaWidget: function () {
				return mainMediaWidget;
			}
		};
		return thisEnv;
	};
});
