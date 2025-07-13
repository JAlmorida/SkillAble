class ScreenReaderService {
    constructor() {
        this.context = null;
        this.isInitialized = false;
    }

    initialize(context) {
        this.context = context;
        this.isInitialized = true;
    }

    isReady() {
        return this.isInitialized && this.context;
    }

    read(text, options = {}) {
        if (!this.isReady()) {
            console.warn('Screen Reader service is not initialized');
            return;
        }
        const {
            interrupt = false,
            priority = 'normal',
            speed = null,
            onStart = null,
            onEnd = null,
            onError = null,
        } = options;

        if (interrupt && this.context.isReading) {
            this.stop();
        }

        const delay = interrupt ? 100 : 0;

        setTimeout(() => {
            const utterance = new SpeechSynthesisUtterance(text);

            utterance.rate = speed || this.context.voiceSpeed;
            utterance.pitch = 1;
            utterance.volume = 1;

            if (priority === 'high') {
                utterance.rate = Math.min(utterance.rate * 1.2, 2);
            } else if (priority === 'low') {
                utterance.rate = Math.max(utterance.rate * 0.8, 0.5);
            }

            utterance.onStart = () => {
                this.context.setIsReading(true);
                if (onStart) onStart();
            };

            utterance.onEnd = () => {
                this.context.setIsReading(false);
                this.context.setCurrentUtterance(null);
                if (onEnd) onEnd();
            }

            utterance.onError = (event) => {
                if (event.error !== 'interrupted') {
                    console.error('Speech synthesis error:', event.error);
                }
                this.context.setIsReading(false);
                this.context.setCurrentUtterance(null);
                if (onError) onError(event)
            };
            this.context.setCurrentUtterance(utterance);
            speechSynthesis.speak(utterance);
        }, delay);
    }

    stop() {
        if (!this.isReady()) return;

        if (SpeechSynthesis) {
            speechSynthesis.cancel();
            setTimeout(() => speechSynthesis.cancel(), 10);
        }
        this.context.setIsReading(false);
        this.context.setCurrentUtterance(null);
    }

    pause() {
        if (!this.isReady()) return;

        if (speechSynthesis && speechSynthesis.pause) {
            speechSynthesis.pause();
        }
    }

    resume() {
        if (!this.isReady()) return;

        if (speechSynthesis && speechSynthesis.resume) {
            speechSynthesis.resume();
        }
    }

    getStatus() {
        if (!this.isReady()) {
            return { enabled: false, reading: false, initialized: false };
        }
        return {
            enabled: this.context.isEnabled,
            reading: this.context.isReading,
            initialized: true,
            speed: this.context.voiceSpeed,
            speechSupported: this.context.speechSupported
        }
    }

    setSpeed(speed) {
        if (!this.isReady()) return;
        this.context.setVoiceSpeed(speed);
    }

    toggle() {
        if (!this.isReady()) return;
        this.context.setIsEnabled(!this.context.isEnabled);
    }

    enable() {
        if (!this.isReady()) return;
        this.context.setIsEnabled(true)
    }

    disable() {
        if (!this.isReady()) return;
        this.context.setIsEnabled(false);
    }

    readWithQueue(textArray, options = {}) {
        if (!this.isReady() || !Array.isArray(textArray)) return;

        const {
            pauseBetween = 500,
            onComplete = null
        } = options;

        let currentIndex = 0;

        const readNext = () => {
            if (currentIndex >= textArray.length) {
                if (onComplete) onComplete();
                return;
            }

            const text = textArray[currentIndex];
            currentIndex++;

            this.read(text, {
                ...options,
                onEnd: () => {
                    setTimeout(readNext, pauseBetween);
                }
            });
        };
        readNext();
    }

    readFormErrors(errors) {
        if (!this.isReady || !errors || Object.keys(errors).length === 0) return;

        const errorMessages = Object.entries(errors).map(([field, message]) => {
            return `${field}: ${message}`
        });
        this.read(`Form has ${errorMessages.length}: errors: ${errorMessages.join('. ')}`, {
            priority: 'high',
            interrupt: true
        });
    }
    readerSucces(message) {
        this.read(message, {
            priority: 'high',
            interrupt: false,
            speed: 1.1
        });
    }

    readWarning(message) {
        this.read(`Warning: ${message}`, {
            priority: 'high',
            interrupt: true,
            speed: 0.9
        })
    }

    readError(message) {
        this.read(`Error: ${message}`, {
            priority: 'high', 
            interrupt: true, 
            speed: 0.8, 
        })
    }
}

const screenReaderService = new ScreenReaderService();

export default screenReaderService;
