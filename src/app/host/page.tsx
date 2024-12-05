import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import HostPartyForm from "@/components/HostPartyForm";

export default async function HostParty() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/api/auth/signin");
    return;
  }

  async function createParty(formData: FormData) {
    "use server";

    const name = formData.get("name") as string;
    const date = new Date(formData.get("date") as string);
    const maxGuests = parseInt(formData.get("maxGuests") as string);
    const maleRatio = parseInt(formData.get("maleRatio") as string) || null;
    const femaleRatio = parseInt(formData.get("femaleRatio") as string) || null;
    const entryType = formData.get("entryType") as string;
    const alcoholRequests = formData.get("alcoholRequests") === "on";

    if (!session) {
      throw new Error("Session is null");
    }

    await prisma.party.create({
      data: {
        name,
        date,
        maxGuests,
        maleRatio,
        femaleRatio,
        entryType,
        alcoholRequests,
        hostId: session.user!.id,
      },
    });

    redirect("/");
  }

  return <HostPartyForm createParty={createParty} />;
}
