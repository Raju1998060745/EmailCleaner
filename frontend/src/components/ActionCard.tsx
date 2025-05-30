import React from "react";
import { Loader2 } from "lucide-react";

interface ActionCardProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  buttonText: string;
  onClick: () => void;
  isLoading?: boolean;
  disabled?: boolean;
  gradient: string;
}

const ActionCard: React.FC<ActionCardProps> = ({
  title,
  description,
  icon,
  buttonText,
  onClick,
  isLoading = false,
  disabled = false,
  gradient,
}) => {
  const isDisabled = disabled || isLoading;

  return (
    <div className="card p-6 shine-effect">
      <div className="flex items-center mb-4">
        <div
          className={`w-10 h-10 rounded-full flex items-center justify-center bg-gradient-to-r ${gradient}`}
        >
          {icon}
        </div>
        <h3 className="text-xl font-semibold ml-3">{title}</h3>
      </div>
      <p className="text-gray-400 mb-6">{description}</p>
      <button
        onClick={onClick}
        disabled={isDisabled}
        className={`w-full py-2.5 px-4 rounded-lg flex items-center justify-center ${
          isDisabled ? "opacity-70 cursor-not-allowed" : "hover:opacity-90"
        } bg-gradient-to-r ${gradient} transition-all duration-200`}
      >
        {isLoading ? (
          <>
            <Loader2 size={18} className="animate-spin mr-2" /> Processing...
          </>
        ) : (
          buttonText
        )}
      </button>
    </div>
  );
};

export default ActionCard;
