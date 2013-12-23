#!/bin/sh

if [[ `uname` == "Darwin" ]]; then
  export PACKMAN="brew"
  export IS_DARWIN=true
elif [[ `uname` == "Linux" ]]; then
  export PACKMAN="apt-get"
else
  export PACKMAN="nopackman"
fi

install_nopackman(){
  echo "No supported package manager for `uname`."
  echo "Likely, you will have to install node, ruby and/or python on your own."
  exit 1
}

install_brew(){
    mkdir homebrew && curl -L https://github.com/mxcl/homebrew/tarball/master | tar xz --strip 1 -C homebrew
    mkdir ~/tmp/homebrewcache
    mkdir ~/tmp/homebrewtemp
    if [ ! -z "$IS_DARWIN" ]; then
      echo "Add this to your .profile file:"
      echo "  export PATH=~/bin/homebrew/bin:~/bin/homebrew/sbin:\${PATH}"
      echo "  export HOMEBREW_GITHUB_API_TOKEN=YOURTOKEN"
      echo "  export HOMEBREW_CACHE=~/tmp/homebrewcache"
      echo "  export HOMEBREW_TEMP=~/tmp/homebrewtemp"
      echo "  source \`brew --repository\`/Library/Contributions/brew_bash_completion.sh"
      echo "Hit enter when done"
      read
      $SHELL -l
    fi
}

enforce_package_manager(){
  if [ -z "`which $PACKMAN`" ]; then
    eval install_${PACKMAN}
  fi
}

require_node(){
  if [ -z "`which node`" ]; then
    enforce_package_manager

    $PACKMAN install node
  fi
}

require_rbenv(){
  if [ -z "`which rbenv`" ]; then
    enforce_package_manager

    # Ruby shit and compass / sass
    $PACKMAN install rbenv ruby-build
    echo "Add this to your .profile file:"
    echo "  export RBENV_ROOT=~/bin/homebrew/var/rbenv"
    echo "  if which rbenv > /dev/null; then eval \"\$(rbenv init -)\"; fi"
    echo "Hit enter when done"
    read
    $SHELL -l

    rbenv install 2.0.0-p353
    rbenv global 2.0.0-p353
    rbenv rehash
    $SHELL -l
  fi
}

require_yo(){
  require_node

  if [ -z "`which yo`" ]; then
    npm install -g yo
  fi
}

require_compass(){
  require_rbenv
  if [ -z "`which sass`" ]; then
    gem update --system
    gem install sass --pre
    gem install compass --pre
    # Overwrite compass with that
    gem install compass-sourcemaps --pre
    rbenv rehash
  fi
}

require_grunt_bower(){
  require_node

  if [ -z "`which bower`" ]; then
    npm install -g grunt-cli bower
  fi
}

echo $PACKMAN

exit


init_project(){
  # npm cache clean
  npm install
  bower install
}


require_compass
require_grunt_bower
init_project

# To use this package generator you need:
# require_yo

# To work in here on the other hand requires:
# develop_project




# require_pythons(){
#   enforce_package_manager

#   if [ -z "`which python3`" ]; then
#     if [ ! -z "$IS_DARWIN" ]; then
#       brew tap homebrew/versions
#     fi
#     $PACKMAN install python python24 python3 python31 python32 pypy jython
#   fi
# }

# require_mobile(){
#   enforce_package_manager

#   if [ -z "`which phonegap`" ]; then
#     $PACKMAN install android-ndk android-sdk ios-sim
#     npm install -g phonegap
#   fi
# }






# brew tap josegonzalez/php

# # Dev base
# brew install nmap doxygen

# brew install nginx

# brew install mongodb varnish

# # Mobile

# # Other SDKs
# brew install qt swig flex_sdk

# # Post installation for flex
# mkdir -p ~/.ant/lib
# ln -s `brew --repository`/Cellar/flex_sdk/*/libexec/ant/lib/flexTasks.jar ~/.ant/lib

# # Audio stuff
# brew install cdparanoia cd-discid chromaprint cuetools faac ffmpeg flac shntool

# # System ext stuff
# brew install unrar p7zip

# # Docker stuff
# brew install graphviz

# # Pip stuff
# pip install stormssh
# pip install http://closure-linter.googlecode.com/files/closure_linter-latest.tar.gz
# pip install puke
# # pip install psutil pyliblzma puke2
