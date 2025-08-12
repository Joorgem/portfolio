import { Timeline } from "../components/Timeline";
import { experiences } from "../constants";

const Experiences: React.FC = () => {
  return (
    <div className="w-full">
      <Timeline data={experiences} />
    </div>
  );
};

export default Experiences;