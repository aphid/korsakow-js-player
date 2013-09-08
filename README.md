korsakow-js-player
==================

The player is the web front end for a Korsakow film. It reads in a project exported by the desktop publisher.

# Structure of a Korsakow film

* Static content
   These files are usually the same for all films. They describe the default layout and logic for films.
    * index.html
    * data/css/
    * data/js/
* Dynamic content
    These files are specific to a given film.
    * data/image/
    * data/video/
    * data/subtitle/
    * data/thumbnail/
        These folders contain the media played in a film.
    * data/project.xml
        This is the core of a Korsakow film. It describes all the media and how they are connected and presented.


# Information for developers
See [DEVELOPERS.md](DEVELOPERS.md)


