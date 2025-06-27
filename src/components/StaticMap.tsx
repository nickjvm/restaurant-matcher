import cn from "@/app/utils/cn";

const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

type Props = {
  lat: number;
  lng: number;
  zoom?: number;
  className?: string;
};

export default function StaticMap({ lat, lng, zoom = 15, className }: Props) {
  const staticMapUrl = `https://maps.googleapis.com/maps/api/staticmap?center=${lat},${lng}&zoom=${zoom}&size=343x300&maptype=roadmap&markers=color:red%7C${lat},${lng}&key=${apiKey}`;

  return (
    /* eslint-disable-next-line @next/next/no-img-element */
    <img
      src={staticMapUrl}
      alt="Static map"
      className={cn("rounded object-cover block", className)}
    />
  );
}
