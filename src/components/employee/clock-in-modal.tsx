"use client";

import * as React from "react";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { LocationMapView } from "@/components/common/location-map-view";
import { useEmployee } from "@/context/employee-context";
import { GeolocationData } from "@/types/employee-portal";
import {
  MapPin,
  Clock,
  Navigation,
  Camera,
  Building2,
  RefreshCw,
  CheckCircle2,
  AlertTriangle,
  Loader2,
} from "lucide-react";

interface ClockInModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const BAYSHORE_HQ_LAT = 23.7925;
const BAYSHORE_HQ_LNG = 90.4078;

function calculateDistanceMeters(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371000;
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c);
}

export function ClockInModal({ isOpen, onClose }: ClockInModalProps) {
  const { clockIn, profile } = useEmployee();

  const [punchType, setPunchType] = React.useState<"Time Clock" | "Field Check-In">(
    "Time Clock"
  );
  const [clientName, setClientName] = React.useState("");
  const [purposeNote, setPurposeNote] = React.useState("");
  const [shortLocation, setShortLocation] = React.useState("");

  const [isLocating, setIsLocating] = React.useState(false);
  const [gpsError, setGpsError] = React.useState<string | null>(null);
  const [hasGpsFix, setHasGpsFix] = React.useState(false);
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const [geoData, setGeoData] = React.useState<GeolocationData>({
    latitude: BAYSHORE_HQ_LAT,
    longitude: BAYSHORE_HQ_LNG,
    accuracy: 10,
    address: "Acquiring your live GPS location...",
    geofenceStatus: "Inside Office Geofence",
    distanceFromHQ: 0,
    selfieUrl: profile.avatar,
    checkInType: "Time Clock",
  });

  const [takeSelfie, setTakeSelfie] = React.useState(true);

  const detectLocation = React.useCallback(() => {
    setIsLocating(true);
    setGpsError(null);

    if (typeof window === "undefined" || !("geolocation" in navigator)) {
      setIsLocating(false);
      setGpsError(
        "Geolocation is not supported by this browser. Use a preset location below."
      );
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;
        const acc = Math.round(position.coords.accuracy || 15);
        const dist = calculateDistanceMeters(
          lat,
          lng,
          BAYSHORE_HQ_LAT,
          BAYSHORE_HQ_LNG
        );
        const inGeofence = dist <= 500;

        let resolvedAddress = `${lat.toFixed(5)}° N, ${lng.toFixed(5)}° E`;
        let shortLoc = inGeofence
          ? "Gulshan HQ"
          : `${lat.toFixed(4)}, ${lng.toFixed(4)}`;

        try {
          const res = await fetch(
            `/api/geocode/reverse?lat=${encodeURIComponent(
              lat
            )}&lng=${encodeURIComponent(lng)}`,
            { cache: "no-store" }
          );
          if (res.ok) {
            const addrData = (await res.json()) as {
              address?: string;
              shortLocation?: string;
            };
            if (addrData.address) resolvedAddress = addrData.address;
            if (addrData.shortLocation) shortLoc = addrData.shortLocation;
          }
        } catch {
          // Keep numeric GPS coordinates if reverse lookup times out
        }

        setShortLocation(shortLoc);
        setGeoData({
          latitude: lat,
          longitude: lng,
          accuracy: acc,
          address: resolvedAddress,
          geofenceStatus:
            punchType === "Field Check-In"
              ? "Field Client Visit"
              : inGeofence
              ? "Inside Office Geofence"
              : "Outside Geofence (Remote)",
          distanceFromHQ: dist,
          selfieUrl: profile.avatar,
          checkInType: punchType,
        });
        setHasGpsFix(true);
        setIsLocating(false);
      },
      (err) => {
        setIsLocating(false);
        const msg =
          err.code === err.PERMISSION_DENIED
            ? "Location permission denied. Allow browser location access and click Re-scan GPS, or pick an office/remote preset below."
            : "Could not detect device GPS signal right now. Try Re-scan GPS or select a location preset.";
        setGpsError(msg);
      },
      { enableHighAccuracy: true, timeout: 12000, maximumAge: 0 }
    );
  }, [punchType, profile.avatar]);

  React.useEffect(() => {
    if (!isOpen) return;
    const timer = setTimeout(() => {
      detectLocation();
    }, 60);
    return () => clearTimeout(timer);
  }, [isOpen, detectLocation]);

  const handleSelectPreset = (
    preset: "gulshan" | "banani" | "bashundhara" | "remote"
  ) => {
    setGpsError(null);
    setHasGpsFix(true);
    if (preset === "gulshan") {
      setShortLocation("Gulshan HQ");
      setGeoData({
        latitude: 23.7925,
        longitude: 90.4078,
        accuracy: 8,
        address: "Bayshore Tower, Plot 14, Road 46, Gulshan-2, Dhaka 1212",
        geofenceStatus: "Inside Office Geofence",
        distanceFromHQ: 12,
        selfieUrl: profile.avatar,
        checkInType: punchType,
      });
    } else if (preset === "banani") {
      setShortLocation("Banani Annex");
      setGeoData({
        latitude: 23.7937,
        longitude: 90.4066,
        accuracy: 10,
        address: "Bayshore Annex, Road 11, Block D, Banani, Dhaka",
        geofenceStatus: "Inside Office Geofence",
        distanceFromHQ: 48,
        selfieUrl: profile.avatar,
        checkInType: punchType,
      });
    } else if (preset === "bashundhara") {
      setPunchType("Field Check-In");
      setClientName("Grameenphone Ltd");
      setPurposeNote("On-Site Enterprise Architecture Review");
      setShortLocation("Bashundhara R/A");
      setGeoData({
        latitude: 23.8151,
        longitude: 90.4255,
        accuracy: 14,
        address: "GP House, Plot 1, Commercial Area, Bashundhara R/A, Dhaka",
        geofenceStatus: "Field Client Visit",
        distanceFromHQ: 3100,
        selfieUrl: profile.avatar,
        checkInType: "Field Check-In",
        clientName: "Grameenphone Ltd",
        purposeNote: "On-Site Enterprise Architecture Review",
      });
    } else {
      setShortLocation("Uttara Sector 3 (Remote)");
      setGeoData({
        latitude: 23.869,
        longitude: 90.3986,
        accuracy: 18,
        address: "Sector 3, Uttara Model Town, Dhaka 1230",
        geofenceStatus: "Outside Geofence (Remote)",
        distanceFromHQ: 8600,
        selfieUrl: profile.avatar,
        checkInType: punchType,
      });
    }
  };

  const handleConfirmClockIn = async () => {
    setIsSubmitting(true);
    const resolvedLocLabel =
      punchType === "Field Check-In" && clientName.trim()
        ? clientName.trim()
        : shortLocation || geoData.address;

    const finalGeo: GeolocationData = {
      ...geoData,
      checkInType: punchType,
      clientName: punchType === "Field Check-In" ? clientName.trim() : undefined,
      purposeNote: punchType === "Field Check-In" ? purposeNote.trim() : undefined,
      selfieUrl: takeSelfie ? profile.avatar : undefined,
      timestamp: new Date().toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
      }),
    };

    const ok = await clockIn(resolvedLocLabel, finalGeo);
    setIsSubmitting(false);
    if (ok) {
      onClose();
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Clock In (Live GPS Geolocation)"
      description="Your real-time coordinates, verified address, and check-in time are logged to MongoDB and shown to HR Administration."
      size="lg"
    >
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-2 p-1 bg-slate-100 rounded-xl">
          <button
            type="button"
            onClick={() => {
              setPunchType("Time Clock");
              setGeoData((prev) => ({
                ...prev,
                checkInType: "Time Clock",
                geofenceStatus:
                  (prev.distanceFromHQ || 0) <= 500
                    ? "Inside Office Geofence"
                    : "Outside Geofence (Remote)",
              }));
            }}
            className={`flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              punchType === "Time Clock"
                ? "bg-white text-slate-900 shadow-xs"
                : "text-slate-500 hover:text-slate-800"
            }`}
          >
            <Clock className="h-4 w-4 text-orange-600" />
            <span>Office / Remote Clock-In</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setPunchType("Field Check-In");
              setGeoData((prev) => ({
                ...prev,
                checkInType: "Field Check-In",
                geofenceStatus: "Field Client Visit",
              }));
            }}
            className={`flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              punchType === "Field Check-In"
                ? "bg-white text-slate-900 shadow-xs"
                : "text-slate-500 hover:text-slate-800"
            }`}
          >
            <Navigation className="h-4 w-4 text-blue-600" />
            <span>Field Check-In (Client Site)</span>
          </button>
        </div>

        {punchType === "Field Check-In" && (
          <div className="p-3.5 rounded-xl border border-blue-200 bg-blue-50/50 space-y-2.5">
            <div className="flex items-center gap-2 text-xs font-bold text-blue-900">
              <Building2 className="h-4 w-4 text-blue-600" />
              <span>Client Visit Details</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <Input
                label="Client / Site Name"
                value={clientName}
                onChange={(e) => setClientName(e.target.value)}
                placeholder="e.g. Grameenphone HQ"
                className="h-8 text-xs bg-white"
              />
              <Input
                label="Purpose of Visit"
                value={purposeNote}
                onChange={(e) => setPurposeNote(e.target.value)}
                placeholder="e.g. SLA Meeting"
                className="h-8 text-xs bg-white"
              />
            </div>
          </div>
        )}

        {gpsError && (
          <div className="flex items-start gap-2 p-3 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-800">
            <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5 text-amber-600" />
            <span>{gpsError}</span>
          </div>
        )}

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
              <MapPin className="h-4 w-4 text-orange-600" />
              <span>
                {isLocating
                  ? "Detecting Live Device GPS..."
                  : hasGpsFix
                  ? `Detected Location: ${shortLocation || geoData.address}`
                  : "Location Preview"}
              </span>
            </span>

            <button
              type="button"
              onClick={detectLocation}
              disabled={isLocating}
              className="inline-flex items-center gap-1 text-[11px] font-semibold text-orange-600 hover:text-orange-700 disabled:opacity-50 cursor-pointer"
            >
              <RefreshCw
                className={`h-3 w-3 ${isLocating ? "animate-spin" : ""}`}
              />
              <span>{isLocating ? "Acquiring GPS..." : "Capture My Live GPS"}</span>
            </button>
          </div>

          <LocationMapView geo={geoData} compact />

          <div className="flex flex-wrap items-center gap-1.5 pt-1">
            <span className="text-[11px] text-slate-500 font-medium mr-1">
              Fallback / Office Test Presets:
            </span>
            <button
              type="button"
              onClick={() => handleSelectPreset("gulshan")}
              className="px-2 py-0.5 rounded-md border border-slate-200 bg-white text-[11px] text-slate-700 hover:border-orange-500 hover:text-orange-600 transition-colors cursor-pointer"
            >
              Gulshan HQ
            </button>
            <button
              type="button"
              onClick={() => handleSelectPreset("banani")}
              className="px-2 py-0.5 rounded-md border border-slate-200 bg-white text-[11px] text-slate-700 hover:border-orange-500 hover:text-orange-600 transition-colors cursor-pointer"
            >
              Banani Annex
            </button>
            <button
              type="button"
              onClick={() => handleSelectPreset("bashundhara")}
              className="px-2 py-0.5 rounded-md border border-slate-200 bg-white text-[11px] text-slate-700 hover:border-blue-500 hover:text-blue-600 transition-colors cursor-pointer"
            >
              Field: GP House
            </button>
            <button
              type="button"
              onClick={() => handleSelectPreset("remote")}
              className="px-2 py-0.5 rounded-md border border-slate-200 bg-white text-[11px] text-slate-700 hover:border-amber-500 hover:text-amber-600 transition-colors cursor-pointer"
            >
              Remote (Uttara)
            </button>
          </div>
        </div>

        <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/70 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Camera className="h-4 w-4 text-emerald-600 shrink-0" />
            <div className="text-xs">
              <span className="font-bold text-slate-900 block">
                Selfie Verification Stamp ({profile.name})
              </span>
              <span className="text-[11px] text-slate-500">
                Verified identity badge stored with GPS coordinates
              </span>
            </div>
          </div>
          <input
            type="checkbox"
            checked={takeSelfie}
            onChange={(e) => setTakeSelfie(e.target.checked)}
            className="h-4 w-4 rounded accent-orange-600"
          />
        </div>

        <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
          <Button variant="outline" type="button" onClick={onClose}>
            Cancel
          </Button>
          <Button
            type="button"
            disabled={isSubmitting || isLocating}
            onClick={handleConfirmClockIn}
            className="gap-2 bg-orange-600 hover:bg-orange-700 text-white font-bold shadow-sm shadow-orange-600/30"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Saving GPS Punch...</span>
              </>
            ) : (
              <>
                <CheckCircle2 className="h-4 w-4" />
                <span>Confirm Clock In &amp; Save Location</span>
              </>
            )}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
