import AsideCard from "../AsideCard";
import DetailsCardTab from "./DetailsCardTab";

interface DetailsCardProps {
  selectedTarget?: any;
  ownVesselData?: any;
}

export default function DetailsCard({ selectedTarget, ownVesselData }: DetailsCardProps) {
  return (
    <AsideCard>
      <DetailsCardTab 
        selectedTarget={selectedTarget}
        ownVesselData={ownVesselData}
      />
    </AsideCard>
  );
}