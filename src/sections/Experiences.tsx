import { Timeline } from "../components/Timeline";
import { experiences } from "../constants";
import { Particles } from "../components/Particles";

const Experiences: React.FC = () => {
  return (
    <div className="relative w-full">
      <Particles
        className="absolute inset-0 -z-50"
        quantity={100}
        ease={80}
        color={"#ffffff"}
        refresh
      />
      <Timeline data={experiences} />
    </div>
  );
};

export default Experiences;