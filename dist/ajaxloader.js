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

    function load(url, settings) {
        var container = document.querySelector(settings.container);

        callback(settings.beforeLoading, url, container);

        request(url, settings).then(function (response) {
            console.log('let them have settings');
            console.log(settings);
            if (settings.replaceContent) {
                container.innerHTML = response;
                console.log('replace');
                setListeners(settings);
            } else {
                container.innerHTML += response;
                console.log('append');
                setListeners(mergeObjects(defaults, settings.options));
            }

            callback(settings.afterLoading, url, container, response);
        }).catch(function (error) {
            callback(settings.error, error);
        });
    }

    function setListeners(settings) {
        console.log('settings' + settings);
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
        var settings = mergeObjects(defaults, options),
            url = settings.ajaxUrl ? serialize(settings.ajaxUrl, settings.ajaxData) : false,
            historySupport = window.history && window.history.pushState;

        if (url) {
            load(url, settings);
            return;
        }

        if (historySupport) {
            setListeners(settings);
        } else {
            console.error('History is not supported by this browser.');
        }
    };
})(document);