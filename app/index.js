'use strict';
var fs = require('fs');
var inquirer = require('inquirer');
var util = require('util');
var path = require('path');
var yeoman = require('yeoman-generator');


var licenses = (function(){
  var ls = fs.readdirSync(path.join(__dirname, 'templates'));
  var def = {};
  ls.forEach(function(item){
    var m = item.match(/^(.*)_LICENSE[.]md$/);
    if(m)
      def[m.pop()] = item;
  });
  return def;
})();

var DefaultsHandler = function(path, version, defaults, prompts){

  var merge = function (target, src) {
    var array = Array.isArray(src)
    var dst = array && [] || {}

    if (array) {
      target = target || []
      dst = dst.concat(target)
      src.forEach(function(e, i) {
        if (typeof target[i] === 'undefined') {
            dst[i] = e
        } else if (typeof e === 'object') {
            dst[i] = merge(target[i], e)
        } else {
            if (target.indexOf(e) === -1) {
                dst.push(e)
            }
        }
      })
    } else {
      if (target && typeof target === 'object') {
          Object.keys(target).forEach(function (key) {
              dst[key] = target[key]
          })
      }
      Object.keys(src).forEach(function (key) {
          if (typeof src[key] !== 'object' || !src[key]) {
              dst[key] = src[key]
          }
          else {
              if (!target[key]) {
                  dst[key] = src[key]
              } else {
                  dst[key] = merge(target[key], src[key])
              }
          }
      })
    }

    return dst
  };

  var loaded;
  var data = merge({}, defaults);
  data.version = version;

  var question = function(cb){
    inquirer.prompt(prompts, function (props) {
      Object.keys(props).forEach(function(name){
        var keys = name.match(/^(.+)([A-Z].+)$/);
        if(!keys){
          data[name] = props[name];
          return;
        }
        var sKey = keys.pop().toLowerCase();
        var fKey = keys.pop();
        if(!(fKey in data))
          data[fKey] = {};
        data[fKey][sKey] = props[name];
      })
      save();
      cb();
    });
  };

  var save = function(){
    fs.writeFileSync(path, JSON.stringify(data));
  };

  this.load = function(continuation){
    try{
      var d = fs.readFileSync(path, {encoding: 'utf8'});
      try{
        loaded = JSON.parse(d);
      }catch(e){
        console.error('User config file horked!');
      }

      if(parseInt(loaded.version) < parseInt(version)){
        console.error('Your .webituprc file is of an older, non compatible version than what the installed webitup generator requires. Fallback to defaults!');
      }else if(loaded.version <= version){
        loaded.version = data.version;
        data = merge(data, loaded);
      }else{
        console.error('Your .webituprc file is of a newer version than what the installed webitup generator requires. Fallback to defaults!');
      }

      continuation();
    }catch(e){

      console.warn('No config file at ' + path + '! Please answer the questions to populate it');
      question(continuation);
    }
  };

  this.save = function(){
    fs.writeFileSync(path, JSON.stringify(data));
  };

  Object.defineProperty(this, 'data', {
    get: function(){
      return data;
    }
  });

};

var banner = ' __      __      ___.   .___  __   ____ ___         \n\
/  \\    /  \\ ____\\_ |__ |   |/  |_|    |   \\______  \n\
\\   \\/\\/   // __ \\| __ \\|   \\   __\\    |   /\\____ \\ \n\
 \\        /\\  ___/| \\_\\ \\   ||  | |    |  / |  |_> >\n\
  \\__/\\  /  \\___  >___  /___||__| |______/  |   __/ \n\
       \\/       \\/    \\/                    |__|    ';

var defaults = new DefaultsHandler(path.join(process.env[(process.platform == 'win32') ? 'USERPROFILE' : 'HOME'], ".webituprc"), 1, {
  company: {
    name: '',
    mail: '',
    url: '',
    github: ''
  },
  you: {
    name: '',
    mail: '',
    url: '',
    github: ''
  },
  license: 'MIT',
  ln: 'en-us'
}, [{
    name: 'companyName',
    message: 'Default company name'
  },
  {
    name: 'companyMail',
    message: 'Default company mail'
  },
  {
    name: 'companyUrl',
    message: 'Default company url'
  },
  {
    name: 'companyGithub',
    message: 'Default company github handler'
  },
  {
    name: 'youName',
    message: 'Your default name'
  },
  {
    name: 'youMail',
    message: 'Your default mail'
  },
  {
    name: 'youUrl',
    message: 'Your default url'
  },
  {
    name: 'youGithub',
    message: 'Your default github handler'
  },
  {
    name: 'license',
    message: 'Your default license (among: ' + Object.keys(licenses).join(',') + ')'
  }]
);


var WebitupGenerator = module.exports = function WebitupGenerator(args, options, config) {
  yeoman.generators.Base.apply(this, arguments);

  this.on('end', function () {
    this.installDependencies({ skipInstall: options['skip-install'] });
  });

  this.pkg = JSON.parse(this.readFileAsString(path.join(__dirname, '../package.json')));
};

util.inherits(WebitupGenerator, yeoman.generators.Base);

WebitupGenerator.prototype.askFor = function askFor() {
  // have Yeoman greet the user.
  var cb = this.async();

  console.log(banner);

  var gitName;
  var gitOwnerNick;
  try{
    var gitData = fs.readFileSync('.git/config', {encoding: 'utf8'});
    gitData = gitData.match(/url = [^:]+[:]([^\/]+)\/(.*)[.]git/);
    gitName = gitData.pop();
    gitOwnerNick = gitData.pop();
  }catch(e){
    console.warn('This is not git initialized. Using path instead.');
    gitName = process.cwd().split('/').pop();
    // gitOwnerNick = process.cwd().split('/');
    // gitOwnerNick.pop();
    // gitOwnerNick = gitOwnerNick.pop();
  }

  defaults.load(function(){
    console.log('Package informations:');

    var prompts = [{
      name: 'packName',
      message: 'Package name',
      default: gitName
    },
    {
      name: 'packDescription',
      message: 'Package description',
      default: 'Description'
    },
    {
      name: 'packKeywords',
      message: 'Package keywords (comma separated)',
      default: 'keyword,keyword'
    },
    {
      name: 'packLicense',
      message: 'Package license (among: ' + Object.keys(licenses).join(',') + ')',
      default: defaults.data.license
    },
    {
      name: 'packHomepage',
      message: 'Package home url',
      default: defaults.data.company.url
    },
    {
      name: 'packOwner',
      message: 'Package "github owner"',
      default: gitOwnerNick || defaults.data.company.github || defaults.data.you.github
    },
    {
      name: 'authorName',
      message: 'Package author name',
      default: defaults.data.company.name || defaults.data.you.name
    },
    {
      name: 'authorMail',
      message: 'Package author mail',
      default: defaults.data.company.mail || defaults.data.you.mail
    },
    {
      name: 'authorUrl',
      message: 'Package author url',
      default: defaults.data.company.url || defaults.data.you.url
    },
    {
      name: 'maintainerName',
      message: 'Package maintainer name',
      default: defaults.data.you.name
    },
    {
      name: 'maintainerMail',
      message: 'Package maintainer mail',
      default: defaults.data.you.mail
    },
    {
      name: 'maintainerUrl',
      message: 'Package maintainer url',
      default: defaults.data.you.url
    },
    {
      name: 'contributorName',
      message: 'Package contributor name',
      default: defaults.data.you.name
    },
    {
      name: 'contributorMail',
      message: 'Package contributor mail',
      default: defaults.data.you.mail
    },
    {
      name: 'contributorUrl',
      message: 'Package contributor url',
      default: defaults.data.you.url
    }
    ];

    this.prompt(prompts, function (props) {
      Object.keys(props).forEach(function(name){
        var keys = name.match(/^(.+)([A-Z].+)$/);
        var sKey = keys.pop().toLowerCase();
        var fKey = keys.pop();
        if(!(fKey in this))
          this[fKey] = {};
        this[fKey][sKey] = props[name];
      }, this)

      this.pack.keywords = JSON.stringify(this.pack.keywords.split(',').map(function(item){
        return item.trim();
      }));


      this.pack.dist = this.pack.name.replace(/([.].*)/, '');

      cb();
    }.bind(this));

  }.bind(this));
};

WebitupGenerator.prototype.app = function app() {
  // this.mkdir('app');
  // this.mkdir('app/templates');

  // XXX move this to inquirer validator
  if(!(this.pack.license in licenses))
    throw Exception("Invalid license")

  this.directory('tests');
  this.directory('src');
  this.directory('doc');

  this.template('_package.json', 'package.json');
  this.template('_bower.json', 'bower.json');
  this.template('_README.md', 'README.md');
  this.template(licenses[this.pack.license], 'LICENSE.md')

  this.template('tests/karma.html', 'tests/karma.html');
  this.template('_Gruntfile.js', 'Gruntfile.js');

};

WebitupGenerator.prototype.projectfiles = function projectfiles() {
  this.copy('editorconfig', '.editorconfig');
  this.copy('gitignore', '.gitignore');
  this.copy('jshintrc', '.jshintrc');
  this.copy('csslintrc', '.csslintrc');
  this.copy('bowerrc', '.bowerrc');
  this.copy('_project.sublime-project', this.pack.name + '.sublime-project');
  this.copy('_icon.png', 'icon.png');
};

