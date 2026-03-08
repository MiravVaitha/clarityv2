import { redirect } from "next/navigation";

// The Bear chat engine replaces the old form-based Clarity page.
export default function ClarityPage() {
    redirect("/bear");
}
