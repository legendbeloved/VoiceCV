export function listenOnce(lang = 'en-US'): Promise<string> {
  const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
  if (!SpeechRecognition) {
    return Promise.reject(new Error('This browser cannot hear an answer. Type it instead.'));
  }
  return new Promise((resolve, reject) => {
    const recognition = new SpeechRecognition();
    recognition.lang = lang;
    recognition.interimResults = false;
    recognition.onresult = (event: any) => {
      const text = event.results?.[0]?.[0]?.transcript || '';
      if (!text.trim()) reject(new Error('No speech was captured.'));
      else resolve(text.trim());
    };
    recognition.onerror = () => reject(new Error('Voice answer stopped. You can type it instead.'));
    recognition.start();
  });
}
