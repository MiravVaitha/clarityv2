import { redirect } from "next/navigation";

// The Parrot chat engine replaces the old form-based Communication page.
export default function CommunicationPage() {
    redirect("/parrot");
}
