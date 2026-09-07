// Static site scripts (loaded via <script src="/js/site.js" defer>).
// Kept out of the Vite bundle so they can be served as-is under a strict
// script-src CSP. Execution order relative to the island module scripts is
// preserved: deferred classic scripts and module scripts both run after
// parsing, in document order.
(function () {
	var btn = document.querySelector('.site-header-menu-toggle');
	var nav = document.querySelector('.site-header-nav');
	if (!btn || !nav) return;
	btn.addEventListener('click', function () {
		var open = nav.classList.toggle('site-header-nav--open');
		btn.setAttribute('aria-expanded', open);
	});
	nav.addEventListener('click', function (e) {
		if (e.target.closest('a')) {
			nav.classList.remove('site-header-nav--open');
			btn.setAttribute('aria-expanded', 'false');
		}
	});
	document.addEventListener('click', function (e) {
		if (!e.target.closest('.site-header')) {
			nav.classList.remove('site-header-nav--open');
			btn.setAttribute('aria-expanded', 'false');
		}
	});
})();

// Dispatches a CustomEvent('theme-change') on window, consumed by the island
// scripts. Keep this contract intact.
(function () {
	var btn = document.querySelector('.theme-toggle-btn');
	if (!btn) return;
	function setLabel(theme) {
		var alt = theme === 'light' ? 'dark' : 'light';
		btn.setAttribute('aria-label', 'Change to ' + alt + ' mode');
		btn.setAttribute('title', 'Change to ' + alt + ' mode');
	}
	setLabel(document.body.dataset.theme);
	btn.addEventListener('click', function () {
		var next = document.body.dataset.theme === 'dark' ? 'light' : 'dark';
		document.body.dataset.theme = next;
		document.documentElement.classList.toggle('dark', next === 'dark');
		window.localStorage.setItem('theme', next);
		window.dispatchEvent(new CustomEvent('theme-change', { detail: next }));
		setLabel(next);
	});
})();
