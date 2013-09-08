korsakow-js-player
==================

Developers' Guide.


# Project Layout

# Code Structure

## Dependencies

 * [prototype.js](http://prototypejs.org/): We like prototype's support for object-oriented style classes, but care little for the rest. Korsakow depends on a modified prototype.js which extracts the class-enablement. -- There are some potential maintainability issues that should be considered because of this.

 * [jQuery](http://jquery.com/): We use jQuery liberally, in compatibility mode: we use jQuery(...) instead of $(...).

## Structure

Where it makes sense, we apply the [MVC](http://en.wikipedia.org/wiki/Model%E2%80%93view%E2%80%93controller) pattern. In a korsakow film this applies mainly to Widgets, which are the primary display element. Other places where there is no view we are less formal in the separation between data and behaviour.


### Models
These classes are pure data types: SNU, ?x

Some models, like Rules currently also include logic...

#### Media
We have models for media that include such information as where to locate the media, and sometimes metadata like duration (e.g. images can have artificial durations imposed, even though natively the concept has no meaning).
Internally HTML media may have their own MVC, however we consider this a case of [MVVM](http://en.wikipedia.org/wiki/Model_View_ViewModel) and treat HTML media as pure UI.
That means for media, we have models and views but no controllers - or in a way we have many controllers in the form of the widgets which use media.

We have wrappers around HTML5 media types (image, video, sound, ...) that provide a uniform interface. There is already a certain amount of internal MVC built into DOM elements, videos in particular - from our point of view
