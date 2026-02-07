
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  // 만약 리포지토리 이름이 'my-app'이라면 base를 '/my-app/'으로 바꿔야 할 수도 있습니다.
  // 안전하게 './'를 사용하거나, 루트 도메인이면 '/'를 사용합니다.
  base: './', 
  define: {
    // 빌드 시점에 환경 변수를 코드에 주입합니다.
    'process.env.API_KEY': JSON.stringify(process.env.VITE_API_KEY || process.env.API_KEY)
  }
});
