// Shared runtime for study notes, loaded as a classic (blocking) script in the
// <head> of every note page so the notes' inline scripts can use it directly.
//
//   const c = StudyNote.reader(el);      // c("--sn-accent") -> "#0891b2"
//   StudyNote.onThemeChange(() => { COL = readCols(); redraw(); });
//
// The site's theme toggle flips `dark-theme` on <body>; the --sn-* tokens are
// redefined under `.dark-theme .study-note`, so JS-drawn SVG/canvas must re-read
// them and redraw. One MutationObserver serves every listener on the page.
(function () {
  var listeners = [];
  var observing = false;

  function observe() {
    if (observing || !document.body) return;
    observing = true;
    new MutationObserver(function () {
      for (var i = 0; i < listeners.length; i++) listeners[i]();
    }).observe(document.body, { attributes: true, attributeFilter: ['class'] });
  }

  window.StudyNote = {
    /** Returns name -> trimmed computed value of a CSS custom property on `el`
     *  (default: the first .study-note). Reads styles once per call. */
    reader: function (el) {
      var cs = getComputedStyle(el || document.querySelector('.study-note'));
      return function (name) { return cs.getPropertyValue(name).trim(); };
    },
    /** Calls `fn` whenever the site theme toggles. Returns `fn`. */
    onThemeChange: function (fn) {
      listeners.push(fn);
      observe();
      return fn;
    },
  };

  if (!document.body) document.addEventListener('DOMContentLoaded', observe);
})();
