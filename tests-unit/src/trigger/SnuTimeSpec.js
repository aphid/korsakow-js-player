describe('org.korsakow.domain.trigger.SnuTime', function () {
	it('should call a given callback after n milliseconds', function () {
		var snutime = new org.korsakow.domain.trigger.SnuTime(1, 0.001);
		var triggered = false;
		runs(function() {
			snutime.setup(function () {
				triggered = true;
			});
		});
		waitsFor(function () {
			return triggered;
		}, 5);
		runs(function () {
			expect(triggered).toEqual(true);
		});
	});

	it('should not call a given callback before n milliseconds', function () {
		var snutime = new org.korsakow.domain.trigger.SnuTime(1, 0.1);
		var triggered = false;
		runs(function() {
			snutime.setup(function () {
				triggered = true;
			});
			setTimeout(function () {
				expect(triggered).toEqual(false);
			}, 50)
		});
	});

	it('should not call a given callback if it is cancelled', function () {
		var snutime = new org.korsakow.domain.trigger.SnuTime(1, 0.001);
		var triggered = false;
		var verified = null;
		runs(function() {
			snutime.setup(function () {
				console.log('oops');
				triggered = true;
			});
			setTimeout(function () {
				console.log('hello there');
				verified = !triggered;
			}, 10);
			snutime.cancel();
		});
		waitsFor(function () {
			console.log('checkinchecking');
			return verified;
		}, 20);
	});
});
