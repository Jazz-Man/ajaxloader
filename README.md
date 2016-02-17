# ajaxpageloader
Asynchronous page loading using Javascript History API
## Install
`bower i ajaxloader --save`

## Init
### Page loading
Fetches new content and replaces current one.
``` js
document.ajaxLoader({
    wrapper: 'body', //the scope where to activate the script
    anchors: 'a:not([target="_blank"]):not([href="#"])',
    container: 'main', //where to load the new content
    siteName: 'Your Site Name',
    waitBeforeLoading: 250,
    beforeLoading: function(url, container) {
        //Scripts executed before the ajax request
    },
    afterLoading: function(url, container) {
        //Scripts executed after the ajax request
    }
});
```
### Content loading
Fetches new content and appends to current one
``` js
document.ajaxLoader({
    container: 'main', //where to load the new content
    ajaxUrl: 'http://your-ajax-url.com',
    ajaxData: { //All the data to send to the server
        action: 'your_action',
        offset: 10,
        category: 'category'
    },
    
    beforeLoading: function(url, container) {
        //Scripts executed before the ajax request
    },
    afterLoading: function(url, container, data) {
        //Scripts executed after the ajax request
    }
});
```

### Checking request with PHP (example)
``` php
function is_ajax_request() {
    if( isset( $_SERVER['HTTP_X_REQUESTED_WITH'] ) && $_SERVER['HTTP_X_REQUESTED_WITH'] == 'BAWXMLHttpRequest' ){
        return true;
    }
}
```