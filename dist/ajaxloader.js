/*eslint-env es6*/
'use strict';

(function (document) {
    var createSettings = function createSettings(options) {
        var defaults = {
            wrapper: 'html',
            ajaxUrl: null,
            ajaxData: null,
            container: 'html',
            anchors: 'a:not([target="_blank"]):not([href="#"])',
            replaceContent: true,
            waitBeforeLoading: 0,
            beforeLoading: null,
            afterLoading: null,
            error: null,
            options: null
        };

        var settings = defaults;

        for (var option in options) {
            settings[option] = options[option];
        }

        return settings;
    };

    var serialize = function serialize(url, obj) {
        var stringify = function stringify(obj) {
            return '?' + Object.keys(obj).map(function (value) {
                return encodeURIComponent(value) + '=' + encodeURIComponent(obj[value]);
            }).join('&');
        };

        return obj ? url + stringify(obj) : url;
    };

    var query = function query(url, settings) {
        var xhr = new XMLHttpRequest();

        return new Promise(function (resolve, reject) {
            if (!busy) {
                busy = true;

                xhr.open('GET', url, true);
                xhr.setRequestHeader('X-Requested-With', 'BAWXMLHttpRequest');
                xhr.onload = function () {
                    resolve(xhr.responseText);
                    busy = null;
                };
                xhr.onerror = function () {
                    reject(Error('Error:' + xhr.status));
                };
                xhr.send();
            }
        });
    };

    var busy = null;

    var blockPopstateEvent = document.readyState !== 'complete';

    function callback(fn, parameters) {
        if (fn !== null && typeof fn === 'function') {
            fn(parameters);
        } else {
            console.error('The provided callback is not a function.');
        }
    }

    function load(url, settings) {
        var container = document.querySelector(settings.container);

        callback(settings.beforeLoading, {
            url: url,
            container: container
        });

        query(url, settings).then(function (response) {
            setTimeout(function () {
                if (settings.replaceContent) {
                    container.innerHTML = response;
                    setListeners(settings);
                } else {
                    container.innerHTML += response;
                    setListeners(createSettings(settings.options));
                }

                callback(settings.afterLoading, {
                    url: url,
                    container: container,
                    response: response
                });
            }, settings.waitBeforeLoading);
        }).catch(function (error) {
            callback(settings.error, error);
        });
    }

    function setListeners(settings) {
        var wrapper = document.querySelector(settings.wrapper),
            anchors = [].slice.call(wrapper.querySelectorAll(settings.anchors)),
            listenClick = function listenClick(anchor, settings) {
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
        };

        if (anchors.length > 1) {
            anchors.forEach(function (anchor) {
                return listenClick(anchor, settings);
            });
        } else {
            listenClick(anchors[0], settings);
        }

        window.onload = function () {
            setTimeout(function () {
                blockPopstateEvent = false;
            }, 0);
        };

        window.onpopstate = function (e) {
            var url = window.location.href,
                onLoad = blockPopstateEvent && document.readyState === 'complete';

            if (!onLoad && url.search('#') === -1) {
                load(url, settings);
            }
        };
    }

    document.ajaxLoader = function (options) {
        var settings = createSettings(options),
            url = settings.ajaxUrl ? serialize(settings.ajaxUrl, settings.ajaxData) : false;

        if (url) {
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