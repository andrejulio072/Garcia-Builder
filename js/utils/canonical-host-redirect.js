(function () {
  var canonicalHost = 'www.garciabuilder.fitness';
  var legacyHosts = {
    'garciabuilder.fitness': true,
    'garciabuilder.uk': true,
    'www.garciabuilder.uk': true
  };

  if (!legacyHosts[window.location.hostname]) {
    return;
  }

  var target = 'https://' + canonicalHost +
    window.location.pathname +
    window.location.search +
    window.location.hash;

  window.location.replace(target);
})();
