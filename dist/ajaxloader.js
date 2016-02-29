'use strict';

/*jshint esversion: 6*/
/*eslint-env es6*/
(function (document) {
    'use strict';

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

    var blockPopstateEvent = document.readyState !== 'complete';

    function callback(fn, parameters) {
        if (fn === null) return;

        if (typeof fn === 'function') {
            fn(parameters);
        } else {
            console.error('The provided callback is not a function.');
        }
    }

    function load(url, settings) {
        var container = document.querySelector(settings.container);
        var request = new Request(url, {
            method: 'GET',
            headers: {
                'X-Requested-With': 'BAWXMLHttpRequest'
            }
        });

        callback(settings.beforeLoading, {
            url: url,
            container: container
        });

        fetch(request).then(function (response) {
            return response.text();
        }).then(function (content) {
            setTimeout(function () {
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
            }, settings.waitBeforeLoading);
        }).catch(function (error) {
            return callback(settings.error, error);
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
            var onLoad = blockPopstateEvent && document.readyState === 'complete';

            if (!onLoad && url.search('#') === -1) {
                load(window.location.href, settings);
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