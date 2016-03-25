/*jshint esversion: 6*/
/*eslint-env es6*/
(document => {
  'use strict';
  const createSettings = options => {
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

  const serialize = (url, data) => {
    const stringify = data => '?' + Object.keys(data).map(value => encodeURIComponent(value) + '=' + encodeURIComponent(data[value])).join('&');

    return data ? url + stringify(data) : url;
  };

  let blockPopstateEvent = document.readyState !== 'complete';

  function callback(fn, params) {
    if (fn === null) return;

    try {
      fn(params);
    } catch (error) {
      console.error(error);
    }
  }

  function load(url, settings) {
    const container = document.querySelector(settings.container);
    const parameters = {
      url: serialize(url, settings.ajaxData),
      container: container
    };
    const request = new Request(serialize(url, settings.ajaxData), {
      method: 'GET',
      headers: {
        'X-Requested-With': 'BAWXMLHttpRequest'
      }
    });

    callback(settings.beforeLoading, parameters);

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

          callback(settings.afterLoading, parameters);
        })
        .catch(error => {
          callback(settings.onError, error);
        });
    }, settings.waitBeforeLoading);
  }

  function setListeners(settings) {
    const wrapper = document.querySelector(settings.wrapper);
    const anchors = [].slice.call(wrapper.querySelectorAll(settings.anchors));
    const listenClick = (anchor, settings) => {
      anchor.addEventListener('click', e => {
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

    window.onpopstate = e => {
      const onLoad = blockPopstateEvent && document.readyState === 'complete';

      if (!onLoad && url.search('#') === -1) {
        load(window.location.href, settings);
      }
    };
  }

  document.ajaxLoader = options => {
    const settings = createSettings(options);

    if (settings.ajaxUrl) {
      load(settings.ajaxUrl, settings);
      return;
    }

    if (window.history && window.history.pushState) {
      setListeners(settings);
    } else {
      console.error('History is not supported by this browser.');
    }
  };

})(document);
