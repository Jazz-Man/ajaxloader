/*jshint esversion: 6*/
/*eslint-env es6*/
(document => {
  'use strict';
  const createSettings = (options) => {
    const defaults = {
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

    let settings = defaults;

    for (let option in options) settings[option] = options[option];

    return settings;
  };

  const serialize = (url, obj) => {
    const stringify = (obj) => '?' + Object.keys(obj).map(value => encodeURIComponent(value) + '=' + encodeURIComponent(obj[value])).join('&');

    return obj ? url + stringify(obj) : url;
  };

  let blockPopstateEvent = document.readyState !== 'complete';

  function callback(fn, params) {
    if (fn === null) return;

    try {
      fn(params);
    } catch (error) {
      console.error('AjaxLoader: Provided callback is not a function.');
    }
  }

  function load(url, settings) {
    const container = document.querySelector(settings.container);
    const request = new Request(url, {
      method: 'GET',
      headers: {
        'X-Requested-With': 'BAWXMLHttpRequest'
      }
    });

    callback(settings.beforeLoading, {
      url: url,
      container: container
    });

    setTimeout(() => {
      fetch(request)
        .then(response => response.text())
        .then(content => {

          if (settings.replaceContent) {
            container.innerHTML = content;
            setListeners(settings);
          } else {
            container.innerHTML += content;
            setListeners(createSettings(settings.options));
          }

          callback(settings.afterLoading, {
            url: url,
            container: container,
            response: content
          });
        })
        .catch(error => {
          callback(settings.onError, error);
        });
    }, settings.waitBeforeLoading);
  }

  function setListeners(settings) {
    const wrapper = document.querySelector(settings.wrapper),
      anchors = [].slice.call(wrapper.querySelectorAll(settings.anchors)),
      listenClick = (anchor, settings) => {
        anchor.addEventListener('click', (e) => {
          const url = anchor.getAttribute('href');

          if (e.which === 2 || e.metaKey) {
            return true;
          } else if (url !== window.location.href) {
            window.history.pushState(null, settings.siteName, url);

            load(url, settings);
          }
          e.preventDefault();
        });
      };

    if (anchors.length > 1) {
      anchors.forEach(anchor => listenClick(anchor, settings));
    } else {
      listenClick(anchors[0], settings);
    }

    window.onload = () => {
      setTimeout(() => {
        blockPopstateEvent = false;
      }, 0);
    };

    window.onpopstate = (e) => {
      const onLoad = blockPopstateEvent && document.readyState === 'complete';

      if (!onLoad && url.search('#') === -1) {
        load(window.location.href, settings);
      }
    };
  }

  document.ajaxLoader = (options) => {
    const settings = createSettings(options);
    let url;

    if (settings.ajaxUrl) {
      url = serialize(settings.ajaxUrl, settings.ajaxData);
      load(url, settings);
      return;
    }

    if (window.history && window.history.pushState) {
      setListeners(settings);
    } else {
      console.error('History is not supported by this browser.');
    }
  };

})(document);
