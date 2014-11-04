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
    if (locked) {
      return;
    }
    locked = true;
    setTimeout(function() {
      locked = false;
    }, 500);
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
      menu.className = 'active';
      menuVisible = true;
      setTimeout(function() {
        body.style.position = 'fixed';
        body.style.overflow = 'hidden';
        lightbox.style.display = 'block';
      }, 10);

      // Separate timeouts because of Firefox bug where opacity doesn't
      // transition when display is also changed
      setTimeout(function() {
        lightbox.style.opacity = '0.15';
      }, 50);
    }
    // If layout was already active, hide menu and remove blur
    else {
      menu.className = '';
      menuVisible = false;
      setTimeout(function() {
        body.style.position = null;
        body.style.overflow = null;
      }, 50);
      lightbox.style.opacity = '0';
      setTimeout(function() {
        lightbox.style.display = 'none';
      }, 500);
    }

    layout.className = classes.join(' ');
    tabOrderToggle();
  }

  /* Add or remove menu links from tab order */
  function tabOrderToggle() {
    var menuTabIndex = -1;
    var contentTabIndex = 0;
    if (body.clientWidth > menuCutoff || menuVisible) {
      menuTabIndex = 0;
    }
    if (body.clientWidth <= menuCutoff && menuVisible) {
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
    menuLink.tabIndex = 0;
  }

  /* Menu animation */
  function menuFlyout() {
    if (body.clientWidth <= menuCutoff) {
      toggleActive();
    }
  }
  menuLink.onclick = menuFlyout;
  lightbox.onclick = menuFlyout;
  menuLink.onkeypress = function(e) {
    if (e.keyCode === 13) {
      menuFlyout();
    }
  };

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
      menuLink.style.opacity = '0';
      setTimeout(function() {
        lightbox.style.display = 'none';
        menuLink.style.display = 'none';
      }, 500);
    }
    else {
      menuPan.set({ enable: true });
      menuLink.style.display = 'block';
      setTimeout(function() {
        menuLink.style.opacity = '1';
      }, 500);
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

  function toggleFilter(blur) {
    var value;
    if (blur === -1) {
      value = null;
    }
    else if (blur === 0) {
      value = 'none';
    }
    else {
      value = 'blur(' + blur + 'px)';
    }
    content.style['filter'] = value;
    content.style['-moz-filter'] = value;
    content.style['-webkit-filter'] = value;
    content.style['-o-filter'] = value;
    content.style['-ms-filter'] = value;
  }

  /* Hammer.js touch handlers */
  delete Hammer.defaults.cssProps.userSelect; /* Allow users to select text */
  var menuPan = new Hammer(menu);
  menuPan.on('panstart', panstart);
  menuPan.on('panmove', panmove);
  menuPan.on('panend', panend);

  function addPanHandlers(hammers) {
    for (var i = 0; i < hammers.length; i++) {
      var element = hammers[i].element;
      hammers[i].on('panstart', function(e) {
        element.onclick = null;
        panstart(e);
      });
      hammers[i].on('panmove', panmove);
      hammers[i].on('panend', function(e) {
        panend(e);
        element.onclick = menuFlyout;
      });
    }
  }
  var lightboxPan = new Hammer(lightbox);
  var menuLinkPan = new Hammer(menuLink);
  addPanHandlers([ lightboxPan, menuLinkPan ]);

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
    var menuWidth = menu.clientWidth;
    if (!menuVisible) {
      var delta = (e.deltaX > menuWidth) ? menuWidth : e.deltaX;
      delta = (delta < 0) ? 0 : delta;
      layout.style.left = delta + 'px';
      menu.style.left = delta + 'px';
      lightbox.style.opacity = String(0.15 * (delta / menuWidth));
      var blur = (delta / menuWidth);
      // toggleFilter(blur); 
    }
    else if (menuVisible) {
      var delta = (-menuWidth > e.deltaX) ? -menuWidth : e.deltaX;
      delta = (delta > 0) ? 0 : delta;
      layout.style.left = (menuWidth + delta) + 'px';
      menu.style.left = (menuWidth + delta) + 'px';
      lightbox.style.opacity = String(0.15 * (1 + (delta / menuWidth)));
      var blur = 1 + (delta / menuWidth);
      // toggleFilter(blur);
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
    toggleFilter(-1);
    if (!menuVisible) {
      if (e.deltaX > 135) {
        toggleActive();
      }
      else {
        lightbox.style.opacity = '0';
        setTimeout(function() {
          lightbox.style.display = 'none';
        }, 500);
      }
    }
    else if (menuVisible) {
      if (e.deltaX < -135) {
        toggleActive();
      }
      else {
        lightbox.style.opacity = '0.15';
      }
    }
  }


  /* Add transitions for menu to push in and out, but wait for page to draw */
  document.addEventListener('DOMContentLoaded', function(e) {
    if (body.clientWidth > menuCutoff) {
      menuPan.set({ enable: false });
    }
    setTimeout(function() {
      addTransitions();
    }, 200);
    tabOrderToggle(); 
  });

}(this, this.document));
