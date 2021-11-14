document.fonts.ready
	.then(() => document.querySelector('#cover'))
	.then((cover) => (cover.style.opacity = 0));
