var models = [
          {
          	placename: 'Cinepolis:Jagat Mall',
            placeID: "56cc65c8498e8ac698952d8c",
            selecton: false,
            show: true,
            lat:30.882620,
            lng:75.780959
          },
          {
          	placename: 'Piccadly Square',
            placeID: "50a351abe4b0850330656105",
            selecton: false,
            show: true,
            lat:30.723490,
            lng:76.767508
          },
          {
          	placename: 'Wave:City Emporium Mall',
            placeID: "50d43c3ce4b0621a680d3bf6",
            selecton: false,
            show: true,
            lat:30.709367,
            lng:76.801189
          },
          {
          	placename: 'PVR:Centra',
            placeID: "4ccc5d0975dcbfb7d05ba764",
            selecton: false,
            show: true,
            lat:30.707011,
            lng:76.796648
          },
          {
          	placename: 'PVR:Elante',
            placeID: "51c480e1498e73948d26e8be",
            selecton: false,
            show: true,
            lat:30.705012,
            lng:76.802175
          },
          {
          	placename: 'Fun Cinemas:Republic Mall',
            placeID: "",
            selecton: false,
            show: true,
            lat:11.024142,
            lng:77.010727
          },
          {
          	placename: 'DT City Centre',
            placeID: "4b40c527f964a520eaba25e3",
            selecton: false,
            show: true,
            lat:30.715352, 
            lng:76.825329
          },
          {
          	placename: 'Rajhans Cinemas',
            placeID: "58d528a1da54ae3953b2f523",
            selecton: false,
            show: true,
            lat:30.700217,
            lng:76.853221
          },
          {
          	placename: 'Carnival:Paras Mall',
            placeID: "4da43e5463b5a35d20a4211a",
            selecton: false,
            show: true,
            lat:30.660098,
            lng:76.822071
          },
          {
          	placename: 'PVR:North Country Mall',
            placeID: "5207dd7d8bbd2f9376e1dce0",
            selecton: false,
            show: true,
            lat:30.736271,
            lng:76.679103
          },

          
];





var viewModel = function() {

  var self = this;

  self.place_input = ko.observable('');
  self.selected_place = ko.observableArray([]);
 
  self.makeMarkerIcon = function(markerColor) {
      
      var markerImage = new google.maps.MarkerImage(
              'http://chart.googleapis.com/chart?chst=d_map_spin&chld=1.15|0|'+ markerColor +
              '|40|_|%E2%80%A2',
              new google.maps.Size(21, 34),
              new google.maps.Point(0, 0),
              new google.maps.Point(10, 34),
              new google.maps.Size(21,34));
      return markerImage;
  };
      var defaultIcon = self.makeMarkerIcon('0091ff');
      var highlightedIcon = self.makeMarkerIcon('FF0000');

  
  models.forEach(function(counter){

      var marker = new google.maps.Marker({
        placename:counter.placename,
        position: {lat:counter.lat, lng:counter.lng},
        show: ko.observable(counter.show),  
        placeID:counter.placeID,
        selection: ko.observable(counter.selection),
        map: map,
        animation: google.maps.Animation.DROP,
        icon: defaultIcon,
        id: 1
      });

      self.selected_place.push(marker);
      
      marker.addListener('mouseout', function(){
      this.setIcon(defaultIcon);
      });

      marker.addListener('mouseover', function(){
      this.setIcon(highlightedIcon);
      });

      marker.addListener('click', function(){
      self.makeBounce(marker);
      self.populateInfoWindow(this, largeInfowindow);
      self.addApiInfo(marker);
      }); 
  });
      
      var largeInfowindow = new google.maps.InfoWindow();
      
      self.no_places = self.selected_place.length;
      self.current_place = self.selected_place[0];

  self.populateInfoWindow = function(marker, infowindow) {
    
      // Check to make sure the infowindow is not already opened on this marker.
      if (infowindow.marker != marker) {
        // Clear the infowindow content to give the streetview time to load.
        infowindow.setContent();
        infowindow.marker = marker;
        // Make sure the marker property is cleared if the infowindow is closed.
        infowindow.addListener('closeclick', function() {
          if(infowindow.marker != null)
               infowindow.marker.setAnimation(null);
          infowindow.marker = null;
        });

        var streetViewService = new google.maps.StreetViewService();
        var radius = 50;
      
        // In case the status is OK, which means the pano was found, compute the
        // position of the streetview image, then calculate the heading, then get a
        // panorama from that and set the options

        self.getStreetView = function(data, status) {

            if (status == google.maps.StreetViewStatus.OK) {
              
              var nearStreetViewLocation = data.location.latLng;
              var heading = google.maps.geometry.spherical.computeHeading(
              nearStreetViewLocation, marker.position);
              
              infowindow.setContent('<div>' + marker.placename + '</div><div id="pano"></div>');
              
              var panoramaOptions = {
                  position: nearStreetViewLocation,
                  pov: {
                    heading: heading,
                    pitch: 30
                  }
              };
              
              var panorama = new google.maps.StreetViewPanorama(
                document.getElementById('pano'), panoramaOptions);
            } 

            else {
              infowindow.setContent('<div>' + marker.placename + '</div>' +
                '<div>No Street View Found</div>');
            }
          
        };
      
      
        
      }

  };

  self.addApiInfo = function(counter_marker){
      $.ajax({
        url: "https://api.foursquare.com/v2/venues/" + counter_marker.placeID + '?client_id=33RUTCVQOVXUZGPGME4T05JGXH010VRWMGVBKLKKVTZR52GK&client_secret=BIG1WPWORXNTJGB55HJ5XKRZYXVJDITSLJ12KFPMXAEBJILT&v=20170527',
        dataType: "json",
        success: function(data){
          // stores results to display likes and ratings
          var out = data.response.venue;

          // add likes and ratings to marker
          counter_marker.likes = out.hasOwnProperty('likes') ? out.likes.summary: "";
          counter_marker.rating = out.hasOwnProperty('rating') ? out.rating: "";
          infowindow.setContent('<div>' + counter_marker.placename + '</div><p>' +
  			counter_marker.likes + '</p><p>Rating: ' +
  			counter_marker.rating +'</p><div id="pano"></div>');
          	var streetViewService = new google.maps.StreetViewService();
          	var radius = 50;
          	streetViewService.getPanoramaByLocation(counter_marker.position, radius, self.getStreetView);
          infowindow.open(map, counter_marker);
        },
      });
  };

  for(var counter = 0;counter < self.no_places;counter ++){
    (function(counter_marker){
    self.addApiInfo(counter_marker);
     counter_marker.addListener('click', function()
     {
      self.doneMark(counter_marker);
      });
    })(self.selected_place[counter]);
  }

  self.makeBounce = function(counter_marker){
    counter_marker.setAnimation(google.maps.Animation.BOUNCE);
    setTimeout(function(){counter_marker.setAnimation(null);},700);
  };


  self.doneMark = function(location) {

    for (var counter = 0; counter < self.no_places;counter ++) {
      self.selected_place[counter].selection(false);
    }

      location.selection(true);
      self.current_location = location;

      formattedLikes = function() {
        if (self.current_location.likes === "" || self.current_location.likes === undefined) {
          return "no_likes";
        } 
        else {
          return "Location has " + self.current_location.likes;
        }
      };

      formattedRating = function() {
        if (self.current_location.rating === "" || self.current_location.rating === undefined) {
          return "no_ratings";
        } 
        else {
          return "location rating is " + self.current_location.rating;
        }
      };
var formattedInfoWindow = "<h5>" + self.current_location.title + "</h5>" + "<div>" + formattedLikes() + "</div>" + "<div>" + formattedRating() + "</div>";
      infowindow.setContent(formattedInfoWindow);
        infowindow.open(map, location);
       self.makeBounce(location);
  };


  self.refresh_List = function() {
      
      var place_input=self.place_input();
      infowindow.close();

      if(place_input.length == 0) {
        for (var counter = 0; counter < self.selected_place().length; counter ++) {
          
          self.selected_place()[counter].setVisible(true);
          self.selected_place()[counter].show(true);
        } 
      } 
      
      else {
       for (var counter = 0; counter < self.selected_place().length; counter ++) {
          if (self.selected_place()[counter].placename.toLowerCase().indexOf(place_input.toLowerCase()) > -1) {
           self.selected_place()[counter].show(true);
           self.selected_place()[counter].setVisible(true);
          } 
          else {
          self.selected_place()[counter].show(false);
          self.selected_place()[counter].setVisible(false);
          }
       }
      }
          
      infowindow.close();
  };

  
};

var map;
var infoWindow;
    
function initMap() {
	var styles = [
          {
            featureType: 'road.highway',
            elementType: 'geometry.stroke',
            stylers: [
              { color: '#efe9e4' },
              { lightness: -40 }
            ]
          },
          {
            featureType: 'water',
            stylers: [
              { color: '#19a0d8' }
            ]
          },
          {
            featureType: 'administrative',
            elementType: 'labels.text.stroke',
            stylers: [
              { color: '#ffffff' },
              { weight: 6 }
            ]
          },
          {
            featureType: 'water',
            elementType: 'labels.text.stroke',
            stylers: [
              { lightness: 100 }
            ]
          },
          {
            featureType: 'transit.station',
            stylers: [
              { weight: 9 },
              { hue: '#e85113' }
            ]
          },
          {
            featureType: 'road.highway',
            elementType: 'labels.icon',
            stylers: [
              { visibility: 'off' }
            ]
          },
          {
            featureType: 'administrative',
            elementType: 'labels.text.fill',
            stylers: [
              { color: '#e85113' }
            ]
          },
          {
            featureType: 'road.highway',
            elementType: 'geometry.fill',
            stylers: [
              { color: '#efe9e4' },
              { lightness: -25 }
            ]
          },
          {
            featureType: 'poi',
            elementType: 'geometry',
            stylers: [
              { visibility: 'on' },
              { color: '#f0e4d3' }
            ]
          }   
];
  map = new google.maps.Map(
  document.getElementById('map'),{
  center: {lat:30.723490, lng:76.767508},
  zoom:12,
  mapTypeControl:false,
  styles:styles
  });
infowindow = new google.maps.InfoWindow();
ko.applyBindings(new viewModel());
}

function errorHandling(){
  document.getElementById('map-error').innerHTML = "invalid_map";
}
