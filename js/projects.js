(function() {
  iFrameResize({ 'heightCalculationMethod': 'lowestElement' });
  var storeButtons = document.getElementsByClassName('webstore');
  for (var i = 0; i < storeButtons.length; i++) {
    storeButtons[i].onclick = function() { 
      var self = this;
      chrome.webstore.install(
        "https://chrome.google.com/webstore/detail/aafbnclakfldlfneckdnnaojkeepdpcg",
        function() {
          self.classList.add('added');
          self.innerText = 'ADDED TO CHROME';
        },
        function() {
          self.innerHTML = '<div></div>ADD TO CHROME';
        }
      );
      self.innerText = 'CHECKING...';
    }
  }
})();
