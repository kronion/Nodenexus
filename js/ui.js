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

  /* Indicates that CSS transitions have been enabled for key DOM elements */
  var transitionsActive = false;

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
    transitionsActive = true;
  }

  function removeTransitions() {
    for (var i = 0; i < transElements.length; i++) {
      transElements[i].style.transition = "none";
    }
    transitionsActive = false;
  }

  /* Hammer.js touch handlers */
  delete Hammer.defaults.cssProps.userSelect; /* Allow users to select text */
  var menuPan = new Hammer(menu);
  menuPan.on('panmove', panning);
  menuPan.on('panend', panRelease);
  var lightboxPan = new Hammer(lightbox);
  lightboxPan.on('panmove', function(e) {
    console.log('lightbox moved');
    lightbox.onclick = null;
  });
  // lightboxPan.on('panend', function(e) {
    // lightbox.onclick = menuLink.onclick;
  // });

  function panRelease(e) {
    if (e.pointerType === 'mouse') {
      return;
    }
    if (!transitionsActive) {
      addTransitions();
    }
    layout.style.left = null;
    menu.style.left = null;
    menuLink.style.left = null;
    lightbox.style.left = null;
    if (e.deltaX > 135 && !menuVisible) {
      toggleActive();
    }
    else if (e.deltaX < -135 && menuVisible) {
      toggleActive();
    }
  }

  /* Fluidly move the menu and layout during pan on non-desktop devices */
  function panning(e) {
    if (e.pointerType === 'mouse') {
      return;
    }
    if (transitionsActive) {
      removeTransitions();
    }
    if (!menuVisible) {
      var delta = (e.deltaX > menu.clientWidth) ? menu.clientWidth : e.deltaX;
      delta = (delta < 0) ? 0 : delta;
      layout.style.left = delta + 'px';
      menu.style.left = delta + 'px';
      menuLink.style.left = delta + 'px';
      lightbox.style.left = delta + 'px';
    }
    else if (menuVisible) {
      var delta = (-menu.clientWidth > e.deltaX) ? -menu.clientWidth : e.deltaX;
      delta = (delta > 0) ? 0 : delta;
      layout.style.left = (menu.clientWidth + delta) + 'px';
      menu.style.left = (menu.clientWidth + delta) + 'px';
      menuLink.style.left = (menu.clientWidth + delta) + 'px';
      lightbox.style.left = (menu.clientWidth + delta) + 'px';
    }
  }

  // Do all preconfiguration here!!!
  // What is the device size!
  tabOrderToggle();

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
