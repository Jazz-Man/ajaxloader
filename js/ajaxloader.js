/*eslint-env es6*/
'use strict';
(document => {
    const defaults = {
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

    const serialize = (url, obj) => {
        let stringify = (obj) => {
            return '?' + Object.keys(obj).map(value => encodeURIComponent(value) + '=' + encodeURIComponent(obj[value]) ).join('&');
        };

        return obj ? url + stringify(obj) : url;
    };

    const mergeObjects = (defaults, options) => {
        let settings = defaults;

        for (let option in options) {
            settings[option] = options[option];
        }
        return settings;
    };

    const request = (url, settings) => {
        let xhr = new XMLHttpRequest();

        return new Promise ((resolve, reject) => {
            if (!busy) {
                busy = true;

                xhr.open('GET', url, true);
                xhr.setRequestHeader('X-Requested-With', 'BAWXMLHttpRequest');
                xhr.onload = () => {
                    resolve(xhr.responseText);
                    busy = null;
                };
                xhr.onerror = () => {
                    reject(Error('Error:' + xhr.status));
                };
                xhr.send();
            }
        });
    };   

    let busy = null;

    let blockPopstateEvent = document.readyState !== 'complete';

    function callback(fn, param1, param2, param3) {
        if (fn !== false && typeof fn === 'function') {
            fn(param1, param2, param3);
        } else {
            console.error('The provided callback is not a function.');
        }
    }

    function setListeners(settings) {
        let wrapper = document.querySelector(settings.wrapper),
            anchors = [].slice.call(wrapper.querySelectorAll(settings.anchors)),
            listenClick = anchor => {
                anchor.addEventListener('click', (e) => {
                    let url = anchor.getAttribute('href');

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

        if(anchors.length > 1) {
            anchors.forEach(anchor => listenClick(anchor));
        } else {
            listenClick(anchors[0]);
        }

        window.onload = () => {
            setTimeout(() => {
                blockPopstateEvent = false;
            }, 0);
        };

        window.onpopstate = (e) => {
            let url = window.location.href,
                onLoad = blockPopstateEvent && document.readyState === 'complete';

            if (!onLoad && url.search('#') === -1) {
                callback(settings.beforeLoading, url, container);
                load(url, settings);
            }
        };
    }   

    function load(url, settings) {
        let container = document.querySelector(settings.container);

        callback(settings.beforeLoading, url, container);

        request(url, settings).then(response => {
            if(settings.replaceContent) {
                container.innerHTML = response;
                setListeners(settings);
            } else {
                console.log('test');
                setListeners(settings.options);
            }

            callback(settings.afterLoading, url, container, response);
        }).catch(error => {
            callback(settings.error, error);
        });        
    }

    document.ajaxLoader = (options) => {
        let settings = mergeObjects(defaults, options),
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