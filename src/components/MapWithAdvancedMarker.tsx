"use client";

import { useEffect, useRef, useState } from "react";
import { Loader } from "@googlemaps/js-api-loader";
import { FaLocationArrow } from "react-icons/fa";
import cn from "@/app/utils/cn";

type Props = {
  location?: google.maps.LatLngLiteral;
  editable?: boolean;
  onLocationChange?: (
    coords: { lat: number; lng: number },
    city: string | null
  ) => void;
};

const defaultLocation: google.maps.LatLngLiteral = {
  lat: 37.7749,
  lng: -122.4194,
};

export default function MapWithAdvancedMarker({
  onLocationChange,
  location,
  editable = true,
}: Props) {
  const [userLocation, setUserLocation] =
    useState<google.maps.LatLngLiteral | null>(location ?? null);
  const mapContainerRef = useRef<HTMLDivElement>(null);

  const mapRef = useRef<google.maps.Map | null>(null);
  const markerRef = useRef<google.maps.marker.AdvancedMarkerElement | null>(
    null
  );
  const geoCoderRef = useRef<google.maps.Geocoder | null>(null);

  async function getLocationFromIpAddress() {
    const { data } = await fetch("/api/location")
      .then((r) => r.json())
      .catch(() => {
        setUserLocation(defaultLocation);
      });

    const location = {
      lat: data.lat,
      lng: data.lon,
    };
    if (data.status !== "fail") {
      setUserLocation(location);
    } else {
      setUserLocation(defaultLocation);
    }
  }

  function getCurrentLocation() {
    navigator.geolocation.getCurrentPosition((pos) => {
      const location = {
        lat: pos.coords.latitude,
        lng: pos.coords.longitude,
      };
      setUserLocation(location);

      mapRef.current?.setCenter(location);
      if (markerRef.current) {
        markerRef.current.position = location;
      }

      onLocationChange?.(location, null);

      getCityFromCoords(location.lat, location.lng).then((city: string) => {
        onLocationChange?.(location, city);
      });
    }, getLocationFromIpAddress);
  }

  async function getCityFromCoords(lat: number, lng: number): Promise<string> {
    return new Promise((resolve, reject) => {
      geoCoderRef.current?.geocode(
        { location: { lat, lng } },
        (results, status) => {
          if (status === "OK" && results?.[0]) {
            const stateComponent = results[0].address_components.find(
              (component) =>
                component.types.includes("administrative_area_level_1")
            );

            const typeOrder = [
              "locality",
              "neighborhood",
              "administrative_area_level_2",
              "postal_code",
            ];
            const cityComponent =
              typeOrder
                .map((type) =>
                  results[0].address_components.find((component) =>
                    component.types.includes(type)
                  )
                )
                .find(Boolean) || null;
            resolve(
              `${cityComponent?.long_name || "Unknown"}, ${stateComponent?.long_name || "Unknown"
              }`
            );
          } else {
            reject("Geocoding failed");
          }
        }
      );
    });
  }

  function getLocationFromCookie() {
    const locationCookie = document.cookie
      .split("; ")
      .find((row) => row.startsWith("location="));

    if (locationCookie) {
      const [lat, lng] = decodeURIComponent(locationCookie.split("=")[1])
        .split(",")
        .map(Number);

      setUserLocation({ lat, lng });

      return { lat, lng };
    }

    return null;
  }

  useEffect(() => {
    if (userLocation) {
      mapRef.current?.setCenter(userLocation);
      if (markerRef.current) {
        markerRef.current.position = userLocation;
      }

      getCityFromCoords(userLocation.lat, userLocation.lng)
        .then((city: string) => {
          onLocationChange?.(userLocation, city);
        })
        .catch((error) => {
          onLocationChange?.(userLocation, null);
          console.error("Failed to get city from coordinates:", error);
        });
    }
    /* eslint-disable-next-line react-hooks/exhaustive-deps */
  }, [userLocation]);

  useEffect(() => {
    const loadMap = async () => {
      const loader = new Loader({
        apiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY!,
        version: "weekly",
      });

      const [{ Map }, { AdvancedMarkerElement }] = await Promise.all([
        loader.importLibrary("maps") as Promise<google.maps.MapsLibrary>,
        loader.importLibrary("marker") as Promise<google.maps.MarkerLibrary>,
      ]);

      geoCoderRef.current = new google.maps.Geocoder();

      mapRef.current = new Map(mapContainerRef.current!, {
        center: userLocation,
        zoom: 15,
        mapId: "8ba138aae55db801aa3a226d",
        disableDefaultUI: true,
        clickableIcons: false,
      });

      markerRef.current = new AdvancedMarkerElement({
        map: mapRef.current,
        position: userLocation,
        gmpDraggable: editable,
      });

      if (!getLocationFromCookie()) {
        getLocationFromIpAddress();
      }

      if (editable) {
        markerRef.current.addListener("dragend", () => {
          const position = markerRef.current
            ?.position as google.maps.LatLngLiteral;

          const coords = { lat: position.lat, lng: position.lng };
          setUserLocation(coords);
        });

        mapRef.current.addListener("click", (e: google.maps.MapMouseEvent) => {
          if (!e.latLng) return;
          const coords = { lat: e.latLng.lat(), lng: e.latLng.lng() };
          setUserLocation(coords);
        });
      }
    };

    loadMap();
    /* eslint-disable-next-line react-hooks/exhaustive-deps */
  }, []);

  return (
    <>
      <div className="w-full mb-2 relative">
        <div
          ref={mapContainerRef}
          style={{ height: 250, width: "100%" }}
          className="rounded-lg"
        />
        <button
          type="button"
          onClick={getCurrentLocation}
          className={cn(
            "absolute bottom-3 left-1/2 -translate-x-1/2",
            "mt-2 p-2 px-4 flex items-center gap-2 rounded-full whitespace-nowrap text-xs cursor-pointer",
            "text-blue-600 bg-white/80 focus:bg-blue-100/80 hover:bg-blue-100/80 transition border border-blue-500"
          )}
        >
          <FaLocationArrow className="w-3 h-3" />
          Use Current Location
        </button>
      </div>
      <p className="text-xs text-gray-600 text-center">
        Click on the map or drag and drop the marker to select a different
        location.
      </p>
    </>
  );
}
