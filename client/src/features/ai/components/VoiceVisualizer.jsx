import { VISUALIZER_BARS } from "../constants.js";

const VoiceVisualizer = ({ duration = 0 }) => (
  <div className="flex items-center gap-3 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
    <span className="font-semibold">Recording {duration}s</span>
    <div className="flex items-end gap-1">
      {VISUALIZER_BARS.map((heightClass, index) => (
        <span key={index} className={`w-1 animate-pulse rounded-full bg-red-500 ${heightClass}`} />
      ))}
    </div>
  </div>
);

export default VoiceVisualizer;
