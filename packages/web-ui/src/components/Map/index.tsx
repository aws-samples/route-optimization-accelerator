/*
Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: MIT-0
*/
import maplibregl from "maplibre-gl";
import ReactDOMServer from "react-dom/server";
import "maplibre-gl/dist/maplibre-gl.css";
import { useEffect, CSSProperties, useContext, useState } from "react";
import { withIdentityPoolId } from "@aws/amazon-location-utilities-auth-helper";
import { RuntimeConfigContext } from "../../context/RuntimeContext";
import { useCognitoAuthContext } from "@aws-northstar/ui";
import { getCognitoSessionFromContext } from "../../utils/cognito";
import { COLOR_PALETTE, getRandomColor } from "../../utils/colors";

export interface LineOptions {
  lineList: Array<number[][]>;
  autoAssignColor?: boolean;
  colorList?: string[];
}

export interface MarkerOptions {
  popupContent?: React.ReactElement;
  color?: string;
}

export type Marker = [lon: number, lat: number, options?: MarkerOptions];

export interface MapProps {
  lat?: number;
  lon?: number;
  zoom?: number;
  style?: CSSProperties;
  bounds?: [[number, number], [number, number]];
  markers?: Marker[];
  line?: number[][] | LineOptions;
  interactive?: boolean;
  onZoom?: (map: maplibregl.Map, bounds: maplibregl.LngLatBounds) => void;
  onDrag?: (map: maplibregl.Map, bounds: maplibregl.LngLatBounds) => void;
}

const getLineFeature = (line: any) => {
  return {
    type: "geojson",
    data: {
      type: "Feature",
      geometry: {
        type: "LineString",
        coordinates: line,
      },
    },
  };
};

const getLineLayer = (sourceId: string, color: string = COLOR_PALETTE[0]) => {
  return {
    id: `${sourceId}-layer`,
    type: "line",
    source: sourceId,
    layout: {
      "line-join": "round",
      "line-cap": "round",
    },
    paint: {
      "line-color": color,
      "line-width": 5,
    },
  };
};

export const Map: React.FC<MapProps> = ({
  lat,
  lon,
  zoom,
  line,
  style,
  bounds,
  markers,
  interactive,
  onDrag,
  onZoom,
}) => {
  const [mapId] = useState<string>((Date.now() + Math.random()).toString(36));
  const [currentMarkers, setCurrentMarkers] = useState<maplibregl.Marker[]>();
  const [currentMap, setCurrentMap] = useState<maplibregl.Map>();
  const [currentSources, setCurrentSources] = useState<string[]>();
  const [mapLoaded, setMapLoaded] = useState<boolean>(false);
  const runtimeContext = useContext(RuntimeConfigContext);
  const cognitoContext = useCognitoAuthContext();

  useEffect(() => {
    async function initate() {
      const session = await getCognitoSessionFromContext(cognitoContext);
      const authHelper = await withIdentityPoolId(
        runtimeContext!.identityPoolId,
        {
          logins: {
            [`cognito-idp.${runtimeContext!.region}.amazonaws.com/${runtimeContext!.userPoolId}`]:
              session.getIdToken().getJwtToken(),
          },
        },
      );

      const map = new maplibregl.Map({
        container: `map-${mapId}`,
        center: lat && lon ? [lon, lat] : runtimeContext!.defaultMapCenter,
        zoom: zoom || 13,
        minZoom: 1,
        interactive: interactive === undefined ? true : interactive,
        style: `https://maps.geo.${runtimeContext!.region}.amazonaws.com/maps/v0/maps/${runtimeContext!.map}/style-descriptor`,
        ...authHelper.getMapAuthenticationOptions(),
      });

      map.addControl(new maplibregl.NavigationControl({}), "top-left");
      map.addControl(
        new maplibregl.GeolocateControl({
          positionOptions: {
            enableHighAccuracy: true,
          },
          trackUserLocation: true,
        }),
      );
      map.addControl(new maplibregl.FullscreenControl({}));
      map.on("zoom", function (e) {
        onZoom && onZoom(e.target, e.target.getBounds());
      });
      map.on("drag", function (e) {
        onDrag && onDrag(e.target, e.target.getBounds());
      });

      setCurrentMap(map);
    }

    initate();
  }, [cognitoContext, runtimeContext, zoom, interactive]);

  useEffect(() => {
    if (currentMap) {
      currentMap.on("load", () => {
        setMapLoaded(currentMap.loaded());
      });
    } else {
      setMapLoaded(false);
    }
  }, [currentMap]);

  useEffect(() => {
    if (currentMap && mapLoaded && markers) {
      currentMarkers?.map((q) => q.remove());
      setCurrentMarkers(
        markers.map((lonLat) => {
          const options = lonLat[2];

          const marker = new maplibregl.Marker({
            draggable: false,
            color: options?.color,
          }).setLngLat([lonLat[0], lonLat[1]]);

          if (options && options.popupContent) {
            marker.setPopup(
              new maplibregl.Popup({ offset: 25 }).setHTML(
                ReactDOMServer.renderToString(options.popupContent),
              ),
            );
          }

          marker.addTo(currentMap);

          return marker;
        }),
      );
    }
  }, [currentMap, mapLoaded, markers]);

  useEffect(() => {
    if (currentMap && mapLoaded && line) {
      if (currentSources && currentSources.length > 0) {
        currentSources.forEach((q) => {
          if (currentMap.getLayer(`${q}-layer`)) {
            currentMap.removeLayer(`${q}-layer`);
          }

          if (currentMap.getSource(q)) {
            currentMap.removeSource(q);
          }
        });
      }

      const lines = !("lineList" in line) ? [line] : line.lineList;
      const colors = "colorList" in line ? line.colorList : undefined;
      const routeIds: string[] = [];

      lines.forEach((q, idx) => {
        const routeId = `route${idx}`;
        const color = colors
          ? colors[idx]
          : idx === 0
            ? undefined
            : getRandomColor();
        // @ts-ignore
        currentMap.addSource(routeId, getLineFeature(q));
        // @ts-ignore
        currentMap.addLayer(getLineLayer(routeId, color));
        routeIds.push(routeId);
      });

      setCurrentSources(routeIds);
    }
  }, [currentMap, mapLoaded, line]);

  useEffect(() => {
    if (currentMap && lat && lon) {
      currentMap!.flyTo({
        center: { lat, lon },
      });
    }
  }, [currentMap, lat, lon]);

  useEffect(() => {
    if (currentMap && bounds) {
      currentMap.fitBounds(bounds, {
        padding: 150,
      });
    }
  }, [currentMap, bounds]);

  return <div id={`map-${mapId}`} style={style || { height: "85vh" }}></div>;
};
