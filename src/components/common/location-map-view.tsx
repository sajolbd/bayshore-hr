"use client";

import * as React from "react";
import { MapPin, Navigation, ShieldCheck, AlertCircle, ExternalLink, Wifi } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { GeolocationData } from "@/types";

interface LocationMapViewProps {
  geo?: GeolocationData;
  fallbackLocation?: string;
  className?: string;
  compact?: boolean;
}

export function LocationMapView({
  geo,
  fallbackLocation = "Gulshan HQ",
  className = "",
  compact = false,
}: LocationMapViewProps) {
  // Default to Gulshan-2, Dhaka if no GPS coordinates provided
  const lat = geo?.latitude ?? 23.7925;
  const lng = geo?.longitude ?? 90.4078;
  const address = geo?.address ?? fallbackLocation;
  const geofence = geo?.geofenceStatus ?? "Inside Office Geofence";
  const accuracy = geo?.accuracy ?? 10;
  const ipAddress = geo?.ipAddress ?? "103.114.98.22 (Bayshore-Corp-Fiber)";

  // Embeddable OpenStreetMap view
  const mapUrl = `https://www.openstreetmap.org/export/embed.html?bbox=${lng - 0.005}%2C${lat - 0.003}%2C${lng + 0.005}%2C${lat + 0.003}&layer=mapnik&marker=${lat}%2C${lng}`;
  const gmapsUrl = `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`;

  const isInsideGeofence = geofence === "Inside Office Geofence";
  const isFieldVisit = geofence === "Field Client Visit";

  return (
    <div className={`space-y-3 ${className}`}>
      {/* Geofence Status Header */}
      <div className="flex flex-wrap items-center justify-between gap-2 p-3 rounded-xl bg-slate-50 border border-slate-200">
        <div className="flex items-center gap-2">
          {isInsideGeofence ? (
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-100 text-emerald-700">
              <ShieldCheck className="h-4 w-4" />
            </div>
          ) : isFieldVisit ? (
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-100 text-blue-700">
              <Navigation className="h-4 w-4" />
            </div>
          ) : (
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-100 text-amber-700">
              <AlertCircle className="h-4 w-4" />
            </div>
          )}

          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-900">
                {isInsideGeofence
                  ? "Inside Office Geofence"
                  : isFieldVisit
                  ? "Field Client Visit (On-Site)"
                  : "Remote Work (Outside Geofence)"}
              </span>
              <Badge
                variant={isInsideGeofence ? "success" : isFieldVisit ? "info" : "warning"}
                className="text-[10px] px-1.5 py-0"
              >
                GPS Verified
              </Badge>
            </div>
            <p className="text-[11px] text-slate-500 flex items-center gap-1.5 mt-0.5">
              <span>GPS Accuracy: ±{accuracy}m</span>
              <span>•</span>
              <span>Coordinates: {lat.toFixed(4)}° N, {lng.toFixed(4)}° E</span>
            </p>
          </div>
        </div>

        <a
          href={gmapsUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 text-[11px] font-semibold text-orange-600 hover:text-orange-700 hover:underline shrink-0"
        >
          <span>Open Google Maps</span>
          <ExternalLink className="h-3 w-3" />
        </a>
      </div>

      {/* Embedded Map Visualizer */}
      <div className="relative rounded-xl overflow-hidden border border-slate-200 bg-slate-100 shadow-inner">
        <iframe
          title="Attendance GPS Location Map"
          src={mapUrl}
          className={`w-full ${compact ? "h-44" : "h-64"} border-0`}
          loading="lazy"
        />

        {/* Location Pin Card Overlay */}
        <div className="absolute bottom-2.5 left-2.5 right-2.5 bg-white/95 backdrop-blur-md p-2.5 rounded-lg border border-slate-200/90 shadow-md flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-orange-600 text-white shadow-xs">
              <MapPin className="h-3.5 w-3.5" />
            </div>
            <div className="min-w-0">
              <p className="text-xs font-bold text-slate-900 truncate">{address}</p>
              <p className="text-[10px] text-slate-500 truncate">
                {geo?.clientName ? `Client: ${geo.clientName} • ` : ""}
                Logged via Time Clock • {ipAddress}
              </p>
            </div>
          </div>

          <div className="shrink-0 flex items-center gap-1 text-[10px] font-medium text-emerald-700 bg-emerald-50 px-2 py-1 rounded-md border border-emerald-200">
            <Wifi className="h-3 w-3" />
            <span>Verified</span>
          </div>
        </div>
      </div>
    </div>
  );
}
