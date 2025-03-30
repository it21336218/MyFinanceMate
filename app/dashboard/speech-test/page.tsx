"use client";

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import {
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  Copy,
  AlertTriangle,
  Loader2,
} from "lucide-react";

// AssemblyAI API key
const ASSEMBLY_AI_API_KEY = "530b31ec423e46aa9994165c543b4e49";

export default function SpeechTestPage() {
  // Speech-to-Text state
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [isSafari, setIsSafari] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);

  // Refs
  const recognitionRef = useRef<any>(null);
  const socketRef = useRef<WebSocket | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Text-to-Speech state
  const [textToSpeak, setTextToSpeak] = useState(
    "Hello! This is a test of the speech synthesis functionality."
  );
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [selectedVoice, setSelectedVoice] = useState("");
  const [rate, setRate] = useState(1);
  const [pitch, setPitch] = useState(1);
  const [synthesisSupported, setSynthesisSupported] = useState(true);

  const { toast } = useToast();

  // Check browser type and speech recognition support
  useEffect(() => {
    // Detect Safari
    const userAgent = window.navigator.userAgent.toLowerCase();
    const isSafariBrowser =
      userAgent.indexOf("safari") > -1 && userAgent.indexOf("chrome") === -1;
    setIsSafari(isSafariBrowser);

    // Initialize TTS
    if (!("speechSynthesis" in window)) {
      setSynthesisSupported(false);
    } else {
      // Load available voices
      const loadVoices = () => {
        const availableVoices = window.speechSynthesis.getVoices();
        if (availableVoices.length > 0) {
          setVoices(availableVoices);
          setSelectedVoice(availableVoices[0].name);
        }
      };

      loadVoices();

      if (window.speechSynthesis.onvoiceschanged !== undefined) {
        window.speechSynthesis.onvoiceschanged = loadVoices;
      }
    }

    // Clean up
    return () => {
      if (isListening) {
        stopListening();
      }

      if (window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  // Setup Safari speech recognition
  const setupSafariSpeechRecognition = () => {
    if (!("webkitSpeechRecognition" in window)) {
      toast({
        title: "Speech Recognition Not Supported",
        description: "Your browser doesn't support speech recognition.",
        variant: "destructive",
      });
      return false;
    }

    try {
      const SpeechRecognition = (window as any).webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;
      recognitionRef.current.lang = "en-US";

      // Handle results
      recognitionRef.current.onresult = (event: any) => {
        let interimTranscript = "";
        let finalTranscript = "";

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            finalTranscript += transcript + " ";
          } else {
            interimTranscript += transcript;
          }
        }

        setTranscript(finalTranscript || interimTranscript);
      };

      // Handle errors
      recognitionRef.current.onerror = (event: any) => {
        console.error("Speech recognition error:", event.error);

        if (event.error === "not-allowed") {
          toast({
            title: "Permission Denied",
            description:
              "Please allow microphone access in your browser settings.",
            variant: "destructive",
          });
        } else {
          toast({
            title: "Recognition Error",
            description: `${event.error}. Try refreshing the page.`,
            variant: "destructive",
          });
        }

        setIsListening(false);
      };

      // Handle end of recognition
      recognitionRef.current.onend = () => {
        if (isListening) {
          try {
            recognitionRef.current.start();
          } catch (e) {
            console.error("Error restarting recognition:", e);
            setIsListening(false);
          }
        }
      };

      return true;
    } catch (error) {
      console.error("Failed to initialize speech recognition:", error);
      return false;
    }
  };

  // Start listening with AssemblyAI for Chrome/Edge/etc.
  const startChromiumListening = async () => {
    try {
      // Request microphone permission
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      // Create WebSocket connection to AssemblyAI
      socketRef.current = new WebSocket(
        "wss://api.assemblyai.com/v2/realtime/ws?sample_rate=16000"
      );

      // Set up WebSocket event handlers
      socketRef.current.onopen = () => {
        if (socketRef.current) {
          socketRef.current.send(
            JSON.stringify({ token: ASSEMBLY_AI_API_KEY })
          );

          // Initialize MediaRecorder
          try {
            const options = {
              mimeType: "audio/webm",
            };
            mediaRecorderRef.current = new MediaRecorder(stream, options);

            // Handle audio data
            mediaRecorderRef.current.ondataavailable = (event) => {
              if (
                event.data.size > 0 &&
                socketRef.current?.readyState === WebSocket.OPEN
              ) {
                // Convert audio data to base64 and send to AssemblyAI
                const reader = new FileReader();
                reader.onload = () => {
                  if (socketRef.current?.readyState === WebSocket.OPEN) {
                    const base64Audio = (reader.result as string).split(",")[1];
                    socketRef.current.send(
                      JSON.stringify({ audio_data: base64Audio })
                    );
                  }
                };
                reader.readAsDataURL(event.data);
              }
            };

            // Start recording in small chunks
            mediaRecorderRef.current.start(250);
            setIsListening(true);
            setTranscript("");
          } catch (err) {
            console.error("MediaRecorder error:", err);
            toast({
              title: "Recording Error",
              description:
                "Could not start audio recording. Please try a different browser.",
              variant: "destructive",
            });
            stopListening();
          }
        }
      };

      // Handle incoming transcription
      socketRef.current.onmessage = (message) => {
        const response = JSON.parse(message.data);
        if (response.message_type === "FinalTranscript") {
          setTranscript((prev) => prev + " " + response.text);
        }
      };

      // Handle WebSocket errors
      socketRef.current.onerror = (event) => {
        console.error("WebSocket error:", event);
        toast({
          title: "Connection Error",
          description: "Failed to connect to transcription service.",
          variant: "destructive",
        });
        stopListening();
      };

      // Handle WebSocket close
      socketRef.current.onclose = () => {
        stopListening();
      };
    } catch (error) {
      console.error("Failed to start listening:", error);

      if (error instanceof DOMException && error.name === "NotAllowedError") {
        toast({
          title: "Permission Denied",
          description:
            "Please allow microphone access in your browser settings.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Initialization Error",
          description:
            "Failed to initialize speech recognition. Please try again.",
          variant: "destructive",
        });
      }

      setIsListening(false);
    }
  };

  // Start Safari listening
  const startSafariListening = () => {
    if (!recognitionRef.current) {
      if (!setupSafariSpeechRecognition()) {
        return;
      }
    }

    try {
      recognitionRef.current.start();
      setIsListening(true);
      setTranscript("");
    } catch (error) {
      console.error("Error starting speech recognition:", error);

      // If already started error, try stopping first then starting again
      if (error instanceof DOMException && error.name === "InvalidStateError") {
        try {
          recognitionRef.current.stop();
          setTimeout(() => {
            recognitionRef.current.start();
            setIsListening(true);
          }, 100);
        } catch (retryError) {
          console.error("Error restarting speech recognition:", retryError);
          toast({
            title: "Start Error",
            description:
              "Failed to start speech recognition. Please refresh the page.",
            variant: "destructive",
          });
        }
      } else {
        toast({
          title: "Start Error",
          description: "Failed to start speech recognition. Please try again.",
          variant: "destructive",
        });
      }
    }
  };

  // Combined start listening function
  const startListening = () => {
    if (isSafari) {
      startSafariListening();
    } else {
      startChromiumListening();
    }
  };

  // Stop listening
  const stopListening = () => {
    setIsListening(false);

    // Stop Safari speech recognition
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (error) {
        console.error("Error stopping speech recognition:", error);
      }
    }

    // Stop AssemblyAI and media recording
    if (socketRef.current) {
      if (socketRef.current.readyState === WebSocket.OPEN) {
        socketRef.current.send(JSON.stringify({ terminate_session: true }));
      }
      socketRef.current.close();
      socketRef.current = null;
    }

    if (
      mediaRecorderRef.current &&
      mediaRecorderRef.current.state !== "inactive"
    ) {
      try {
        mediaRecorderRef.current.stop();
      } catch (error) {
        console.error("Error stopping media recorder:", error);
      }
      mediaRecorderRef.current = null;
    }

    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => {
        track.stop();
      });
      streamRef.current = null;
    }
  };

  // Text-to-Speech functions
  const speak = () => {
    if (!synthesisSupported || !textToSpeak.trim()) return;

    // Cancel any ongoing speech
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(textToSpeak);

    // Set voice if selected
    if (selectedVoice) {
      const voice = voices.find((v) => v.name === selectedVoice);
      if (voice) utterance.voice = voice;
    }

    // Set rate and pitch
    utterance.rate = rate;
    utterance.pitch = pitch;

    // Set events
    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => {
      setIsSpeaking(false);
      toast({
        title: "Error",
        description: "Failed to speak the text. Please try again.",
        variant: "destructive",
      });
    };

    // Start speaking
    window.speechSynthesis.speak(utterance);
  };

  const stopSpeaking = () => {
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    }
  };

  return (
    <div className="container mx-auto max-w-3xl px-4 py-8">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold tracking-tight mb-2">Speech Test</h1>
        <p className="text-muted-foreground text-lg">
          Test speech recognition and synthesis functionality.
        </p>
      </div>

      <Tabs defaultValue="speech-to-text" className="space-y-8">
        <TabsList className="grid w-full grid-cols-2 max-w-md mx-auto">
          <TabsTrigger value="speech-to-text">Speech to Text</TabsTrigger>
          <TabsTrigger value="text-to-speech">Text to Speech</TabsTrigger>
        </TabsList>

        {/* Speech to Text Tab */}
        <TabsContent value="speech-to-text">
          <Card className="border-2">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl">Speech Recognition</CardTitle>
              <CardDescription className="text-base">
                Click the button and speak to convert your speech to text.
                {!isSafari && (
                  <span className="block mt-1 text-xs opacity-75">
                    Using AssemblyAI for better accuracy
                  </span>
                )}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="max-w-sm mx-auto">
                <Button
                  onClick={isListening ? stopListening : startListening}
                  variant={isListening ? "destructive" : "default"}
                  className="w-full h-12 text-lg"
                >
                  {isListening ? (
                    <>
                      <MicOff className="mr-2 h-5 w-5" /> Stop Listening
                    </>
                  ) : (
                    <>
                      <Mic className="mr-2 h-5 w-5" /> Start Listening
                    </>
                  )}
                </Button>
              </div>

              {isListening && (
                <div className="flex items-center justify-center gap-3 text-base">
                  <div className="relative flex h-4 w-4">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-4 w-4 bg-red-500"></span>
                  </div>
                  <p className="font-medium">Listening...</p>
                </div>
              )}

              {isTranscribing && (
                <div className="flex items-center justify-center gap-3 text-base">
                  <Loader2 className="h-4 w-4 animate-spin text-primary" />
                  <p className="font-medium">Transcribing...</p>
                </div>
              )}

              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <Label htmlFor="transcript" className="text-lg">
                    Transcript
                  </Label>
                  {transcript && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={async () => {
                        try {
                          await navigator.clipboard.writeText(transcript);
                          toast({
                            title: "Copied",
                            description: "Transcript copied to clipboard",
                          });
                        } catch (err) {
                          toast({
                            title: "Copy Failed",
                            description: "Could not copy to clipboard.",
                            variant: "destructive",
                          });
                        }
                      }}
                      className="hover:bg-secondary"
                    >
                      <Copy className="h-4 w-4 mr-2" />
                      Copy
                    </Button>
                  )}
                </div>
                <Textarea
                  id="transcript"
                  value={transcript}
                  onChange={(e) => setTranscript(e.target.value)}
                  placeholder={
                    isListening
                      ? "Speak now..."
                      : "Click 'Start Listening' and speak..."
                  }
                  className="min-h-[200px] text-lg p-4"
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Text to Speech Tab */}
        <TabsContent value="text-to-speech">
          <Card className="border-2">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl">Speech Synthesis</CardTitle>
              <CardDescription className="text-base">
                Enter text and click the button to hear it spoken.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-3">
                <Label htmlFor="text-to-speak" className="text-lg">
                  Text to Speak
                </Label>
                <Textarea
                  id="text-to-speak"
                  value={textToSpeak}
                  onChange={(e) => setTextToSpeak(e.target.value)}
                  placeholder="Enter text to be spoken..."
                  className="min-h-[100px] text-lg p-4"
                />
              </div>

              {synthesisSupported && (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-3">
                      <Label htmlFor="voice" className="text-lg">
                        Voice
                      </Label>
                      <select
                        id="voice"
                        value={selectedVoice}
                        onChange={(e) => setSelectedVoice(e.target.value)}
                        className="flex h-12 w-full rounded-md border-2 border-input bg-background px-4 py-2 text-base ring-offset-background file:border-0 file:bg-transparent file:text-base file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        {voices.map((voice) => (
                          <option key={voice.name} value={voice.name}>
                            {voice.name} ({voice.lang})
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="space-y-3">
                      <Label htmlFor="rate" className="text-lg">
                        Rate: {rate}
                      </Label>
                      <Input
                        id="rate"
                        type="range"
                        min="0.5"
                        max="2"
                        step="0.1"
                        value={rate}
                        onChange={(e) =>
                          setRate(Number.parseFloat(e.target.value))
                        }
                        className="h-12"
                      />
                    </div>

                    <div className="space-y-3">
                      <Label htmlFor="pitch" className="text-lg">
                        Pitch: {pitch}
                      </Label>
                      <Input
                        id="pitch"
                        type="range"
                        min="0.5"
                        max="2"
                        step="0.1"
                        value={pitch}
                        onChange={(e) =>
                          setPitch(Number.parseFloat(e.target.value))
                        }
                        className="h-12"
                      />
                    </div>
                  </div>

                  <div className="flex gap-3 max-w-sm mx-auto">
                    <Button
                      onClick={speak}
                      disabled={isSpeaking || !textToSpeak.trim()}
                      className="flex-1 h-12 text-lg"
                    >
                      <Volume2 className="mr-2 h-5 w-5" /> Speak
                    </Button>
                    <Button
                      onClick={stopSpeaking}
                      variant="outline"
                      disabled={!isSpeaking}
                      className="h-12 text-lg"
                    >
                      <VolumeX className="mr-2 h-5 w-5" /> Stop
                    </Button>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
