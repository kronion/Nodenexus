(function (window, document) {

  /*-----------*/
  /* Variables */
  /*-----------*/
  /* DOM elements */
  var layout   = document.getElementById('layout'),
      menu     = document.getElementById('menu'),
      menuLink = document.getElementById('menu-link'),
      lightbox = document.getElementById('lightbox'),
      content  = document.getElementById('content'),
      body     = document.body;
  var transElements = [ layout, menu, menuLink, lightbox ];

  /* Size, in pixels, of the largest tablet screen */
  var menuCutoff = 767;

  /* Toggle preventing multiple menu animations at a time */
  var locked = false;

  /* Toggle for whether or not menu is visible */
  var menuVisible = false;

  /*-----------*/
  /* Functions */
  /*-----------*/
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
      menuVisible = true;

      // Separate timeouts because of Firefox bug where opacity doesn't
      // transition when display is also changed
      setTimeout(function() {
        lightbox.style.opacity = '0.15';
        lightbox.style.left = '270px';
      }, 50);
    }
    // If layout was already active, hide menu and remove blur
    else {
      menuVisible = false;
      lightbox.style.opacity = '0';
      lightbox.style.left = '0px';
      setTimeout(function() {
        lightbox.style.display = 'none';
      }, 500);
    }

    layout.className = classes.join(' ');
  }

  /* Add or remove menu links from tab order */
  function tabOrderToggle() {
    var menuTabIndex = -1;
    var contentTabIndex = 0;
    if (body.clientWidth > menuCutoff || menuVisible) {
      menuTabIndex = 0;
    }
    if (body.clientWidth < menuCutoff && menuVisible) {
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

  /* Menu animation */
  menuLink.onclick = function () {
    console.log('clicked');
    if (body.clientWidth <= menuCutoff) {
      if (!locked) {
        locked = true;
        toggleActive();
        tabOrderToggle();
        setTimeout(function() {
          locked = false;
        }, 500);
      }
    }
  };
  lightbox.onclick = menuLink.onclick;

  /* Remove active state from layout if screen resizes */
  window.onresize = function() {
    if (body.clientWidth > menuCutoff) {
      menuPan.set({ enable: false });
      var classes = layout.className.split(/\s+/),
          length = classes.length;

      for(i = 0; i < length; i++) {
        if (classes[i] === 'active') {
          classes.splice(i, 1);
          break;
        }
      }
      layout.className = classes.join(' ');
      menuVisible = false;
      lightbox.style.opacity = '0';
      lightbox.style.left = '0px';
      setTimeout(function() {
        lightbox.style.display = 'none';
      }, 500);
    }
    else {
      menuPan.set({ enable: true });
    }
    tabOrderToggle();
  };

  /* Add CSS transitions to key DOM elements */
  function addTransitions() {
    for (var i = 0; i < transElements.length; i++) {
      transElements[i].style.transition = "all 0.5s ease-out";
    }
  }

  function removeTransitions() {
    for (var i = 0; i < transElements.length; i++) {
      transElements[i].style.transition = "none";
    }
  }

  /* Hammer.js touch handlers */
  delete Hammer.defaults.cssProps.userSelect; /* Allow users to select text */
  var menuPan = new Hammer(menu);
  menuPan.on('panstart', panstart);
  menuPan.on('panmove', panmove);
  menuPan.on('panend', panend);
  var lightboxPan = new Hammer(lightbox);
  lightboxPan.on('panstart', panstart);
  lightboxPan.on('panmove', function(e) {
    lightbox.onclick = null;
    panmove(e);
  });
  lightboxPan.on('panend', function(e) {
    panend(e);
    lightbox.onclick = menuLink.onclick;
  });

  function panstart(e) {
    if (e.pointerType === 'mouse') {
      return;
    }
    removeTransitions();
    lightbox.style.display = 'block';
  }

  /* Fluidly move the menu and layout during pan on non-desktop devices */
  function panmove(e) {
    if (e.pointerType === 'mouse') {
      return;
    }
    var menuWidth = menu.clientWidth - 1; // Due to stupid Chrome overflow fix
    if (!menuVisible) {
      var delta = (e.deltaX > menuWidth) ? menuWidth : e.deltaX;
      delta = (delta < 0) ? 0 : delta;
      layout.style.left = delta + 'px';
      menu.style.left = delta + 'px';
      menuLink.style.left = delta + 'px';
      lightbox.style.left = delta + 'px';
      lightbox.style.opacity = String(0.15 * (delta / menuWidth));
    }
    else if (menuVisible) {
      var delta = (-menuWidth > e.deltaX) ? -menuWidth : e.deltaX;
      delta = (delta > 0) ? 0 : delta;
      layout.style.left = (menuWidth + delta) + 'px';
      menu.style.left = (menuWidth + delta) + 'px';
      menuLink.style.left = (menuWidth + delta) + 'px';
      lightbox.style.left = (menuWidth + delta) + 'px';
      lightbox.style.opacity = String(0.15 * (1 + (delta / menuWidth)));
    }
  }

  /* Perform normal animations upon completion of pan */
  function panend(e) {
    if (e.pointerType === 'mouse') {
      return;
    }
    addTransitions();
    layout.style.left = null;
    menu.style.left = null;
    menuLink.style.left = null;
    lightbox.style.left = null;
    lightbox.style.display = null;
    if (e.deltaX > 135 && !menuVisible) {
      toggleActive();
    }
    else if (e.deltaX < -135 && menuVisible) {
      toggleActive();
    }
  }

  tabOrderToggle(); /* Is this in the right place?? */

  /* Add transitions for menu to push in and out, but wait for page to draw */
  document.addEventListener('DOMContentLoaded', function(e) {
    if (body.clientWidth > menuCutoff) {
      menuPan.set({ enable: false });
    }
    setTimeout(function() {
      addTransitions();
    }, 200);
  });

}(this, this.document));
