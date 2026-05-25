import { useEffect, useState } from 'react';
import { Home } from 'lucide-react';

const SplashScreen = ({ onComplete }) => {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setVisible(false);
      if (onComplete) {
        onComplete();
      }
    }, 2000);

    return () => clearTimeout(timer);
  }, [onComplete]);

  if (!visible) return null;

  return (
    <div className="fixed inset-0 z-[9999] bg-white flex items-center justify-center animate-fade-in">
      <div className="flex flex-col items-center gap-6 animate-slide-up">
        <div className="w-36 h-36 rounded-[36px] bg-white shadow-lg shadow-gray-200/30 flex items-center justify-center">
          <Home className="w-20 h-20 text-[#2d5a1e]" />
        </div>
        <h1 className="text-2xl font-black text-black tracking-tight">LaporinAja</h1>
      </div>
    </div>
  );
};

export default SplashScreen;
