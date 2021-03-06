/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};

/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {

/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;

/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			exports: {},
/******/ 			id: moduleId,
/******/ 			loaded: false
/******/ 		};

/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);

/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;

/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}


/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;

/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;

/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";

/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ function(module, exports) {

	// vim: set et sw=2 ts=2 sts=2 ff=unix fenc=utf8:
	// Author: Binux<roy@binux.me>
	//         http://binux.me
	// Created on 2015-12-28 11:50:37

	(function(){
	  'use strict';
	  //var Vue = require('vue')
	  //var WebTorrent = require('webtorrent')

	  // https://gist.github.com/599316527/a0d1300630baa4f82aa1
	  var UNITS = ['B', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
	  var STEP = 1024;

	  function format(value, power) {
	    return (value / Math.pow(STEP, power)).toFixed(2) + UNITS[power];
	  }

	  Vue.filter('smart-file-size', {
	    read: function (value) {
	      value = parseFloat(value, 10);
	      for (var i = 0; i < UNITS.length; i++) {
	        if (value < Math.pow(STEP, i)) {
	          if (UNITS[i - 1]) {
	            return format(value, i - 1);
	          }
	          return value + UNITS[i];
	        }
	      }
	      return format(value, i - 1);
	    },
	    write: function (value, oldValue) {
	      var exp = new RegExp('^(\\d+(?:\\.\\d+)?)(' + UNITS.join('|') +')$', 'i');
	      var ret = value.match(exp);
	      if (ret) {
	        var i = UNITS.indexOf(ret[2].toUpperCase());
	        if (i >= 0) {
	          return parseFloat(ret[1], 10) * Math.pow(STEP, i);
	        }
	      }
	      return oldValue;
	    }
	  });

	  // webtorrent client
	  var client = new WebTorrent
	  window.client = client
	  var announce = [
	    "wss://tracker.webtorrent.io",
	    "wss://tracker.btorrent.xyz",
	    "wss://tracker.openwebtorrent.com",
	    "wss://tracker.fastcast.nz"
	  ]

	  // app
	  var App = Vue.extend({
	    data: function() {
	      return {
	        client: client,
	        glob: null
	      }
	    },
	    init: function() {
	      this.$http.get('/config').then(function(response) {
	        this.$set('glob', response.data.glob)
	        announce = response.data.announce
	      })
	    }
	  })

	  // filelist
	  var Filelist = Vue.extend({
	    template: '#filelist-template',
	    data: function() {
	      return {
	        files: [],
	      }
	    },
	    init: function() {
	      this.$http.get('/files').then(function(response) {
	        this.$set('files', response.data.files)
	      })
	    },
	  })

	  // video view
	  var Video = Vue.extend({
	    template: '#video-template',
	    data: function() {
	      return {
	        infohash: null,
	        torrent: null,
	        downloadSpeed: 0, // it's a getter in torrent, which cannot update UI
	        uploadSpeed: 0,
	        timeRemaining: 0/0,
	      }
	    },
	    init: function() {
	      var self = this;
	      var infohash = this.$route.params.infohash
	      this.$set('infohash', infohash)
	      client.add(`${location.origin}/torrent/${infohash}`, {
	        announce: announce,
	      }, (torrent) => {
	        self.$set('torrent', torrent)
	        torrent.files.forEach(function(file) {
	          file.appendTo('#video-view', function(err) {
	            if (err) throw err
	          })
	        })
	        torrent.on('download', function() {
	          self.$set('downloadSpeed', torrent.downloadSpeed)
	          self.$set('timeRemaining', torrent.timeRemaining)
	        })
	        torrent.on('upload', function() {
	          self.$set('uploadSpeed', torrent.uploadSpeed)
	        })
	      })
	    },
	    beforeDestroy: function () {
	      client.torrents.forEach(function(torrent) {
	        torrent.destroy()
	      })
	    }
	  })

	  // router
	  var router = new VueRouter()
	  router.map({
	    '/': {
	      component: Filelist,
	    },
	    '/v/:infohash': {
	      name: 'video',
	      component: Video
	    }
	  })

	  router.start(App, '#app')
	})();


/***/ }
/******/ ]);