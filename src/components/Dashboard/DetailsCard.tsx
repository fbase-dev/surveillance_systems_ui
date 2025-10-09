import AsideCard from "../AsideCard";
import DetailsCardTab from "./DetailsCardTab";

interface DetailsCardProps {
  selectedTarget?: any;
  ownVesselData?: any;
}

export default function RaderDetailsCard({ selectedTarget, ownVesselData }: DetailsCardProps) {
  return (
    <AsideCard>
      <DetailsCardTab selectedTarget={selectedTarget} ownVesselData={ownVesselData} />
    </AsideCard>
  );
}