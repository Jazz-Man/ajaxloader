/*eslint-env es6*/
'use strict';
(document => {
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
            error: null,
            options: null
        };

        let settings = defaults;

        for (let option in options) {
            settings[option] = options[option];
        }

        return settings;
    };

    const serialize = (url, obj) => {
        let stringify = (obj) => {
            return '?' + Object.keys(obj).map(value => encodeURIComponent(value) + '=' + encodeURIComponent(obj[value]) ).join('&');
        };

        return obj ? url + stringify(obj) : url;
    };

    const query = (url, settings) => {
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

    function callback(fn, parameters) {
        return new Promise ((resolve, reject) => {
            if (fn !== null && typeof fn === 'function') {
                fn(parameters);
                
                resolve(query);
            } else {
                reject(Error('The provided callback is not a function.'));
            }            
        });
    }

    function load(url, settings) {
        let container = document.querySelector(settings.container);

        callback(settings.beforeLoading, {
            url: url,
            container:container
        }).then(request => {
            request(url, settings).then(response => {
                setTimeout(() => {
                    if(settings.replaceContent) {
                        container.innerHTML = response;
                        setListeners(settings);
                    } else {
                        container.innerHTML += response;
                        setListeners(createSettings(settings.options));
                    }
                    
                    callback(settings.afterLoading, {
                        url: url,
                        container:container,
                        response: response
                    }).catch(error => console.log(error));
                }, settings.waitBeforeLoading);
            }).catch(error => {
                callback(settings.error, error);
            });
        }).catch(error => console.log(error));
    }

    function setListeners(settings) {
        let wrapper = document.querySelector(settings.wrapper),
            anchors = [].slice.call(wrapper.querySelectorAll(settings.anchors)),
            listenClick = (anchor, settings) => {
                anchor.addEventListener('click', (e) => {
                    let url = anchor.getAttribute('href');

                    if (e.which === 2 || e.metaKey) {
                        return true;
                    }
                    else if (url !== window.location.href) {
                        window.history.pushState(null, settings.siteName, url);
                        load(url, settings);
                    }
                    e.preventDefault();
                });
            };

        if(anchors.length > 1) {
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
            let url = window.location.href,
                onLoad = blockPopstateEvent && document.readyState === 'complete';

            if (!onLoad && url.search('#') === -1) {
                load(url, settings);
            }
        };
    }

    document.ajaxLoader = (options) => {
        let settings = createSettings(options),
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