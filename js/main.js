/* MODEL */
var Model = {
  locations: [
    {id: 0, title: 'Montazah palace', location: {lat: 31.288495, lng: 30.015969}, marker: {}},
    {id: 1, title: 'Tea Island', location: {lat: 31.291699, lng: 30.021193}, marker: {}},
    {id: 2, title: 'Montazah Garden', location: {lat: 31.284511, lng: 30.015700}, marker: {}},
    {id: 3, title: 'Al Maamora Beach', location: {lat: 31.286766, lng: 30.029004}, marker: {}},
    {id: 4, title: 'Kouta Park', location: {lat: 31.284694, lng: 30.034025}, marker: {}},
  ],

currentMarker: 0
};
//Global Variables
var infoWin;
var map;
/* VIEW MODEL */
var initiale = function() {
  ko.applyBindings(new ViewModel());
};

var ViewModel = function() {
  self = this;
  //Create the map
  map = new google.maps.Map(document.getElementById('map'), {
    center: {lat: 31.281962, lng: 30.012696},
    zoom: 13
  });

  //bounds object
  var bounds = new google.maps.LatLngBounds();
  //info window object
  infoWin = new google.maps.InfoWindow();

  //markers array
  for (var i = 0; i < Model.locations.length; i++) {
    var position = Model.locations[i].location;
    var title = Model.locations[i].title;

    //Create marker
    var marker = new google.maps.Marker({
      map: map,
      position: position,
      title: title,
      animation: google.maps.Animation.DROP,
      id: i
    });
    Model.locations[i].marker = marker;

    //clicks on the marker
    google.maps.event.addListener(marker, 'click', (function(marker, i) {
      return function() {
        //Create info window
        infoWin.setContent(Model.locations[i].title);
        infoWin.open(map, marker);
        //animate marker
        self.animateMarker(marker);};
    })(marker, i));

    //extend the map to specific marker 
    bounds.extend(Model.locations[i].marker.position);
  }
  //extens the map to show all markers
  map.fitBounds(bounds);
/////////
  this.inputFilter = ko.observable('');

  //filter side locations list on user input
  self.filtered = ko.computed(function() {
    //get entered location 
    var filter = self.inputFilter().toLowerCase();

    var filteredMarker = false;
    this.filteredLocations = ko.utils.arrayFilter(Model.locations, function(loc) {
      var locTitle = loc.title.toLowerCase();
      if (filter.length > locTitle.length || !filter)
        filteredMarker = false;
      //if match
      filteredMarker = locTitle.substring(0, filter.length) === filter;
      loc.marker.setVisible(filteredMarker);
      // Showing the InfoWindow
      filteredMarker ? infoWin.setContent(loc.title) : infoWin.close();

      return filteredMarker;
    });
    return this.filteredLocations;
  });

  this.showInfow = function(selected) {
    //Animate the marker when click in aside
    self.animateMarker(selected.marker);

    infoWin.setContent(selected.title);
    infoWin.open(map, selected.marker);
  };

  //Animate the marker
  this.animateMarker = function(marker) {
    if (marker.getAnimation()) {
      marker.setAnimation(null);
    } else {
      marker.setAnimation(google.maps.Animation.BOUNCE);
      setTimeout(function() {
        marker.setAnimation(null);
      }, 1400);
    }
  };


  //Error
  document.getElementById('map').addEventListener('error', err);

  //toggleAside
  $('#hamburger-button').click( function() {
    $('aside').toggle();
});
};
function err() {
      alert("Error");
      }
