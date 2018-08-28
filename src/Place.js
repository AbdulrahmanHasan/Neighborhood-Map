import React from "react";

//stateless function
function Place(props) {
  return (
    <li
      role="button"
      className="place"
      tabIndex={"-1"}
      onKeyPress={props.populateBasedInfoWindow.bind(this, props.name.marker)}
      onClick={props.populateBasedInfoWindow.bind(this, props.name.marker)}>
      {props.name.information}
    </li>
  )
}
export default Place;