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
  var transElements = [ layout, menu, menuLink, lightbox, content ];

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
        body.style.overflow = 'hidden';
      }, 10);
      setTimeout(function() {
        lightbox.style.opacity = '0.15';
        lightbox.style.marginLeft = '270px';
      }, 50);
    }
    // If layout was already active, hide menu and remove blur
    else {
      menuVisible = false;
      lightbox.style.opacity = '0';
      lightbox.style.marginLeft = '0px';
      setTimeout(function() {
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

  /* Simulate menu link button click */
  function swipe_in(intent) {
    if (menuVisible !== intent) {
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
      lightbox.style.marginLeft = '0px';
      setTimeout(function() {
        lightbox.style.display = 'none';
        body.style.overflow = 'visible';
      }, 500);
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

  /* Add transitions for menu to push in and out, but wait for page to draw */
  document.addEventListener('DOMContentLoaded', function(e) {
    setTimeout(function() {
      addTransitions();
    }, 200);
  });

  /* Hammer.js touch handlers */
  var menu_pan = new Hammer(layout);
  // delete Hammer.defaults.cssProps.userSelect; /* Allow users to select text */

  menu_pan.on('panmove', function(e) {

    var deltaX = e.deltaX;
    menu.style.left = deltaX + 'px';
    layout.style.left = deltaX + 'px';
    if (e.direction === Hammer.DIRECTION_LEFT) {
      if (menuVisible) {
      }                
      // swipe_in(false);
    }
    else if (e.direction === Hammer.DIRECTION_RIGHT) {
      if (!menuVisible) {
      }
      // swipe_in(true);
    }
  });
  // menu_pan.off('pan');
  
  menu_pan.on('panend', function(e) {

  });
  
  tabOrderToggle();
}(this, this.document));
