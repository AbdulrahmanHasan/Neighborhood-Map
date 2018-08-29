import React, { Component } from "react";
import Place from "./Place";
import sortBy from 'sort-by';
import escapeRegExp from 'escape-string-regexp'


class ListView extends Component {
  constructor(props) {
    super(props);
    this.state = {
      locationList: "",
      query: ""
    };
    this.searchHandler = this.searchHandler.bind(this);
  }
//search handler method to handle and filter the location list element
  searchHandler(event) {
    const query = event.target.value;
    let locationList = [];
    //executing a provided function once for each location list element
    this.props.locations.forEach((location) => {
      // Filtering by typed name in input using escape-string-regexp
      const match = new RegExp(escapeRegExp(query), 'i')
      // filter the markers by location name
      if (match.test(location.name)) {
        location.marker.setVisible(true);
        locationList.push(location);
      } else {
        location.marker.setVisible(false);
      }
    });
    this.setState({
      // update the locations list state when we use the input filter
      locationList: locationList,
      query: query
    });
  }
  componentDidMount() {
    // To show/hide the filter List
    document.getElementById('show-filter').addEventListener('click', function () {
    document.getElementById('filter').classList.toggle('show');
    });
  }
  componentWillMount() {
    this.setState({
      //sorting location list by name
      locationList: this.props.locations.sort(sortBy('name'))
    });
  }

  render() {
  const {locationList, query} = this.state;
  const locationlist = locationList.map((listElement, index) => {
      return (
        <Place
          key={index}
          name={listElement}
          populateBasedInfoWindow={this.props.populateBasedInfoWindow.bind(this)}
        />
      );
    }, this);

    return (
      <aside className="filter" id="filter">
        <input
          role="search"
          type="text"
          aria-label="Input Filter marker"
          value={query}
          onChange={this.searchHandler}
          id="search-field"
          className="input"
          placeholder="Filter by name or type"
        />
      <span role="button" aria-label="Filter list button" tabindex="1" id="show-filter">filter</span>
        <ul className="locations-list">
          {locationlist}
        </ul>
      </aside>
    );
  }
}

export default ListView;
