import { useVideoFeed } from "@/hooks/useVideoFeed";
import CamCard from "../CamCard";
import { useRouter } from "next/navigation";

export default function DashboardCamCard() {
  const { streamURLs } = useVideoFeed();
  const router = useRouter();

  return (
    <CamCard title="Cam 1" streamUrl={streamURLs.stream_1} onClick={()=> router.push("/admin/cameras")} />
  );
}
