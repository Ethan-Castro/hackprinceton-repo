"use client";

import { CldImage } from "next-cloudinary";

export default function CloudinaryDemo() {
  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;

  if (!cloudName) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 p-8">
        <div className="rounded-lg border bg-white p-6 shadow-sm">
          <p className="text-sm text-gray-700">
            Cloudinary is not configured. Set NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME to view the demo.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 p-8">
      <CldImage
        src="cld-sample-5"
        width="500"
        height="500"
        crop={{ type: "auto", source: true }}
        alt="Cloudinary sample"
      />
    </div>
  );
}
