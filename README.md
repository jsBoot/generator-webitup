# generator-webitup [![Build Status](https://secure.travis-ci.org/webitup/generator-webitup.png?branch=master)](https://travis-ci.org/webitup/generator-webitup)

About
-------------

Scaffolding base for WIU projects leveraging [Yeoman](http://yeoman.io).


For the impatients
-------------

You obviously need to have npm installed.

Install the generator once globally:

  npm install -g generator-webitup

Create a new project, or go into an existing one, and scaffold it:

  mkdir /workspace/someproject && cd /workspace/someproject
  yo webitup

Answer questions.

Now you have a bunch of tasks:

  grunt --help

... and a scaffolded project in which you can start hacking.

In case some tasks would fail, you would likely be missing some dependencies.

The ./init.sh is here to help for that (run it once).

Problem
-------------

Need scaffolding for WIU projects.

Solution
-------------

Yo generator.

API
-------------

Sort of "smells" existing git folders to provide sensible defaults.

Also supports reading a ~/.webituprc file for defaults.

How to build
-------------

  git clone git@github.com:jsBoot/generator-webitup.git
  cd generator-webitup

If you just want to test that version: 

  npm install .

If you plan on debugging it, you should rather link it:
  npm link

Here is how you would remove the link:
  npm r generator-webitup -g

The generator usage itself requires

How to contribute
-------------

Loren ipsum.

History
-------------

Loren ipsum.

License
-------------

MIT. See `LICENSE.md` in this directory.
