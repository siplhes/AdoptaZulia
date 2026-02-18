import type { CapacitorConfig } from '@capacitor/cli'

const config: CapacitorConfig = {
  appId: 'com.adoptazulia.app',
  appName: 'Adopta Zulia',
  webDir: 'dist',
  server: {
    androidScheme: 'https',
  },
  plugins: {
    StatusBar: {
      style: 'LIGHT',
      backgroundColor: '#059669',
    },
    Camera: {
      promptLabelPhoto: 'Seleccionar foto',
      promptLabelPicture: 'Tomar foto',
    },
  },
}

export default config
