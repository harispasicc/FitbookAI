import { redirect } from "next/navigation";
export default function LegacyTrainersIndexRedirect() {
    redirect("/coaches");
}
