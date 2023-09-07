import React, { useEffect, useRef, useState } from "react";
import mapboxgl from "mapbox-gl";
import turfBbox from "@turf/bbox";
import { ExampleMainPolygon } from "./exampleMainPolygon";
import { ExampleInnerPolygons } from "./exampleInnerPolygons";

const MapComponentWithPopup = () => {
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const [isPolygonClicked, setPolygonClicked] = useState(false);
  const [isSmallScreen, setIsSmallScreen] = useState(window.innerWidth < 768);

  const [hasInnerPolygonsLoaded, setHasInnerPolygonsLoaded] = useState(false);

  useEffect(() => {
    if (!mapRef.current) return;
    if (!hasInnerPolygonsLoaded) return;
    const layerId = `polygon-layer-1`;
    if (mapRef.current?.getLayer(layerId)) {
      mapRef.current!.setPaintProperty(layerId, "fill-color", "#ffffff");
    }

    ExampleInnerPolygons.map((innerPolygon, index) => {
      const sourceId = `inner-polygon-source-${index + 1}`;
      const layerId = `inner-polygon-layer-${index + 1}`;
      if (!mapRef.current!.getSource(sourceId)) {
        mapRef.current!.addSource(sourceId, {
          type: "geojson",
          data: {
            type: "Feature",
            geometry: {
              type: "Polygon",
              coordinates: [ExampleInnerPolygons[index]],
            },
            properties: {},
          },
        });

        mapRef.current?.addLayer({
          id: `${layerId}-border`,
          type: "line",
          source: sourceId,
          paint: {
            "line-color": "black",
            "line-width": 1.3,
          },
        });

        mapRef.current?.addLayer({
          id: `${layerId}`,
          type: "fill",
          source: sourceId,
          paint: {
            "fill-color": "grey",
            "fill-opacity": 0.8,
          },
        });

        mapRef.current?.on(
          "click",
          layerId,
          (e: mapboxgl.MapMouseEvent & mapboxgl.EventData) => {
            setPolygonClicked(true);
            const currentIsSmallScreen = window.innerWidth < 768;

            console.log(currentIsSmallScreen);
            console.log(currentIsSmallScreen ? "100%" : "35%");

            mapContainerRef.current!.style.width = currentIsSmallScreen
              ? "100%"
              : "35%";
            mapRef.current!.resize();
            const mapBoundingBox = turfBbox({
              type: "Feature",
              geometry: {
                type: "Polygon",
                coordinates: [ExampleInnerPolygons[index]],
              },
            });

            const [minX, minY, maxX, maxY] = mapBoundingBox;
            mapRef.current!.fitBounds([
              [minX, minY],
              [maxX, maxY],
            ]);
          }
        );
      }
    });
  }, [hasInnerPolygonsLoaded]);
  useEffect(() => {
    const handleResize = () => {
      setIsSmallScreen(window.innerWidth < 768);
      console.log(window.innerWidth < 768);
      if (!mapRef.current || !mapContainerRef.current) return;
      if (isPolygonClicked) {
        console.log("resize");
        mapContainerRef.current!.style.width =
          window.innerWidth < 768 ? "100%" : "35%";

        setTimeout(() => {
          mapRef.current!.resize();
        }, 300);
      } else {
        mapContainerRef.current!.style.width = "100%";
      }
    };

    handleResize();

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, [window.innerWidth]);

  useEffect(() => {
    if (!mapRef.current) {
      mapRef.current = new mapboxgl.Map({
        container: mapContainerRef.current!,
        style: "mapbox://styles/go-ifrc/cki7aznup3hqz19rxliv3naf4",
        center: [0, 0],
        zoom: 1,
      });

      mapRef.current.addControl(new mapboxgl.FullscreenControl(), "top-left");
      mapRef.current.addControl(new mapboxgl.NavigationControl(), "top-left");
    }

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (!mapRef.current) return;

    mapRef.current.on("load", () => {
      const sourceId = `polygon-source-1`;
      const layerId = `polygon-layer-1`;

      if (!mapRef.current!.getSource(sourceId)) {
        mapRef.current!.addSource(sourceId, {
          type: "geojson",
          data: {
            type: "Feature",
            geometry: {
              type: "Polygon",
              coordinates: [ExampleMainPolygon],
            },
            properties: {},
          },
        });

        mapRef.current?.addLayer({
          id: `${layerId}-border`,
          type: "line",
          source: sourceId,
          paint: {
            "line-color": "black",
            "line-width": 1.3,
          },
        });

        mapRef.current?.addLayer({
          id: `${layerId}`,
          type: "fill",
          source: sourceId,
          paint: {
            "fill-color": "#FF5733",
            "fill-opacity": 0.8,
          },
        });

        mapRef.current?.on(
          "click",
          layerId,
          (e: mapboxgl.MapMouseEvent & mapboxgl.EventData) => {
            // setPolygonClicked(true);

            // const currentIsSmallScreen = window.innerWidth < 768;

            // mapContainerRef.current!.style.width = currentIsSmallScreen
            //   ? "100%"
            //   : "35%";
            // mapRef.current!.resize();
            const mapBoundingBox = turfBbox({
              type: "Feature",
              geometry: {
                type: "Polygon",
                coordinates: [ExampleMainPolygon],
              },
            });

            const [minX, minY, maxX, maxY] = mapBoundingBox;
            mapRef.current!.fitBounds([
              [minX, minY],
              [maxX, maxY],
            ]);

            setHasInnerPolygonsLoaded(true);
          }
        );
      }
    });
  });

  const handleClose = () => {
    setPolygonClicked(false);
    mapContainerRef.current!.style.width = "100%";
    mapContainerRef.current!.classList.add("map-container-transition");
    setTimeout(() => {
      mapRef.current!.resize();

      const mapBoundingBox = turfBbox({
        type: "Feature",
        geometry: {
          type: "Polygon",
          coordinates: [ExampleMainPolygon],
        },
      });

      const [minX, minY, maxX, maxY] = mapBoundingBox;
      mapRef.current!.fitBounds([
        [minX, minY],
        [maxX, maxY],
      ]);

      mapContainerRef.current!.classList.remove("map-container-transition");
    }, 100);
  };
  const removeInnerPolygons = () => {
    const layerId = `polygon-layer-1`;
    if (mapRef.current?.getLayer(layerId)) {
      mapRef.current!.setPaintProperty(layerId, "fill-color", "#FF5733");
    }
    ExampleInnerPolygons.map((innerPolygon, index) => {
      const sourceId = `inner-polygon-source-${index + 1}`;
      const layerId = `inner-polygon-layer-${index + 1}`;
      if (mapRef.current!.getSource(sourceId)) {
        mapRef.current!.removeLayer(layerId);
        mapRef.current!.removeLayer(`${layerId}-border`);
        mapRef.current!.removeSource(sourceId);
      }
    });
    setPolygonClicked(false);
    mapContainerRef.current!.style.width = "100%";
    mapContainerRef.current!.classList.add("map-container-transition");
    setTimeout(() => {
      mapRef.current!.resize();

      mapRef.current?.setCenter([0, 0]);
      mapRef.current?.setZoom(1);
      mapContainerRef.current!.classList.remove("map-container-transition");
    }, 100);

    setHasInnerPolygonsLoaded(false);
  };
  return (
    <>
      {hasInnerPolygonsLoaded && (
        <button onClick={removeInnerPolygons}>Remove the inner polygons</button>
      )}

      <div
        style={{
          display: isSmallScreen ? "block" : "flex",
        }}>
        <div
          ref={mapContainerRef}
          className="map-container"
          style={{
            width: isPolygonClicked ? (isSmallScreen ? "100%" : "35%") : "100%",
            height: "700px",
            zIndex: 1,
          }}
        />
        {isPolygonClicked && (
          <div
            style={{
              width: isPolygonClicked
                ? isSmallScreen
                  ? "100%"
                  : "65%"
                : "100%",
              backgroundColor: "lightgray",
              position: "relative",
              transition: "width 0.3s ease-in-out",
              zIndex: 100,
              height: "700px",
            }}>
            <button
              style={{ position: "absolute", top: "10px", right: "10px" }}
              onClick={handleClose}>
              Close
            </button>
            Popup Content
          </div>
        )}
      </div>
    </>
  );
};

export default MapComponentWithPopup;
