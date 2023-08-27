import mapboxgl from "mapbox-gl";
import React, { useRef } from "react";
import MapComponent from "./Map Component/MapComponent";

function App() {
  return (
    <>
      <MapComponent />
      <footer
        id="footer"
        style={{
          textAlign: "center",
          backgroundColor: "black",
          color: "white",
          flexShrink: 0,
        }}>
        <p>
          Developed by Piraveenan Kirupakaran
          <br />
          <a
            style={{ color: "white" }}
            href="https://github.com/piraveenank/mapbox-map-advanced-boilerplate/">
            GitHub
          </a>
        </p>
      </footer>
    </>
  );
}

export default App;
