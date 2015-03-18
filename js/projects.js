(function() {
  iFrameResize({ 'heightCalculationMethod': 'lowestElement' });

  var storeButtons = document.getElementsByClassName('webstore');
  if (window.chrome && typeof window.orientation === 'undefined') {
    var detect = function(base, absent, present) {
      var s = document.createElement('link');
      document.head.appendChild(s);
      s.onerror = absent;
      s.onload = present;
      s.rel = 'subresource';
      s.href = 'chrome-extension://' + base + '/PRESENT';
    };
    for (var i = 0; i < storeButtons.length; i++) {
      var btn = storeButtons[i];
      var storeId = btn.dataset.storeid; 
      detect(storeId,
        function(btn) {
          btn.innerHTML = '<div></div>ADD TO CHROME';
          btn.onclick = function() {
            btn.blur();
            btn.classList.add('checking');
            btn.textContent = btn.innerText = 'CHECKING...';
            chrome.webstore.install(
              "https://chrome.google.com/webstore/detail/" + btn.dataset.storeid,
              function() {
                btn.classList.remove('checking');
                btn.classList.add('added');
                btn.tabIndex = "-1";
                btn.onclick = null;
                btn.textContent = btn.innerText = 'ADDED TO CHROME';
              },
              function() {
                btn.classList.remove('checking');
                btn.innerHTML = '<div></div>ADD TO CHROME';
              }
            );
          };
        }.bind(this, btn),
        function(btn) {
          btn.classList.add('added');
          btn.tabIndex = "-1";
          btn.textContent = btn.innerText = 'ADDED TO CHROME';
        }.bind(this, btn)
      );
    }
  }
  else {
    for (var i = 0; i < storeButtons.length; i++) {
      var btn = storeButtons[i];
      btn.textContent = btn.innerText = 'AVAILABLE ON CHROME';
      btn.onclick = function() { window.open('https://www.google.com/chrome/', '_blank'); };
    }
  }
})();
