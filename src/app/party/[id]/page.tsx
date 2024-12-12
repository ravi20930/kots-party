"use client";

import { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import { useParams, useRouter } from "next/navigation";
import RSVPForm from "@/components/RSVPForm";
import { toast } from "sonner";

// Helper function to format dates
const formatDate = (dateString: string | Date) => {
  try {
    const date = new Date(dateString);
    const options: Intl.DateTimeFormatOptions = {
      timeZone: "Asia/Kolkata",
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "numeric",
      minute: "numeric",
      hour12: true,
    };
    return new Intl.DateTimeFormat("en-IN", options).format(date);
  } catch (error) {
    console.error("Error formatting date:", error);
    return "Invalid Date";
  }
};

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
  const [showRSVPForm, setShowRSVPForm] = useState(false);
  const router = useRouter();
  const [isVerifying, setIsVerifying] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isCancellingRSVP, setIsCancellingRSVP] = useState(false);

  const isAdmin = session?.user?.email === "ravi.20930@gmail.com";
  const isHost = session?.user?.email === party?.hostEmail;
  const canManageRSVPs = isAdmin || isHost;

  const verifiedRSVPs = party?.rsvps.filter((rsvp) => rsvp.isVerified) || [];
  const remainingSeats = party ? party.maxAttendees - verifiedRSVPs.length : 0;

  const fetchParty = useCallback(async () => {
    try {
      const res = await fetch(`/api/party?id=${id}`);
      if (!res.ok) throw new Error("Failed to fetch party");
      const data = await res.json();
      setParty(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch party");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchParty();
  }, [fetchParty]);

  const handleCancelRSVP = async (userEmail: string) => {
    if (!canManageRSVPs) return;
    setIsCancellingRSVP(true);

    try {
      const res = await fetch(
        `/api/party/rsvp?partyId=${id}&userEmail=${userEmail}`,
        {
          method: "DELETE",
        }
      );

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || "Failed to cancel RSVP");
      }

      toast.success("RSVP cancelled successfully!");
      await fetchParty();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to cancel RSVP"
      );
    } finally {
      setIsCancellingRSVP(false);
    }
  };

  const verifyRSVP = async (rsvpId: string) => {
    try {
      if (!params?.id) {
        throw new Error("Party ID not found");
      }

      const response = await fetch("/api/party/rsvp/verify", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ rsvpId, partyId: params.id }),
      });

      if (!response.ok) {
        throw new Error("Failed to verify RSVP");
      }

      await fetchParty();
      toast.success("RSVP verified successfully");
    } catch (error) {
      console.error("Error verifying RSVP:", error);
      toast.error("Failed to verify RSVP");
    }
  };

  if (loading) return <div className="text-white">Loading...</div>;
  if (error) return <div className="text-white">Error: {error}</div>;
  if (!party) return <div className="text-white">Party not found</div>;

  const userRSVP = party.rsvps.find(
    (rsvp) => rsvp.userEmail === session?.user?.email
  );
  const spotsLeft = party.maxAttendees - party.rsvps.length;

  return (
    <div className="bg-gray-900 shadow-xl rounded-lg p-8 max-w-4xl mx-auto">
      <div className="flex justify-between items-start mb-6">
        <h1 className="text-3xl font-bold text-white">{party.title}</h1>
        {isAdmin && (
          <div className="flex gap-2">
            {!party.isVerified && (
              <button
                disabled={isVerifying}
                onClick={async () => {
                  setIsVerifying(true);
                  try {
                    const res = await fetch(
                      `/api/parties/verify?id=${party.id}`,
                      {
                        method: "POST",
                      }
                    );
                    if (!res.ok) throw new Error("Failed to verify party");
                    await fetchParty();
                    toast.success("Party verified successfully");
                  } catch (error) {
                    console.error("Error:", error);
                    toast.error("Failed to verify party");
                  } finally {
                    setIsVerifying(false);
                  }
                }}
                className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {isVerifying ? (
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
                    <span>Verifying...</span>
                  </>
                ) : (
                  "Verify Party"
                )}
              </button>
            )}
            <button
              disabled={isDeleting}
              onClick={async () => {
                if (!confirm("Are you sure you want to delete this party?"))
                  return;
                setIsDeleting(true);
                try {
                  // First delete all RSVPs
                  await Promise.all(
                    party.rsvps.map((rsvp) =>
                      fetch(
                        `/api/party/rsvp?partyId=${party.id}&userEmail=${rsvp.userEmail}`,
                        {
                          method: "DELETE",
                        }
                      )
                    )
                  );

                  // Then delete the party
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
              }}
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

      {!party.isVerified && isAdmin && (
        <div className="mb-4 p-3 bg-yellow-500/20 border border-yellow-500 rounded-lg text-yellow-100">
          This party is pending verification. Click the verify button above to
          approve it.
        </div>
      )}

      <div className="space-y-4 mb-8">
        <p className="text-white">
          <span className="font-semibold">Date:</span> {formatDate(party.date)}
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

      {userRSVP ? (
        <div className="text-white">
          <p>You have already RSVPed to this party!</p>
          {userRSVP.alcoholRequest && (
            <p>Your alcohol request: {userRSVP.alcoholRequest}</p>
          )}
          {userRSVP.suggestion && <p>Your suggestion: {userRSVP.suggestion}</p>}
          <button
            disabled={isCancellingRSVP}
            onClick={() => handleCancelRSVP(session!.user!.email!)}
            className="px-6 py-3 text-white bg-red-500 rounded-lg font-medium hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {isCancellingRSVP ? (
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
                <span>Cancelling...</span>
              </>
            ) : (
              "Cancel My RSVP"
            )}
          </button>
        </div>
      ) : (
        <div>
          {spotsLeft === 0 ? (
            <button
              disabled
              className="px-6 py-3 text-white bg-gray-600 rounded-lg font-medium opacity-50"
            >
              Party Full
            </button>
          ) : (
            <>
              {!showRSVPForm ? (
                <button
                  onClick={() => setShowRSVPForm(true)}
                  className="px-6 py-3 text-white bg-gradient-to-r from-[#FF6B6B] to-[#4ECDC4] rounded-lg font-medium hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#4ECDC4]"
                >
                  RSVP Now
                </button>
              ) : (
                showRSVPForm && (
                  <RSVPForm
                    partyId={party.id}
                    maxAttendees={party.maxAttendees}
                    currentAttendees={party.rsvps}
                    onRSVP={() => {
                      fetchParty();
                      setShowRSVPForm(false);
                    }}
                  />
                )
              )}
            </>
          )}
        </div>
      )}

      {canManageRSVPs && party.rsvps.length > 0 && (
        <div className="mt-8">
          <h2 className="text-xl font-semibold text-white mb-4">Attendees</h2>
          {party.rsvps.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-700">
                <thead>
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                      Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                      Email
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                      RSVP Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                      Status
                    </th>
                    {isHost && (
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-300 uppercase tracking-wider">
                        Actions
                      </th>
                    )}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-700">
                  {party.rsvps.map((rsvp) => (
                    <tr key={rsvp.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-gray-300">
                        {rsvp.userName}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-gray-300">
                        {rsvp.userEmail}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-gray-300">
                        {formatDate(rsvp.createdAt)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            rsvp.isVerified
                              ? "bg-green-100 text-green-800"
                              : "bg-yellow-100 text-yellow-800"
                          }`}
                        >
                          {rsvp.isVerified ? "Verified" : "Pending"}
                        </span>
                      </td>
                      {isHost && (
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          {!rsvp.isVerified && (
                            <button
                              onClick={() => verifyRSVP(rsvp.id)}
                              className="text-indigo-400 hover:text-indigo-300"
                            >
                              Verify
                            </button>
                          )}
                          <button
                            onClick={() => handleCancelRSVP(rsvp.userEmail!)}
                            className="ml-4 text-red-400 hover:text-red-300"
                          >
                            Cancel
                          </button>
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-gray-300">No attendees yet.</p>
          )}
        </div>
      )}

      {(isHost || isAdmin) && party.rsvps.length > 0 && (
        <div className="mt-8">
          <h2 className="text-xl font-semibold text-white mb-4">Attendees</h2>
          <div className="bg-gray-800/50 rounded-lg overflow-hidden">
            <table className="min-w-full divide-y divide-gray-700">
              <thead>
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Email
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Alcohol Request
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Suggestion
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-700">
                {party.rsvps.map((rsvp) => (
                  <tr key={rsvp.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                      {rsvp.userName}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                      {rsvp.userEmail}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      {rsvp.isVerified ? (
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                          Verified
                        </span>
                      ) : (
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800">
                          Pending
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                      {rsvp.alcoholRequest || "-"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                      {rsvp.suggestion || "-"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                      {!rsvp.isVerified && (
                        <button
                          onClick={() => verifyRSVP(rsvp.id)}
                          className="text-green-400 hover:text-green-300 font-medium"
                        >
                          Verify
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
