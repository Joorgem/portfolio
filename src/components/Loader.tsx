import { Html, useProgress } from "@react-three/drei";
import { useTranslation } from "react-i18next";

const Loader: React.FC = () => {
  const { progress } = useProgress();
  const { t } = useTranslation('common');

  return (
    <Html center className="text-xl font-normal text-center">
      {progress.toFixed(0)}% {t('buttons.loaded')}
    </Html>
  );
};

export default Loader;