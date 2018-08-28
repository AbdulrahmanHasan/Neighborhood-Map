import React, { Component } from 'react';
import ListView from './ListView';
import './index.css';

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      map: '', 
      // Getting locations from JSON file
      locations: require('./Data.json'),
      mark: '',
      infowindow: ''
    };
    // binding initMap and populateBasedInfoWindow methods 
    this.initMap = this.initMap.bind(this);
    this.populateBasedInfoWindow = this.populateBasedInfoWindow.bind(this);
  }

  // google map and foursquare api Keys
  keyApi = `add_Api_Key`;
  foursquareId = `add_foursquareId`;
  foursquareSecret = `add_foursquareSecret`;

  //componentDidMount to get invoked immediately after a component is mounted
  componentDidMount() {
    window.initMap = this.initMap;
    // fetching google map url 
    new Promise((reject) => {
      const script = document.createElement('script');
      document.body.appendChild(script);
      script.onerror = reject;
      script.async = true;
      script.src = `https://maps.googleapis.com/maps/api/js?key=${this.keyApi}&v=3&callback=initMap`;
    })
    // catching the error
    .catch((error) => {
      console.log(`Sorry google maps can't be loaded please check your url`);
    })
  }

  //Initialise the google map
  initMap() {
    const google = window.google.maps;
    const populateBasedInfoWindow = this.populateBasedInfoWindow
    const map = new google.Map(document.getElementById('map'), {
      // Antakya center
    center: {lat: 36.2115411, lng: 36.1628904},
    zoom: 13,
    // user can't change the map type 
      mapTypeControl: false
    });
    const InfoWindow = new google.InfoWindow();
    const bounds = new google.LatLngBounds();
    // Style the markers a bit. This will be our listing marker icon.
    var defaultIcon = this.makeMarkerIcon('ffffff');

    // change marker color for when the user hover the marker.
    var hoverIcon = this.makeMarkerIcon('3f87a6');

    // setting a state by react 
    this.setState({
      map: map,
      infowindow: InfoWindow
    });
    const locations = [];
    //executing a provided function once for each array element.
      this.state.locations.forEach( location => {
      const {name, type, latitude, longitude} = location;
      const marker = new google.Marker({
        map: map,
        position: new google.LatLng(latitude, longitude),
        animation: google.Animation.DROP,
        icon: defaultIcon
      });
      marker.addListener('click', function () {
        populateBasedInfoWindow(this);
      });
       marker.addListener('mouseover', function () {
         this.setIcon(hoverIcon);
       });
       marker.addListener('mouseout', function () {
         this.setIcon(defaultIcon);
       });
       // the contect for filter list
      location.information = `${name}, ${type}`;
      location.marker = marker;
      locations.push(location);
      // Extend the boundaries of the map for each marker and display the marker
      bounds.extend(location.marker.position);
    });
    this.setState({locations: locations});
    map.fitBounds(bounds);
        // clear marker property if the infowindow is closed.
    InfoWindow.addListener('closeclick', function () {
      InfoWindow.setMarker = null;
    });
  }

    // This method takes in a COLOR, and then creates a new marker
    // icon of that color. The icon will be 21 px wide by 34 high, have an origin
    // of 0, 0 and be anchored at 10, 34).

   makeMarkerIcon(markerColor) {
     const google =  window.google.maps
     var markerImage = new google.MarkerImage(
       'http://chart.googleapis.com/chart?chst=d_map_spin&chld=1.15|0|' + markerColor +
       '|40|_|%E2%80%A2',
          new google.Size(21, 34),
          new google.Point(0, 0),
          new google.Point(10, 34),
          new google.Size(21,34));
     return markerImage;
   }

  // This method populate based markers position, and populate the infowindow when that marker is clicked.
  populateBasedInfoWindow (marker) {
    const {mark, infowindow, map} = this.state;
    const google = window.google.maps;
    
    if (mark) {
      mark.setAnimation(null);
      this.setState({mark: ''});
      infowindow.close();
    }
    
    infowindow.open(map, marker);
    marker.setAnimation(google.Animation.BOUNCE);
    this.setState({mark: marker});
    infowindow.setContent('Loading....');
    map.setCenter(marker.getPosition());
    this.getMarkerInfo(marker);   
  }
  getMarkerInfo(marker) {
    const {infowindow} = this.state
    // Search for Venues Request 
    const url = 
    `https://api.foursquare.com/v2/venues/search?client_id=${this.foursquareId}&client_secret=` +
    `${this.foursquareSecret}&v=20130815&ll=${marker.getPosition().lat()},${marker.getPosition().lng()}&limit=1`
    // fetch the foursquare url
    fetch(url)
    .then(function(response) {
      if (response.status !== 200) {
        //if the response gets error
        infowindow.setContent(`data can't be loaded, refresh the page or check the location`);
        return;
      }

      //get information for the location from foursquare website
      // more details on https://developer.foursquare.com/docs/api/venues/search
      response.json().then(function(data) {
        const locationsInfo = data.response.venues[0];
        infowindow.setContent(
          `<h3>${locationsInfo.name}</h3>
            <p> ${locationsInfo.location.formattedAddress[0] ? locationsInfo.location.formattedAddress[0] : locationsInfo.location.address} </p>
            <p>Lat:${locationsInfo.location.lat}, Lng:${locationsInfo.location.lng} </p>
            <a href='https://foursquare.com/v/${locationsInfo.id}' target='_blank'>More information on foursquare</a>`
        );
      });
    })
    // catch the error
    .catch(function(error) {
      infowindow.setContent(`Please check your internet connection`);
    });
  }

  render() {
    return (
      <div>
        <ListView
          locations={this.state.locations}
          populateBasedInfoWindow={this.populateBasedInfoWindow}
        />
        <div id='map' />
      </div>
    );
  }
}

export default App;