/*eslint-env es6*/
'use strict';

(function (document) {
    var defaults = {
        wrapper: 'html',
        ajaxUrl: null,
        ajaxData: null,
        container: 'html',
        anchors: 'a:not([target="_blank"]):not([href="#"])',
        replaceContent: true,
        beforeLoading: null,
        afterLoading: null,
        error: null
    };

    var serialize = function serialize(url, obj) {
        var stringify = function stringify(obj) {
            return '?' + Object.keys(obj).map(function (value) {
                return encodeURIComponent(value) + '=' + encodeURIComponent(obj[value]);
            }).join('&');
        };

        return obj ? url + stringify(obj) : url;
    };

    var mergeObjects = function mergeObjects(defaults, options) {
        var settings = defaults;

        for (var option in options) {
            settings[option] = options[option];
        }
        return settings;
    };

    var request = function request(url, settings) {
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

    function callback(fn, param1, param2, param3) {
        if (fn !== false && typeof fn === 'function') {
            fn(param1, param2, param3);
        } else {
            console.error('The provided callback is not a function.');
        }
    }

    function setListeners(settings) {
        var wrapper = document.querySelector(settings.wrapper),
            anchors = [].slice.call(wrapper.querySelectorAll(settings.anchors)),
            listenClick = function listenClick(anchor) {
            anchor.addEventListener('click', function (e) {
                var url = anchor.getAttribute('href');

                console.log('setting thangs');
                anchor.classList.add('ajax');

                if (url === window.location.href) {
                    return false;
                } else if (e.which === 2 || e.metaKey) {
                    return true;
                } else {
                    window.history.pushState(null, settings.siteName, url);
                    load(url, settings);
                }

                e.preventDefault();
            });
        };

        console.log(anchors);

        if (anchors.length > 1) {
            anchors.forEach(function (anchor) {
                return listenClick(anchor);
            });
        } else {
            listenClick(anchors[0]);
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
                callback(settings.beforeLoading, url, container);
                load(url, settings);
            }
        };
    }

    function load(url, settings) {
        var container = document.querySelector(settings.container);

        callback(settings.beforeLoading, url, container);

        request(url, settings).then(function (response) {
            if (settings.replaceContent) {
                container.innerHTML = response;
                setListeners(settings);
            } else {
                console.log('test');
                setListeners(settings.options);
            }

            callback(settings.afterLoading, url, container, response);
        }).catch(function (error) {
            callback(settings.error, error);
        });
    }

    document.ajaxLoader = function (options) {
        var settings = mergeObjects(defaults, options),
            url = settings.ajaxUrl ? serialize(settings.ajaxUrl, settings.ajaxData) : false,
            historySupport = window.history && window.history.pushState;

        console.log(settings);

        if (url) {
            console.log('url available');
            load(url, settings);
            return;
        }

        console.log('set listeners');

        if (historySupport) {
            setListeners(settings);
        } else {
            console.error('History is not supported by this browser.');
        }
    };
})(document);