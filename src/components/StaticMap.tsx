import cn from "@/app/utils/cn";

const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

type Props = {
  lat: number;
  lng: number;
  zoom?: number;
  className?: string;
  width?: number;
  height?: number;
};

export default function StaticMap({ lat, lng, zoom = 12, className, width = 343, height = 300 }: Props) {
  const staticMapUrl = `https://maps.googleapis.com/maps/api/staticmap?center=${lat},${lng}&zoom=${zoom}&size=${width}x${height}&maptype=roadmap&markers=color:red%7C${lat},${lng}&key=${apiKey}`;

  return (
    /* eslint-disable-next-line @next/next/no-img-element */
    <img
      src={staticMapUrl}
      alt="Static map"
      className={cn("rounded object-cover block", className)}
    />
  );
}
