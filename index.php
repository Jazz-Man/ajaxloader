<html>
<head>
	<style>
		.preload {
			display: block;
			max-width: 100%;
			height: auto;
			background-size: cover;
			backface-visibility: hidden;
			float:left;
			width: 25%;
			height: 250px;
			/*opacity: 0;*/
			transition: opacity 0.5s ease-out;
		}
		.preload.loaded {
			opacity: 1;
		}
	</style>
</head>
<body>
<a href="http://localhost:3000/ajaxloader/?page=<?= (isset($_GET['page']) ? $_GET['page'] + 1 : 1); ?>">go</a>
<button class="load">Load</button>
<!-- <a href="http://localhost:3000/ajaxloader/?page=<?= (isset($_GET['page']) ? $_GET['page'] + 2 : 1); ?>">go + 2</a> -->
<main>
<h2>Page <?= $_GET['page']; ?></h2>
<img src="http://lorempixel.com/1920/1080/" />
</main>

<script src="dist/ajaxloader.js"></script>
<script>
	(function() {
		'use strict';
		var ajaxOptions = {
			    wrapper: 'body', //the scope where to activate the script
			    anchors: 'a:not([target="_blank"]):not([href="#"])',
			    container: 'main', //where to load the new content
			    siteName: 'Your Site Name',
			    beforeLoading: (url, container) => {
			        //Scripts executed before the ajax request
			        console.log('before');
			    },
			    afterLoading: (url, container) => {
			        //Scripts executed after the ajax request
			        console.log('after');
			    },
			    error: (error) => {
			        console.log(error);
			    }
			},
			button = document.querySelector('.load');

		document.ajaxLoader(ajaxOptions);

		button.addEventListener('click', () => {
			document.ajaxLoader({
			    container: 'main', //where to load the new content
			    replaceContent: false,
			    ajaxUrl: 'http://localhost:3000/ajaxloader/',
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
			        container.innerHTML = 'load content' + data ;
			    }
			});
		});
	})();
</script>
</body>
</html>