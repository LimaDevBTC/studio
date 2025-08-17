// Agora.io Configuration
export const agoraConfig = {
    // App ID do Agora.io (você precisará criar uma conta)
    appId: process.env.NEXT_PUBLIC_AGORA_APP_ID || 'your-agora-app-id',
    
    // Configurações de vídeo
    videoConfig: {
        width: 1280,
        height: 720,
        frameRate: 30,
        bitrate: 1000, // 1 Mbps
    },
    
    // Configurações de áudio
    audioConfig: {
        sampleRate: 48000,
        channels: 2,
        bitrate: 64, // 64 kbps
    },
    
    // Configurações de transmissão
    streamConfig: {
        audio: true,
        video: true,
        screen: false,
    }
};

// URLs para diferentes ambientes
export const agoraUrls = {
    development: 'https://localhost:9002',
    production: 'https://your-domain.com',
};
