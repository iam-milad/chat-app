import { useState, useRef } from "react";
import { Mic, Send, Trash2 } from "lucide-react";
import { useChatStore } from "../store/useChatStore";
import { useAuthStore } from "../store/useAuthStore";

const Recorder = ({ isRecording, setIsRecording }) => {
  const [seconds, setSeconds] = useState(0);
  const audioActionRef = useRef("STOP");
  const [audioAction, setAudioAction] = useState("STOP");
  const { authUser } = useAuthStore();
  const { sendAudioMessage, isUserRecordingAudio, selectedUser } =
    useChatStore();

  const mediaStream = useRef(null);
  const mediaRecorder = useRef(null);
  const chunks = useRef([]);

  const startRecording = async () => {
    setIsRecording(true);
    isUserRecordingAudio(authUser._id, selectedUser._id, true);
    try {
      setSeconds(0);
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaStream.current = stream;
      mediaRecorder.current = new MediaRecorder(stream);
      mediaRecorder.current.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunks.current.push(e.data);
        }
      };
      const timer = setInterval(() => {
        setSeconds((prev) => prev + 1);
      }, 1000);

      mediaRecorder.current.onstop = () => {
        const recordedBlob = new Blob(chunks.current, { type: "audio/mp3" });
        const url = URL.createObjectURL(recordedBlob);

        chunks.current = [];
        clearTimeout(timer);

        if (audioActionRef.current === "SEND") {
          sendAudioMessage(recordedBlob);
        }
      };

      mediaRecorder.current.start();
    } catch (error) {
      console.log(error);
    }
  };

  const stopRecording = (audioAction) => {
    audioActionRef.current = audioAction;
    setIsRecording(false);
    isUserRecordingAudio(authUser._id, selectedUser._id, false);
    if (mediaRecorder.current) {
      mediaRecorder.current.stop();
      mediaStream.current.getTracks().forEach((track) => track.stop());
    }
  };

  const formatTime = (totalSeconds) => {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const secs = totalSeconds % 60;

    return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(
      2,
      "0"
    )}:${String(secs).padStart(2, "0")}`;
  };

  return (
    <div
      className={isRecording ? "flex-1 flex items-center justify-between" : ""}
    >
      {isRecording && (
        <>
          <Trash2 className="cursor-pointer" size={20} onClick={() => stopRecording("STOP")} />
          <time>{formatTime(seconds)}</time>
        </>
      )}

      {isRecording ? (
        <button
          type="submit"
          className="btn btn-sm btn-circle"
          onClick={() => stopRecording("SEND")}
        >
          <Send size={22} />
        </button>
      ) : (
        <button
          type="submit"
          className="btn btn-sm btn-circle"
          onClick={startRecording}
        >
          <Mic size={22} />
        </button>
      )}

      {/* {recordedURL && <audio controls src={recordedURL} />} */}
    </div>
  );
};

export default Recorder;
