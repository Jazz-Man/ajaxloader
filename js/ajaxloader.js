/*jshint esversion: 6*/
/*eslint-env es6*/
(document => {
  'use strict';
  const createSettings = options => {
    let settings = {
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

    for (let option in options) settings[option] = options[option];

    return settings;
  };

  const serialize = (url, data) => {
    const stringify = data => '?' + Object.keys(data).map(value => encodeURIComponent(value) + '=' + encodeURIComponent(data[value])).join('&');

    return data ? url + stringify(data) : url;
  };

  let blockPopstateEvent = document.readyState !== 'complete';

  function callback(fn, parameters, after) {
    let prom = null;

    if (fn === null && after) after();

    if (fn === null) return;

    try {
      prom = fn(parameters);
    } catch (error) {
      console.error(error);
    } finally {
      if (prom && typeof prom.then === 'function') {
        prom
          .then(() => after())
          .catch(error => console.error(error));
      } else if (after) {
        after();
      }
    }
  }

  function load(url, settings) {
    const serialized = serialize(url, settings.ajaxData);
    const container = document.querySelector(settings.container);
    const request = new Request(serialized, {
      method: 'GET',
      headers: {
        'X-Requested-With': 'BAWXMLHttpRequest'
      }
    });

    callback(settings.beforeLoading, container, () => {
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

            callback(settings.afterLoading, container);
          })
          .catch(error => callback(settings.onError, {
            container: container,
            error: error
          }));
      }, settings.waitBeforeLoading);
    });
  }

  function setListeners(settings) {
    const wrapper = document.querySelector(settings.wrapper);
    const anchors = [].slice.call(wrapper.querySelectorAll(settings.anchors));

    anchors.map(anchor => {
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
    });

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
      console.error('AjaxLoader: History is not supported by this browser.');
    }
  };

})(document);
