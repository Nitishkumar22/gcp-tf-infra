import { useNavigate } from "react-router-dom";

const OnboardingPopup = ({ onClose }) => {
  const navigate = useNavigate();

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white p-6 rounded-lg shadow-lg max-w-sm text-center">
        <h2 className="text-xl font-semibold">Complete Your Onboarding</h2>
        <p className="text-gray-600 mt-2">You need to complete onboarding to access all features.</p>
        <div className="mt-4">
          <button
            className="bg-blue-600 text-white px-4 py-2 rounded-lg mr-2"
            onClick={() => navigate("/onboarding")}
          >
            Complete Now
          </button>
          <button className="text-gray-600" onClick={onClose}>
            Maybe Later
          </button>
        </div>
      </div>
    </div>
  );
};

export default OnboardingPopup;
