import { ainmationDefaultOptions } from "../../../../lib/utils"
import { useLottie } from "lottie-react"
const EmptyChatContainer = () => {
  // Use the modern lottie-react hook instead of the deprecated react-lottie
  const { View: LottieView } = useLottie({
    animationData: ainmationDefaultOptions.animationData,
    loop: ainmationDefaultOptions.loop,
    autoplay: ainmationDefaultOptions.autoplay,
    rendererSettings: ainmationDefaultOptions.rendererSettings
  });

  return (
    <div className='flex-1 flex flex-col justify-center items-center duration-1000 transition-all p-4'>
      <div style={{ width: 150, height: 150 }}>
        {LottieView}
      </div>
      <div className="text-opacity-80 text-black flex flex-col gap-3 items-center mt-6 
      md:text-3xl text-xl transition-all duration-300 text-center">
        <h3 className="poppins-medium">
          Hi <span className="text-black">!</span> Welcome to
          <span className="text-black"> Cinemates</span> Chat
        </h3>
        <p className="text-sm text-gray-500 max-w-md">
          Select a conversation from the sidebar or start a new chat to begin messaging
        </p>
      </div>
    </div>
  )
}

export default EmptyChatContainer