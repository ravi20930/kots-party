"use client";

import { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import { useParams, useRouter } from "next/navigation";
import { toast } from "sonner";
import { format } from "date-fns";

type Party = {
  id: string;
  title: string;
  date: Date;
  maxAttendees: number;
  flatNo: string;
  hostName: string;
  hostEmail: string;
  isVerified: boolean;
  rsvps: Array<{
    id: string;
    userEmail: string;
    userName: string;
    alcoholRequest?: string | null;
    suggestion?: string | null;
    isVerified: boolean;
    createdAt: Date;
  }>;
};

export default function PartyDetails() {
  const params = useParams();
  const id = params?.id as string;
  const { data: session } = useSession();
  const [party, setParty] = useState<Party | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const router = useRouter();

  // Loading states
  const [isDeleting, setIsDeleting] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Edit form states
  const [editTitle, setEditTitle] = useState("");
  const [editDate, setEditDate] = useState("");
  const [editMaxAttendees, setEditMaxAttendees] = useState(0);
  const [editFlatNo, setEditFlatNo] = useState("");

  const isAdmin = session?.user?.email === "ravi.20930@gmail.com";
  const isHost = session?.user?.email === party?.hostEmail;
  const canManageParty = isAdmin || isHost;

  const verifiedRSVPs = party?.rsvps.filter((rsvp) => rsvp.isVerified) || [];
  const remainingSeats = party ? party.maxAttendees - verifiedRSVPs.length : 0;

  const fetchParty = useCallback(async () => {
    try {
      const res = await fetch(`/api/party?id=${id}`);
      if (!res.ok) throw new Error("Failed to fetch party");
      const data = await res.json();
      setParty(data);
      // Initialize edit form data
      setEditTitle(data.title);
      setEditDate(format(new Date(data.date), "yyyy-MM-dd'T'HH:mm"));
      setEditMaxAttendees(data.maxAttendees);
      setEditFlatNo(data.flatNo);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch party");
      toast.error("Failed to fetch party details");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchParty();
  }, [fetchParty]);

  const handleSaveEdit = async () => {
    if (!party) return;
    setIsSaving(true);
    try {
      const res = await fetch(`/api/party?id=${party.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: editTitle,
          date: editDate,
          maxAttendees: parseInt(editMaxAttendees.toString()),
          flatNo: editFlatNo,
        }),
      });

      if (!res.ok) throw new Error("Failed to update party");

      await fetchParty();
      setIsEditing(false);
      toast.success("Party updated successfully");
    } catch (error) {
      console.error("Error updating party:", error);
      toast.error("Failed to update party");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!party) return;

    setIsDeleting(true);
    toast.loading("Deleting party...");

    try {
      const res = await fetch(`/api/parties?id=${party.id}`, {
        method: "DELETE",
      });

      if (!res.ok) throw new Error("Failed to delete party");

      toast.success("Party deleted successfully");
      router.push("/");
    } catch (error) {
      console.error("Error:", error);
      toast.error("Failed to delete party");
      setIsDeleting(false);
    }
  };

  if (loading) return <div className="text-white">Loading...</div>;
  if (error) return <div className="text-white">Error: {error}</div>;
  if (!party) return <div className="text-white">Party not found</div>;

  if (isEditing) {
    return (
      <div className="bg-gray-900 shadow-xl rounded-lg p-8 max-w-4xl mx-auto">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-white mb-4">Edit Party</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300">
                Title
              </label>
              <input
                type="text"
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                className="mt-1 block w-full rounded-md bg-gray-800 border-gray-700 text-white p-2"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300">
                Date & Time
              </label>
              <input
                type="datetime-local"
                value={editDate}
                onChange={(e) => setEditDate(e.target.value)}
                className="mt-1 block w-full rounded-md bg-gray-800 border-gray-700 text-white p-2"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300">
                Max Attendees
              </label>
              <input
                type="number"
                value={editMaxAttendees}
                onChange={(e) => setEditMaxAttendees(parseInt(e.target.value))}
                min="1"
                max="100"
                className="mt-1 block w-full rounded-md bg-gray-800 border-gray-700 text-white p-2"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300">
                Flat Number
              </label>
              <input
                type="text"
                value={editFlatNo}
                onChange={(e) => setEditFlatNo(e.target.value)}
                className="mt-1 block w-full rounded-md bg-gray-800 border-gray-700 text-white p-2"
              />
            </div>
            <div className="flex gap-4 mt-6">
              <button
                onClick={handleSaveEdit}
                disabled={isSaving}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {isSaving ? (
                  <>
                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                        fill="none"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      />
                    </svg>
                    <span>Saving...</span>
                  </>
                ) : (
                  "Save Changes"
                )}
              </button>
              <button
                onClick={() => setIsEditing(false)}
                className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-900 shadow-xl rounded-lg p-8 max-w-4xl mx-auto">
      <div className="flex justify-between items-start mb-6">
        <h1 className="text-3xl font-bold text-white">{party.title}</h1>
        {canManageParty && (
          <div className="flex gap-2">
            <button
              onClick={() => setIsEditing(true)}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
            >
              Edit Party
            </button>
            <button
              disabled={isDeleting}
              onClick={handleDelete}
              className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {isDeleting ? (
                <>
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                      fill="none"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                  <span>Deleting...</span>
                </>
              ) : (
                "Delete Party"
              )}
            </button>
          </div>
        )}
      </div>

      <div className="space-y-4 mb-8">
        <p className="text-white">
          <span className="font-semibold">Date:</span>{" "}
          {format(new Date(party.date), "dd MMM yyyy, hh:mm a")}
        </p>
        <p className="text-white">
          <span className="font-semibold">Host:</span> {party.hostName}
        </p>
        <p className="text-white">
          <span className="font-semibold">Flat:</span> {party.flatNo}
        </p>
        <p className="text-white">
          <span className="font-semibold">Remaining Seats:</span>{" "}
          <span
            className={remainingSeats <= 5 ? "text-red-500" : "text-green-500"}
          >
            {remainingSeats}
          </span>{" "}
          out of {party.maxAttendees}
        </p>
      </div>

      {/* Rest of the party details... */}
    </div>
  );
}
