const NOTE_NAMES = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];

function getSupportedMimeType() {
    if (typeof MediaRecorder === "undefined" || !MediaRecorder.isTypeSupported) {
        return "";
    }

    return ["audio/webm;codecs=opus", "audio/webm", "audio/mp4"].find((type) => MediaRecorder.isTypeSupported(type)) || "";
}

function estimateFrequency(samples, sampleRate) {
    let rms = 0;
    for (let index = 0; index < samples.length; index += 1) {
        rms += samples[index] * samples[index];
    }

    if (Math.sqrt(rms / samples.length) < 0.015) {
        return 0;
    }

    const minOffset = Math.floor(sampleRate / 1000);
    const maxOffset = Math.min(Math.floor(sampleRate / 80), samples.length - 1);
    let bestOffset = -1;
    let bestCorrelation = 0;

    for (let offset = minOffset; offset <= maxOffset; offset += 1) {
        let correlation = 0;
        for (let index = 0; index < samples.length - offset; index += 1) {
            correlation += samples[index] * samples[index + offset];
        }

        if (correlation > bestCorrelation) {
            bestCorrelation = correlation;
            bestOffset = offset;
        }
    }

    return bestOffset > 0 ? sampleRate / bestOffset : 0;
}

function frequencyToNote(frequency) {
    if (!frequency || frequency < 80 || frequency > 1000) {
        return "";
    }

    const midi = Math.round(69 + (12 * Math.log2(frequency / 440)));
    return NOTE_NAMES[((midi % 12) + 12) % 12];
}

export class LiveWorshipAssistant {
    constructor({ onChunk, onTone, onState, chunkDurationMs = 10000 }) {
        this.onChunk = onChunk;
        this.onTone = onTone;
        this.onState = onState;
        this.chunkDurationMs = chunkDurationMs;
        this.stream = null;
        this.audioContext = null;
        this.recorder = null;
        this.analyser = null;
        this.toneTimer = null;
        this.chunkTimer = null;
        this.isRecording = false;
        this.mimeType = "";
        this.noteHistory = [];
    }

    async start() {
        if (!navigator.mediaDevices?.getUserMedia || typeof MediaRecorder === "undefined") {
            throw new Error("Este navegador nao suporta escuta ao vivo.");
        }

        this.onState?.("requesting");
        this.stream = await navigator.mediaDevices.getUserMedia({
            audio: {
                echoCancellation: true,
                noiseSuppression: true,
                autoGainControl: true
            }
        });

        this.audioContext = new AudioContext();
        const source = this.audioContext.createMediaStreamSource(this.stream);
        this.analyser = this.audioContext.createAnalyser();
        this.analyser.fftSize = 2048;
        source.connect(this.analyser);

        const mimeType = getSupportedMimeType();
        this.mimeType = mimeType;
        this.isRecording = true;
        this.startRecordingCycle();
        this.toneTimer = window.setInterval(() => this.captureTone(), 900);
        this.onState?.("listening");
    }

    startRecordingCycle() {
        if (!this.isRecording || !this.stream) {
            return;
        }

        const chunks = [];
        const recorder = this.mimeType ? new MediaRecorder(this.stream, { mimeType: this.mimeType }) : new MediaRecorder(this.stream);

        this.recorder = recorder;
        recorder.addEventListener("dataavailable", (event) => {
            if (event.data?.size > 0) {
                chunks.push(event.data);
            }
        });
        recorder.addEventListener("stop", () => {
            if (this.recorder === recorder) {
                this.recorder = null;
            }

            const type = recorder.mimeType || this.mimeType || "audio/webm";
            const audio = new Blob(chunks, { type });
            if (audio.size > 0 && this.isRecording) {
                this.onChunk?.(audio, this.getEstimatedTone());
            }

            this.startRecordingCycle();
        });

        recorder.start();
        this.chunkTimer = window.setTimeout(() => {
            if (recorder.state !== "inactive") {
                recorder.stop();
            }
        }, this.chunkDurationMs);
    }

    captureTone() {
        if (!this.analyser || !this.audioContext) {
            return;
        }

        const samples = new Float32Array(this.analyser.fftSize);
        this.analyser.getFloatTimeDomainData(samples);
        const note = frequencyToNote(estimateFrequency(samples, this.audioContext.sampleRate));

        if (!note) {
            return;
        }

        this.noteHistory.push(note);
        this.noteHistory = this.noteHistory.slice(-18);
        this.onTone?.(this.getEstimatedTone());
    }

    getEstimatedTone() {
        if (this.noteHistory.length === 0) {
            return "";
        }

        const counts = this.noteHistory.reduce((accumulator, note) => {
            accumulator[note] = (accumulator[note] || 0) + 1;
            return accumulator;
        }, {});

        return Object.entries(counts).sort((left, right) => right[1] - left[1])[0][0];
    }

    async stop() {
        window.clearInterval(this.toneTimer);
        window.clearTimeout(this.chunkTimer);
        this.toneTimer = null;
        this.chunkTimer = null;
        this.isRecording = false;

        if (this.recorder && this.recorder.state !== "inactive") {
            this.recorder.stop();
        }
        this.stream?.getTracks().forEach((track) => track.stop());
        await this.audioContext?.close();

        this.recorder = null;
        this.stream = null;
        this.audioContext = null;
        this.analyser = null;
        this.mimeType = "";
        this.onState?.("stopped");
    }
}
