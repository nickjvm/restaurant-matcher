import { GoogleMap, Marker, useJsApiLoader } from "@react-google-maps/api";
import { useEffect, useState } from "react";

const containerStyle = {
  width: "100%",
  height: "400px",
};

const center = {
  lat: 37.7749, // Default latitude
  lng: -122.4194, // Default longitude
};

export default function MapPicker({
  onLocationSelect,
}: {
  onLocationSelect: (location: { lat: number; lng: number }) => void;
}) {
  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY!,
  });

  const [markerPosition, setMarkerPosition] = useState<{
    lat: number;
    lng: number;
  }>(center);

  async function getLocationFromIpAddress() {
    const response = await fetch("/api/location");
    const { data } = await response.json();
    setMarkerPosition({
      lat: data.lat,
      lng: data.lon,
    });
    onLocationSelect({
      lat: data.lat,
      lng: data.lon,
    });
  }

  useEffect(() => {
    const locationCookie = document.cookie
      .split("; ")
      .find((row) => row.startsWith("location="));
    console.log(document.cookie);
    if (locationCookie) {
      const [lat, lng] = decodeURIComponent(locationCookie.split("=")[1])
        .split(",")
        .map(Number);
      setMarkerPosition({ lat, lng });
      onLocationSelect({ lat, lng });
    } else if (window.navigator.geolocation) {
      // If geolocation is available, use it to set the marker position
      window.navigator.geolocation.getCurrentPosition(
        (position) => {
          setMarkerPosition({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
          onLocationSelect({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
        },
        async () => {
          await getLocationFromIpAddress();
        }
      );
    } else {
      getLocationFromIpAddress();
    }
    /* eslint-disable-next-line react-hooks/exhaustive-deps */
  }, []);

  const handleClick = (event: google.maps.MapMouseEvent) => {
    if (event.latLng) {
      const { lat, lng } = event.latLng.toJSON();
      setMarkerPosition({ lat, lng });
      onLocationSelect({ lat, lng });
    }
  };
  if (!isLoaded) return "loading map...";

  return (
    <GoogleMap
      mapContainerStyle={containerStyle}
      center={markerPosition}
      zoom={10}
      onClick={handleClick}
    >
      <Marker position={markerPosition} onPositionChanged={console.log} />
    </GoogleMap>
  );
}
