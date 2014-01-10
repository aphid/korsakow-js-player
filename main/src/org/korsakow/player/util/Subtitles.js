NS('org.korsakow.util');

org.korsakow.util.SubtitleException = org.korsakow.Exception;

/* Represents a single subtitle
 * 
 * @param name: String name used for debugging
 * @param time: uint the time at which the subtitle first appears
 * @param duration: uint the length of time the subtitle is shown for
 * @param subtitle: Array[String] the lines of text of the subtitle
 */
org.korsakow.util.SubtitleCuePoint = Class.register('org.korsakow.util.SubtitleCuePoint', {
	initialize: function($super, name, time, duration, subtitle) {
		$super();
		this.name = name;
		this.time = time;
		this.duration = duration;
		this.subtitle = subtitle;
	}
});

/* Parses subtitles in the SRT (http://en.wikipedia.org/wiki/SubRip) format. 
 * 
 */
org.korsakow.util.StrSubtitleParser = Class.register('org.korsakow.SubtitleParser', {
	initialize: function($super) {
		$super();
		this.timeLinePattern = /([0-9]{2}):([0-9]{2}):([0-9]{2}),([0-9]{3}) --> ([0-9]{2}):([0-9]{2}):([0-9]{2}),([0-9]{3})/;
	},
	
	/*
	 * @param lines: Array[String]
	 */
	parse: function(rawLines) {
		// TODO don't hardcode fake subtitles.
		var cuepoints = [];
		cuepoints.push(new org.korsakow.util.SubtitleCuePoint('potato1', 0, 10, 'hey, I used to be pretty good at this game.'));
		cuepoints.push(new org.korsakow.util.SubtitleCuePoint('potato2', 10, 4, "I can't believe it used to matter to me"));
		cuepoints.push(new org.korsakow.util.SubtitleCuePoint('potato3', 14, 6, "Making the big shot. Winning the game."));
		cuepoints.push(new org.korsakow.util.SubtitleCuePoint('potato4', 20, 5, "I really used to think there was something between us."));
		return cuepoints;
		var lines = rawLines.split( /(?:\r\n)|\n|\r/ ).map( jQuery.trim ); // the defacto standard seems to be CRLF but users have such a hard time with this so we're leanient
		var line = 0;
		var counter = 0;

		while (line < lines.length) {
			if (!lines[line].length) {
				++line;
				continue;
			}
			var ret = this.parseCuePoint( lines, line, counter );
			line = ret.offset;
			++counter;
			cuepoints.push( ret.cuepoint );
		}
		return cuepoints;
	},
	/*
	 * @param lines: Array[String] line array
	 * @param offset: uint offset into lines of the current cuepoint
	 * @param counter: uint consistency counter
	 * @return {offset:Number, cuepoint:ICuePoint}
	 */
	parseCuePoint: function(lines, offset, counter) {
		var count = parseInt( lines[offset++] );
		if ( count != counter + 1 )
			throw new org.korsakow.util.SubtitleException("inconsistant file at line #" + (offset) + " ; " + count + "!=" + (counter + 1));
		
		var match = this.timeLinePattern.exec( lines[offset++] );
		if (!match)
			throw new org.korsakow.util.SubtitleException("invalid time at line #" + (offset));
		var begin = this.getTime(match[1], match[2], match[3], match[4]) / 1000;
		var end   = this.getTime(match[5], match[6], match[7], match[8]) / 1000;
		
		var content = [];
		for (; offset < lines.length; ++offset) {
			if (!lines[offset].length) {
				++offset;
				break;
			}
			content.push( lines[offset] );
		}
		var name = "" + counter;
		
		return {
			offset: offset,
			cuepoint: new org.korsakow.util.SubtitleCuePoint( name, begin, end-begin, content )
		};
	},
	/*
	 * @param hh: String hours
	 * @param mm: String minutes
	 * @param ss: String seconds
	 * @param ms: String milliseconds
	 * @return uint
	 */
	getTime: function(hh, mm, ss, ms) {
		return (parseInt(hh)*60*60 + parseInt(mm)*60 + parseInt(ss)) * 1000 + parseInt(ms);
	}
});
