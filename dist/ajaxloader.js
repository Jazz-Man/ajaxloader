'use strict';

(function (document) {
  'use strict';

  var createSettings = function createSettings(options) {
    var settings = {
      cors: true,
      wrapper: 'html',
      ajaxUrl: null,
      ajaxData: null,
      container: 'html',
      anchors: 'a:not([target="_blank"]):not([href="#"])',
      replaceContent: true,
      waitBeforeLoading: 0,
      beforeLoading: null,
      afterLoading: null,
      onError: null,
      options: null
    };

    for (var option in options) {
      settings[option] = options[option];
    }return settings;
  };

  var serialize = function serialize(url, data) {
    var stringify = function stringify(data) {
      return '?' + Object.keys(data).map(function (value) {
        return encodeURIComponent(value) + '=' + encodeURIComponent(data[value]);
      }).join('&');
    };

    return data ? url + stringify(data) : url;
  };

  var blockPopstateEvent = document.readyState !== 'complete';

  function callback(fn, parameters, after) {
    var prom = null;

    if (fn === null && after) after();

    if (fn === null) return;

    try {
      prom = fn(parameters);
    } catch (error) {
      console.error(error);
    } finally {
      if (prom && typeof prom.then === 'function') {
        prom.then(function () {
          return after();
        }).catch(function (error) {
          return console.error(error);
        });
      } else if (after) {
        after();
      }
    }
  }

  function load(url, settings) {
    var serialized = serialize(url, settings.ajaxData);
    var container = document.querySelector(settings.container);
    var request = new Request(serialized, {
      method: 'GET',
      headers: {
        'X-Requested-With': 'BAWXMLHttpRequest'
      },
      mode: settings.cors ? 'cors' : 'no-cors'
    });

    callback(settings.beforeLoading, container, function () {
      setTimeout(function () {
        fetch(request).then(function (response) {
          return response.text();
        }).then(function (content) {

          if (settings.replaceContent) {
            container.innerHTML = content;
            setListeners(settings);
          } else {
            container.innerHTML += content;
            setListeners(createSettings(settings.options));
          }

          callback(settings.afterLoading, container);
        }).catch(function (error) {
          return callback(settings.onError, {
            container: container,
            error: error
          });
        });
      }, settings.waitBeforeLoading);
    });
  }

  function setListeners(settings) {
    var wrapper = document.querySelector(settings.wrapper);
    var anchors = [].slice.call(wrapper.querySelectorAll(settings.anchors));

    anchors.map(function (anchor) {
      anchor.addEventListener('click', function (e) {
        var url = anchor.getAttribute('href');

        if (e.which === 2 || e.metaKey) {
          return true;
        } else if (url !== window.location.href) {
          window.history.pushState(null, settings.siteName, url);

          load(url, settings);
        }
        e.preventDefault();
      });
    });

    window.onload = function () {
      setTimeout(function () {
        blockPopstateEvent = false;
      }, 0);
    };

    window.onpopstate = function (e) {
      var url = window.location.href;
      var onLoad = blockPopstateEvent && document.readyState === 'complete';

      if (!onLoad && url.search('#') === -1) {
        load(url, settings);
      }
    };
  }

  document.ajaxLoader = function (options) {
    var settings = createSettings(options);

    if (settings.ajaxUrl) {
      load(settings.ajaxUrl, settings);
      return;
    }

    if (window.history && window.history.pushState) {
      setListeners(settings);
    } else {
      console.error('AjaxLoader: History is not supported by this browser.');
    }
  };
})(document);