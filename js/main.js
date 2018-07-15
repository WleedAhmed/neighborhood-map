/* MODEL */
var Model = {
  locations: [
  {
    id: 0,
    title: 'Bibliotheca Alexandrina',
    location:
    {
      lat: 31.208870,
      lng: 29.909201
    },
    marker:
    {}
  },
  {
    id: 1,
    title: 'Alexandria National Museum',
    location:
    {
      lat: 31.200955,
      lng: 29.913258
    },
    marker:
    {}
  },
  {
    id: 2,
    title: 'Citadel of Qaitbay',
    location:
    {
      lat: 31.214011,
      lng: 29.885638
    },
    marker:
    {}
  },
  {
    id: 3,
    title: 'Collège Saint-Marc',
    location:
    {
      lat: 31.210721,
      lng: 29.917825
    },
    marker:
    {}
  },
  {
    id: 4,
    title: 'Alexandria Sporting Club',
    location:
    {
      lat: 31.212770,
      lng: 29.933373
    },
    marker:
    {}
  }, ],
  currentMarker: 0
};
//Global Variables
var infoWin;
var map;
/* VIEW MODEL */
var initiale = function()
{
  ko.applyBindings(new ViewModel());
};
var ViewModel = function()
{
  self = this;
  //Create the map
  map = new google.maps.Map(document.getElementById('map'),
  {
    center:
    {
      lat: 31.214011,
      lng: 29.885638
    },
    zoom: 13
  });
  //bounds object
  var bounds = new google.maps.LatLngBounds();
  //info window object
  infoWin = new google.maps.InfoWindow();
  //markers array
  for (var i = 0; i < Model.locations.length; i++)
  {
    var position = Model.locations[i].location;
    var title = Model.locations[i].title;
    //Create marker
    var marker = new google.maps.Marker(
    {
      map: map,
      position: position,
      title: title,
      animation: google.maps.Animation.DROP,
      id: i
    });
    Model.locations[i].marker = marker;
    //clicks on the marker
    google.maps.event.addListener(marker, 'click', (function(marker, i)
    {
      return function()
      {
        //Create info window
        infoWin.setContent(Model.locations[i].title);
        infoWin.open(map, marker);
        //animate marker
        self.animateMarker(marker);
        /////////**************///////////////////////
        //Get Wikipedia info about current location
        Model.currentMarker = i;
        self.wikiInfo(Model.currentMarker);
        //////////*********//////
      };
    })(marker, i));
    //extend the map to specific marker 
    bounds.extend(Model.locations[i].marker.position);
  }
  //extens the map to show all markers
  map.fitBounds(bounds);
  /////////
  this.inputFilter = ko.observable('');
  ///////***********//////////
  this.wikiSyn = ko.observable('');
  this.wikiLinks = ko.observableArray([]);
  this.wikiTitle = ko.observable('');
  this.wikiInfo = function(i)
  {
    var wikiURL = 'https://en.wikipedia.org/w/api.php?action=opensearch&search=' + Model.locations[i].title + '&format=json&callback=wikiCallback';
    $.ajax(
      {
        url: wikiURL,
        dataType: 'jsonp',
        success: function(response)
        {
          return new parseAjax(response);
        }
      })
      //if AJAX didn't work well
      .fail(function()
      {
        return parseAjax("failed");
      });
  };
  //displaying the Wikipedia info
  var parseAjax = function(response)
  {
    //Hide old Wikiinfo.
    $('#wikipedia').hide();
    //if AJAX has response
    if (response === "failed")
    {
      // If it failed, display an error message
      self.wikiTitle("Error");
      self.wikiSyn("Sorry, Cannot load data! :( ");
      // If AJAX success
    }
    else
    {
      self.wikiTitle(response[0]);
      self.wikiSyn(response[2].length > 0 ? response[2] : 'No Description!');
      self.wikiLinks([]);
      response[1].forEach(function(link)
      {
        self.wikiLinks.push(
        {
          'link': link,
          'url': 'https://en.wikipedia.org/wiki/' + link
        });
      });
    }
    $('#wikipedia').show();
  };
  ////////**********///////////
  //filter side locations list on user input
  self.filtered = ko.computed(function()
  {
    //get entered location 
    var filter = self.inputFilter().toLowerCase();
    var filteredMarker = false;
    this.filteredLocations = ko.utils.arrayFilter(Model.locations, function(loc)
    {
      var locTitle = loc.title.toLowerCase();
      if (filter.length > locTitle.length || !filter) filteredMarker = false;
      //if match
      filteredMarker = locTitle.substring(0, filter.length) === filter;
      loc.marker.setVisible(filteredMarker);
      // Showing the InfoWindow
      filteredMarker ? infoWin.setContent(loc.title) : infoWin.close();
      return filteredMarker;
    });
    return this.filteredLocations;
  });
  this.linkWiki = function(selected)
  {
    //link aside with wiki
    Model.currentMarker = selected.id;
    self.wikiInfo(Model.currentMarker);
    //Animate the marker when click in aside
    self.animateMarker(selected.marker);
    infoWin.setContent(selected.title);
    infoWin.open(map, selected.marker);
  };
  //Animate the marker
  this.animateMarker = function(marker)
  {
    if (marker.getAnimation())
    {
      marker.setAnimation(null);
    }
    else
    {
      marker.setAnimation(google.maps.Animation.BOUNCE);
      setTimeout(function()
      {
        marker.setAnimation(null);
      }, 1400);
    }
  };
  //Error
  document.getElementById('map').addEventListener('error', err);
  //toggleAside
  $('#hamburger-button').click(function()
  {
    $('aside').toggle();
  });
};

function err()
{
  alert("Error");
}
///////////