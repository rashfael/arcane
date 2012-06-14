var require = function (file, cwd) {
    var resolved = require.resolve(file, cwd || '/');
    var mod = require.modules[resolved];
    if (!mod) throw new Error(
        'Failed to resolve module ' + file + ', tried ' + resolved
    );
    var res = mod._cached ? mod._cached : mod();
    return res;
}

require.paths = [];
require.modules = {};
require.extensions = [".js",".coffee"];

require._core = {
    'assert': true,
    'events': true,
    'fs': true,
    'path': true,
    'vm': true
};

require.resolve = (function () {
    return function (x, cwd) {
        if (!cwd) cwd = '/';
        
        if (require._core[x]) return x;
        var path = require.modules.path();
        cwd = path.resolve('/', cwd);
        var y = cwd || '/';
        
        if (x.match(/^(?:\.\.?\/|\/)/)) {
            var m = loadAsFileSync(path.resolve(y, x))
                || loadAsDirectorySync(path.resolve(y, x));
            if (m) return m;
        }
        
        var n = loadNodeModulesSync(x, y);
        if (n) return n;
        
        throw new Error("Cannot find module '" + x + "'");
        
        function loadAsFileSync (x) {
            if (require.modules[x]) {
                return x;
            }
            
            for (var i = 0; i < require.extensions.length; i++) {
                var ext = require.extensions[i];
                if (require.modules[x + ext]) return x + ext;
            }
        }
        
        function loadAsDirectorySync (x) {
            x = x.replace(/\/+$/, '');
            var pkgfile = x + '/package.json';
            if (require.modules[pkgfile]) {
                var pkg = require.modules[pkgfile]();
                var b = pkg.browserify;
                if (typeof b === 'object' && b.main) {
                    var m = loadAsFileSync(path.resolve(x, b.main));
                    if (m) return m;
                }
                else if (typeof b === 'string') {
                    var m = loadAsFileSync(path.resolve(x, b));
                    if (m) return m;
                }
                else if (pkg.main) {
                    var m = loadAsFileSync(path.resolve(x, pkg.main));
                    if (m) return m;
                }
            }
            
            return loadAsFileSync(x + '/index');
        }
        
        function loadNodeModulesSync (x, start) {
            var dirs = nodeModulesPathsSync(start);
            for (var i = 0; i < dirs.length; i++) {
                var dir = dirs[i];
                var m = loadAsFileSync(dir + '/' + x);
                if (m) return m;
                var n = loadAsDirectorySync(dir + '/' + x);
                if (n) return n;
            }
            
            var m = loadAsFileSync(x);
            if (m) return m;
        }
        
        function nodeModulesPathsSync (start) {
            var parts;
            if (start === '/') parts = [ '' ];
            else parts = path.normalize(start).split('/');
            
            var dirs = [];
            for (var i = parts.length - 1; i >= 0; i--) {
                if (parts[i] === 'node_modules') continue;
                var dir = parts.slice(0, i + 1).join('/') + '/node_modules';
                dirs.push(dir);
            }
            
            return dirs;
        }
    };
})();

require.alias = function (from, to) {
    var path = require.modules.path();
    var res = null;
    try {
        res = require.resolve(from + '/package.json', '/');
    }
    catch (err) {
        res = require.resolve(from, '/');
    }
    var basedir = path.dirname(res);
    
    var keys = (Object.keys || function (obj) {
        var res = [];
        for (var key in obj) res.push(key)
        return res;
    })(require.modules);
    
    for (var i = 0; i < keys.length; i++) {
        var key = keys[i];
        if (key.slice(0, basedir.length + 1) === basedir + '/') {
            var f = key.slice(basedir.length);
            require.modules[to + f] = require.modules[basedir + f];
        }
        else if (key === basedir) {
            require.modules[to] = require.modules[basedir];
        }
    }
};

require.define = function (filename, fn) {
    var dirname = require._core[filename]
        ? ''
        : require.modules.path().dirname(filename)
    ;
    
    var require_ = function (file) {
        return require(file, dirname)
    };
    require_.resolve = function (name) {
        return require.resolve(name, dirname);
    };
    require_.modules = require.modules;
    require_.define = require.define;
    var module_ = { exports : {} };
    
    require.modules[filename] = function () {
        require.modules[filename]._cached = module_.exports;
        fn.call(
            module_.exports,
            require_,
            module_,
            module_.exports,
            dirname,
            filename
        );
        require.modules[filename]._cached = module_.exports;
        return module_.exports;
    };
};

if (typeof process === 'undefined') process = {};

if (!process.nextTick) process.nextTick = (function () {
    var queue = [];
    var canPost = typeof window !== 'undefined'
        && window.postMessage && window.addEventListener
    ;
    
    if (canPost) {
        window.addEventListener('message', function (ev) {
            if (ev.source === window && ev.data === 'browserify-tick') {
                ev.stopPropagation();
                if (queue.length > 0) {
                    var fn = queue.shift();
                    fn();
                }
            }
        }, true);
    }
    
    return function (fn) {
        if (canPost) {
            queue.push(fn);
            window.postMessage('browserify-tick', '*');
        }
        else setTimeout(fn, 0);
    };
})();

if (!process.title) process.title = 'browser';

if (!process.binding) process.binding = function (name) {
    if (name === 'evals') return require('vm')
    else throw new Error('No such module')
};

if (!process.cwd) process.cwd = function () { return '.' };

if (!process.env) process.env = {};
if (!process.argv) process.argv = [];

require.define("path", function (require, module, exports, __dirname, __filename) {
function filter (xs, fn) {
    var res = [];
    for (var i = 0; i < xs.length; i++) {
        if (fn(xs[i], i, xs)) res.push(xs[i]);
    }
    return res;
}

// resolves . and .. elements in a path array with directory names there
// must be no slashes, empty elements, or device names (c:\) in the array
// (so also no leading and trailing slashes - it does not distinguish
// relative and absolute paths)
function normalizeArray(parts, allowAboveRoot) {
  // if the path tries to go above the root, `up` ends up > 0
  var up = 0;
  for (var i = parts.length; i >= 0; i--) {
    var last = parts[i];
    if (last == '.') {
      parts.splice(i, 1);
    } else if (last === '..') {
      parts.splice(i, 1);
      up++;
    } else if (up) {
      parts.splice(i, 1);
      up--;
    }
  }

  // if the path is allowed to go above the root, restore leading ..s
  if (allowAboveRoot) {
    for (; up--; up) {
      parts.unshift('..');
    }
  }

  return parts;
}

// Regex to split a filename into [*, dir, basename, ext]
// posix version
var splitPathRe = /^(.+\/(?!$)|\/)?((?:.+?)?(\.[^.]*)?)$/;

// path.resolve([from ...], to)
// posix version
exports.resolve = function() {
var resolvedPath = '',
    resolvedAbsolute = false;

for (var i = arguments.length; i >= -1 && !resolvedAbsolute; i--) {
  var path = (i >= 0)
      ? arguments[i]
      : process.cwd();

  // Skip empty and invalid entries
  if (typeof path !== 'string' || !path) {
    continue;
  }

  resolvedPath = path + '/' + resolvedPath;
  resolvedAbsolute = path.charAt(0) === '/';
}

// At this point the path should be resolved to a full absolute path, but
// handle relative paths to be safe (might happen when process.cwd() fails)

// Normalize the path
resolvedPath = normalizeArray(filter(resolvedPath.split('/'), function(p) {
    return !!p;
  }), !resolvedAbsolute).join('/');

  return ((resolvedAbsolute ? '/' : '') + resolvedPath) || '.';
};

// path.normalize(path)
// posix version
exports.normalize = function(path) {
var isAbsolute = path.charAt(0) === '/',
    trailingSlash = path.slice(-1) === '/';

// Normalize the path
path = normalizeArray(filter(path.split('/'), function(p) {
    return !!p;
  }), !isAbsolute).join('/');

  if (!path && !isAbsolute) {
    path = '.';
  }
  if (path && trailingSlash) {
    path += '/';
  }
  
  return (isAbsolute ? '/' : '') + path;
};


// posix version
exports.join = function() {
  var paths = Array.prototype.slice.call(arguments, 0);
  return exports.normalize(filter(paths, function(p, index) {
    return p && typeof p === 'string';
  }).join('/'));
};


exports.dirname = function(path) {
  var dir = splitPathRe.exec(path)[1] || '';
  var isWindows = false;
  if (!dir) {
    // No dirname
    return '.';
  } else if (dir.length === 1 ||
      (isWindows && dir.length <= 3 && dir.charAt(1) === ':')) {
    // It is just a slash or a drive letter with a slash
    return dir;
  } else {
    // It is a full dirname, strip trailing slash
    return dir.substring(0, dir.length - 1);
  }
};


exports.basename = function(path, ext) {
  var f = splitPathRe.exec(path)[2] || '';
  // TODO: make this comparison case-insensitive on windows?
  if (ext && f.substr(-1 * ext.length) === ext) {
    f = f.substr(0, f.length - ext.length);
  }
  return f;
};


exports.extname = function(path) {
  return splitPathRe.exec(path)[3] || '';
};

});

require.define("/lib/attributes.coffee", function (require, module, exports, __dirname, __filename) {
(function() {
  var Attributes, CustomSelectors, DetectionMethod, ImageAltTags, SimpleAttributes, SimpleTable, SubItems, methodClasses, utils;
  var __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; }, __hasProp = Object.prototype.hasOwnProperty, __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor; child.__super__ = parent.prototype; return child; };

  utils = require('./utils');

  Attributes = (function() {

    function Attributes(window) {
      var method;
      this.window = window;
      this.findAttributes = __bind(this.findAttributes, this);
      if (!this.window) throw new Error('No window!');
      if (typeof this.window.jQuery !== 'function') throw new Error('No jQuery');
      this.methods = (function() {
        var _i, _len, _results;
        _results = [];
        for (_i = 0, _len = methodClasses.length; _i < _len; _i++) {
          method = methodClasses[_i];
          _results.push(new method(this.window));
        }
        return _results;
      }).call(this);
    }

    Attributes.prototype.findAttributes = function(domElement, config) {
      var attr, attributes, detected, method, methodConfig, _i, _j, _len, _len2, _ref;
      if (config == null) config = {};
      detected = [];
      _ref = this.methods;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        method = _ref[_i];
        methodConfig = config[method.name] || {};
        attributes = method.execute(domElement, methodConfig);
        for (_j = 0, _len2 = attributes.length; _j < _len2; _j++) {
          attr = attributes[_j];
          if (typeof attr !== 'undefined') detected.push(attr);
        }
      }
      return detected;
    };

    return Attributes;

  })();

  DetectionMethod = (function() {

    function DetectionMethod(window, config) {
      this.window = window;
      this.config = config;
      this.execute = __bind(this.execute, this);
      this.weight = 0;
      this.name = 'Name of the Method';
      this.j = this.window.jQuery;
    }

    DetectionMethod.prototype.execute = function(element, config) {
      if (!element) {}
    };

    return DetectionMethod;

  })();

  CustomSelectors = (function() {

    __extends(CustomSelectors, DetectionMethod);

    function CustomSelectors(window) {
      this.execute = __bind(this.execute, this);      CustomSelectors.__super__.constructor.call(this, window);
      this.name = 'CustomSelectors';
    }

    CustomSelectors.prototype.execute = function(element, config) {
      var depth, found, item, value, _i, _len, _ref, _results;
      if (config == null) config = {};
      if (!(config.selectors != null)) return [];
      _ref = config.selectors;
      _results = [];
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        item = _ref[_i];
        found = this.j(item.selector, element)[0];
        if (!(found != null)) break;
        depth = item.includeChildren || 0;
        value = this.j.trim(utils.getText(found, depth));
        _results.push({
          key: item.key,
          value: value,
          found: found,
          name: this.name
        });
      }
      return _results;
    };

    return CustomSelectors;

  })();

  SimpleAttributes = (function() {

    __extends(SimpleAttributes, DetectionMethod);

    function SimpleAttributes(window) {
      this.execute = __bind(this.execute, this);      SimpleAttributes.__super__.constructor.call(this, window);
      this.name = 'SimpleAttributes';
    }

    SimpleAttributes.prototype.execute = function(element, config) {
      var children, depth, el, key, results, value, _i, _len;
      if (config == null) config = {};
      SimpleAttributes.__super__.execute.call(this, element, config);
      children = this.j(element).find('[id],[title],[class]');
      depth = config.includeChildren || 0;
      results = [];
      for (_i = 0, _len = children.length; _i < _len; _i++) {
        el = children[_i];
        value = this.j.trim(utils.getText(el, depth)).replace(/(\n|\t|\r)+/g, ' ');
        key = this.j.trim(el.title || el.id || el.className);
        if (value && value !== key) {
          results.push({
            key: key,
            value: value,
            element: el,
            name: this.name
          });
        }
      }
      return results;
    };

    return SimpleAttributes;

  })();

  ImageAltTags = (function() {

    __extends(ImageAltTags, DetectionMethod);

    function ImageAltTags(window) {
      this.execute = __bind(this.execute, this);      ImageAltTags.__super__.constructor.call(this, window);
      this.name = 'ImageAltTags';
    }

    ImageAltTags.prototype.execute = function(element, config) {
      var el, images, index, _len, _results;
      if (config == null) config = {};
      ImageAltTags.__super__.execute.call(this, element, config);
      images = this.j(element).find('img[alt]');
      _results = [];
      for (index = 0, _len = images.length; index < _len; index++) {
        el = images[index];
        _results.push({
          key: 'img_' + index,
          value: el.alt,
          element: el,
          name: this.name
        });
      }
      return _results;
    };

    return ImageAltTags;

  })();

  SubItems = (function() {

    __extends(SubItems, DetectionMethod);

    function SubItems(window) {
      this.execute = __bind(this.execute, this);      SubItems.__super__.constructor.call(this, window);
      this.name = 'SubItems';
    }

    SubItems.prototype.execute = function(element, config) {
      var attributes, found, group, item, results, values, _i, _j, _len, _len2, _ref, _ref2;
      if (config == null) config = {};
      SubItems.__super__.execute.call(this, element, config);
      if (!config.groups || config.groups.length === 0) {
        return [];
      } else {
        attributes = new Attributes(this.window);
        results = [];
        _ref = config.groups;
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          group = _ref[_i];
          values = [];
          _ref2 = this.j(element).find(group.selector);
          for (_j = 0, _len2 = _ref2.length; _j < _len2; _j++) {
            item = _ref2[_j];
            found = attributes.findAttributes(item);
            values.push(found);
          }
          results.push({
            key: group.key,
            value: values,
            element: null,
            name: this.name
          });
        }
        return results;
      }
    };

    return SubItems;

  })();

  SimpleTable = (function() {

    __extends(SimpleTable, DetectionMethod);

    function SimpleTable(window, config) {
      if (config == null) {
        config = {
          layout: 'auto'
        };
      }
      this.execute = __bind(this.execute, this);
      this.detectTables = __bind(this.detectTables, this);
      this.guessLayout = __bind(this.guessLayout, this);
      this.firstRowKeys = __bind(this.firstRowKeys, this);
      this.firstColumnKeys = __bind(this.firstColumnKeys, this);
      SimpleTable.__super__.constructor.call(this, window, config);
      this.name = 'SimpleTable';
    }

    SimpleTable.prototype.firstColumnKeys = function(element) {
      var key, result, row, rows, tds, value, _i, _len;
      rows = this.j(element).find('tr');
      result = [];
      for (_i = 0, _len = rows.length; _i < _len; _i++) {
        row = rows[_i];
        tds = this.j(row).find('td');
        key = this.j(tds[0]).text();
        value = this.j(tds[1]).text();
        if (value.length !== 0) {
          result.push({
            key: key,
            value: value,
            element: row,
            name: this.name
          });
        }
      }
      return result;
    };

    SimpleTable.prototype.firstRowKeys = function(element) {
      var index, key, keys, value, values, _i, _j, _len, _len2, _len3, _ref, _ref2, _results;
      keys = [];
      values = [];
      _ref = this.j(element).find('tr:nth(0) td');
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        key = _ref[_i];
        keys.push(this.j(key).text());
      }
      _ref2 = this.j(element).find('tr:nth(1) td');
      for (_j = 0, _len2 = _ref2.length; _j < _len2; _j++) {
        value = _ref2[_j];
        values.push(this.j(value).text());
      }
      _results = [];
      for (index = 0, _len3 = keys.length; index < _len3; index++) {
        key = keys[index];
        value = values[index];
        if (value) {
          _results.push({
            key: key,
            value: value,
            element: element,
            name: this.name
          });
        } else {
          _results.push(void 0);
        }
      }
      return _results;
    };

    SimpleTable.prototype.guessLayout = function(table) {
      var layout;
      if (this.j(table).find('tr').length === 2) {
        layout = 'firstRowKeys';
      } else {
        layout = 'firstColumnKeys';
      }
      return layout;
    };

    SimpleTable.prototype.detectTables = function(element) {
      var layout, tableElements, tables, _i, _len;
      tables = [];
      if (this.config.layout === 'auto') {
        if (element.localName === 'table') {
          tables.push({
            element: element,
            layout: this.guessLayout(element)
          });
        } else {
          tableElements = this.j(element).find('table');
          for (_i = 0, _len = tableElements.length; _i < _len; _i++) {
            element = tableElements[_i];
            layout = this.guessLayout(element);
            tables.push({
              element: element,
              layout: layout
            });
          }
        }
      } else {
        tables.push({
          element: element,
          layout: this.config.layout
        });
      }
      return tables;
    };

    SimpleTable.prototype.execute = function(element, config) {
      var results, table, tables, _i, _len;
      if (config == null) config = {};
      SimpleTable.__super__.execute.call(this, element, config);
      tables = this.detectTables(element);
      results = [];
      for (_i = 0, _len = tables.length; _i < _len; _i++) {
        table = tables[_i];
        if (table.layout === 'firstColumnKeys') {
          results = results.concat(this.firstColumnKeys(table.element));
        } else if (table.layout === 'firstRowKeys') {
          results = results.concat(this.firstRowKeys(table.element));
        } else {
          throw new Error("Table layout " + table.layout + " not supported!");
        }
      }
      return results;
    };

    return SimpleTable;

  })();

  methodClasses = [SimpleAttributes, ImageAltTags, SimpleTable, CustomSelectors, SubItems];

  module.exports.Attributes = Attributes;

  module.exports.methods = {
    SimpleAttributes: SimpleAttributes,
    ImageAltTags: ImageAltTags,
    SimpleTable: SimpleTable,
    CustomSelectors: CustomSelectors,
    SubItems: SubItems
  };

}).call(this);

});

require.define("/lib/utils.coffee", function (require, module, exports, __dirname, __filename) {
(function() {
  var getText;

  getText = function(element, includeChildren) {
    var child, text, _i, _len, _ref;
    if (includeChildren == null) includeChildren = 0;
    text = '';
    if (includeChildren >= 0) {
      text = '';
      _ref = element.childNodes;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        child = _ref[_i];
        text += child.attributes ? getText(child, --includeChildren) : child.textContent;
      }
    }
    return text;
  };

  module.exports.getText = getText;

}).call(this);

});

require.define("/magic.coffee", function (require, module, exports, __dirname, __filename) {
(function() {
  var Magic, attributes, cleanUp, magic;
  var __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

  attributes = require('./lib/attributes').Attributes;

  magic = require('./magic');

  Magic = (function() {

    function Magic(w) {
      this.w = w != null ? w : this;
      this.checkEnvironment = __bind(this.checkEnvironment, this);
      this.checkEnvironment();
      this.attributes = new attributes(this.w);
    }

    Magic.prototype.checkEnvironment = function() {
      if (typeof this.w.jQuery !== 'function') {
        console.error('No jQuery on window object');
        return false;
      } else {
        console.log("Using jQuery " + this.w.jQuery.fn.jquery);
        return true;
      }
    };

    return Magic;

  })();

  module.exports = Magic;

  cleanUp = function(magicResult, subItem) {
    var attr, data, item, itemAttribute, resultList, subItemResult, _i, _j, _k, _len, _len2, _len3;
    if (subItem == null) subItem = false;
    data = {};
    if (subItem) {
      resultList = [];
      for (_i = 0, _len = magicResult.length; _i < _len; _i++) {
        item = magicResult[_i];
        subItemResult = {};
        for (_j = 0, _len2 = item.length; _j < _len2; _j++) {
          itemAttribute = item[_j];
          subItemResult[itemAttribute.key] = itemAttribute.value;
        }
        resultList.push(subItemResult);
      }
      return resultList;
    }
    for (_k = 0, _len3 = magicResult.length; _k < _len3; _k++) {
      attr = magicResult[_k];
      if (Array.isArray(attr.value)) {
        data[attr.key] = cleanUp(attr.value, true);
      } else {
        data[attr.key] = attr.value;
      }
    }
    return data;
  };

  module.exports.cleanUp = cleanUp;

}).call(this);

});

require.define("/magic.coffee", function (require, module, exports, __dirname, __filename) {
    (function() {
  var Magic, attributes, cleanUp, magic;
  var __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

  attributes = require('./lib/attributes').Attributes;

  magic = require('./magic');

  Magic = (function() {

    function Magic(w) {
      this.w = w != null ? w : this;
      this.checkEnvironment = __bind(this.checkEnvironment, this);
      this.checkEnvironment();
      this.attributes = new attributes(this.w);
    }

    Magic.prototype.checkEnvironment = function() {
      if (typeof this.w.jQuery !== 'function') {
        console.error('No jQuery on window object');
        return false;
      } else {
        console.log("Using jQuery " + this.w.jQuery.fn.jquery);
        return true;
      }
    };

    return Magic;

  })();

  module.exports = Magic;

  cleanUp = function(magicResult, subItem) {
    var attr, data, item, itemAttribute, resultList, subItemResult, _i, _j, _k, _len, _len2, _len3;
    if (subItem == null) subItem = false;
    data = {};
    if (subItem) {
      resultList = [];
      for (_i = 0, _len = magicResult.length; _i < _len; _i++) {
        item = magicResult[_i];
        subItemResult = {};
        for (_j = 0, _len2 = item.length; _j < _len2; _j++) {
          itemAttribute = item[_j];
          subItemResult[itemAttribute.key] = itemAttribute.value;
        }
        resultList.push(subItemResult);
      }
      return resultList;
    }
    for (_k = 0, _len3 = magicResult.length; _k < _len3; _k++) {
      attr = magicResult[_k];
      if (Array.isArray(attr.value)) {
        data[attr.key] = cleanUp(attr.value, true);
      } else {
        data[attr.key] = attr.value;
      }
    }
    return data;
  };

  module.exports.cleanUp = cleanUp;

}).call(this);

});
require("/magic.coffee");
