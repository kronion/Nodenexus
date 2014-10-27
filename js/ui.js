(function (window, document) {

  /* Variables */
  /* DOM elements */
  var layout   = document.getElementById('layout'),
      menu     = document.getElementById('menu'),
      menuLink = document.getElementById('menu-link'),
      lightbox = document.getElementById('lightbox'),
      content  = document.getElementById('content'),
      body     = document.body;

  /* Size, in pixels, of the largest tablet screen */
  var menuCutoff = 767;

  /* Toggle preventing multiple menu animations at a time */
  var locked = false;

  /* Toggle for whether or not menu is visible */
  var swiped_in = false;

  /* Functions */
  /* Add CSS transitions to DOM element */
  function addTransition(e) {
    var rule = "all 0.5s ease-out";
    e.style['transition'] = rule;
    e.style['-ms-transition'] = rule;
    e.style['-o-transition'] = rule;
    e.style['-webkit-transition'] = rule;
  }

  /* Add or remove 'active' class from #layout */
  function toggleActive() {
    var classes = layout.className.split(/\s+/),
        length = classes.length;

    for(i = 0; i < length; i++) {
      if (classes[i] === 'active') {
        classes.splice(i, 1);
        break;
      }
    }

    // If layout was not already active, reveal menu and blur content
    if (length === classes.length) {
      classes.push('active');
      lightbox.style.display = 'block';
      swiped_in = true;

      // Separate timeouts because of Firefox bug where opacity doesn't
      // transition when display is also changed
      setTimeout(function () {
        body.style.overflow = 'hidden';
      }, 10);
      setTimeout(function () {
        lightbox.style.opacity = '0.15';
        lightbox.style.marginLeft = '270px';
      }, 50);
    }
    // If layout was already active, hide menu and remove blur
    else {
      swiped_in = false;
      lightbox.style.opacity = '0';
      lightbox.style.marginLeft = '0px';
      setTimeout(function () {
        body.style.overflow = 'visible';
        lightbox.style.display = 'none';
      }, 500);
    }

    layout.className = classes.join(' ');
  }

  /* Add or remove menu links from tab order */
  function tabOrderToggle() {
    var menuTabIndex = -1;
    var contentTabIndex = 0;
    if (body.clientWidth > menuCutoff || swiped_in) {
      menuTabIndex = 0;
    }
    if (body.clientWidth < menuCutoff && swiped_in) {
      contentTabIndex = -1;
    }
    var menuLinks = document.querySelectorAll('#menu a');
    var contentLinks = document.querySelectorAll('#content a');
    for (var i = 0; i < menuLinks.length; i++) {
      menuLinks[i].tabIndex = menuTabIndex;
    }
    for (var i = 0; i < contentLinks.length; i++) {
      contentLinks[i].tabIndex = contentTabIndex;
    }
  }

  /* Simulate menu link button click */
  function swipe_in(intent) {
    if (swiped_in !== intent) {
      menuLink.onclick();
    }
  }

  /* Menu animation */
  menuLink.onclick = function () {
    if (body.clientWidth <= menuCutoff) {
      if (!locked) {
        locked = true;
        toggleActive();
        tabOrderToggle();
        setTimeout(function () {
          locked = false;
        }, 500);
      }
    }
  };
  lightbox.onclick = menuLink.onclick;

  /* Remove active state from layout if screen resizes */
  window.onresize = function () {
    if (body.clientWidth > menuCutoff) {
      var classes = layout.className.split(/\s+/),
          length = classes.length;

      for(i = 0; i < length; i++) {
        if (classes[i] === 'active') {
          classes.splice(i, 1);
          break;
        }
      }
      layout.className = classes.join(' ');
      swiped_in = false;
      lightbox.style.opacity = '0';
      setTimeout(function() {
        lightbox.style.display = 'none';
        body.style.overflow = 'visible';
      }, 500);
    }
    tabOrderToggle();
  };

  /* Add transitions for menu to push in and out, but wait for page to draw */
  document.addEventListener('DOMContentLoaded', function(e) {
    setTimeout(function() {
      addTransition(layout);
      addTransition(menu);
      addTransition(menuLink);
      addTransition(lightbox);
      addTransition(content);
    }, 200);
  });

  /* Hammer.js touch handlers */
  delete Hammer.defaults.cssProps.userSelect; /* Allow users to select text */
  var layout_swipe = new Hammer(layout);
  layout_swipe.on('swipe', function (e) {
    if (e.direction === Hammer.DIRECTION_LEFT) {
      swipe_in(false);
    }
    else if (e.direction === Hammer.DIRECTION_RIGHT) {
      swipe_in(true);
    }
  });

  tabOrderToggle();
}(this, this.document));
