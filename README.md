# Korsakow

Korsakow is an open-source application for creating web docs and other kinds of nonlinear, interactive narratives. For more information please visit [http://korsakow.org]()


## The Korsakow Player

The player is the web front end for a Korsakow film. It reads in a project exported by the desktop editor [github project](https://github.com/korsakow/korsakow-editor).

## Structure of a Korsakow film

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


## Information for developers

See [DEVELOPERS.md](DEVELOPERS.md)
