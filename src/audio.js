/**
 * 遊戲音效管理器 - Web Audio API
 * Background Music Manager
 */

export class AudioManager {
    constructor() {
        this.audioContext = null;
        this.bgmGain = null;
        this.sfxGain = null;
        this.masterGain = null;
        this.isMuted = false;
        this.isPlaying = false;
        this.currentOscillator = null;
        this.noteInterval = null;
        this.currentNote = 0;
        
        // 簡單的背景音樂旋律 (Pac-Man 風格)
        this.melody = [
            { note: 263, duration: 0.1 },   // C4
            { note: 330, duration: 0.1 },   // E4
            { note: 392, duration: 0.1 },   // G4
            { note: 523, duration: 0.1 },   // C5
            { note: 392, duration: 0.1 },   // G4
            { note: 330, duration: 0.1 },   // E4
            { note: 263, duration: 0.1 },   // C4
            { note: 0, duration: 0.1 },     // 休止
            { note: 294, duration: 0.1 },   // D4
            { note: 349, duration: 0.1 },   // F4
            { note: 440, duration: 0.1 },   // A4
            { note: 587, duration: 0.1 },   // D5
            { note: 440, duration: 0.1 },   // A4
            { note: 349, duration: 0.1 },   // F4
            { note: 294, duration: 0.1 },   // D4
            { note: 0, duration: 0.1 },     // 休止
        ];
        
        // 快速模式旋律
        this.fastMelody = [
            { note: 263, duration: 0.06 },
            { note: 330, duration: 0.06 },
            { note: 392, duration: 0.06 },
            { note: 523, duration: 0.06 },
            { note: 392, duration: 0.06 },
            { note: 330, duration: 0.06 },
            { note: 263, duration: 0.06 },
            { note: 0, duration: 0.06 },
        ];
    }
    
    /**
     * 初始化音頻上下文
     */
    init() {
        if (this.audioContext) return;
        
        try {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
            
            // 主音量控制
            this.masterGain = this.audioContext.createGain();
            this.masterGain.gain.value = 0.5;
            this.masterGain.connect(this.audioContext.destination);
            
            // 背景音樂音量
            this.bgmGain = this.audioContext.createGain();
            this.bgmGain.gain.value = 0.3;
            this.bgmGain.connect(this.masterGain);
            
            // 音效音量
            this.sfxGain = this.audioContext.createGain();
            this.sfxGain.gain.value = 0.5;
            this.sfxGain.connect(this.masterGain);
            
            console.log('[AudioManager] Web Audio API 初始化成功');
        } catch (e) {
            console.warn('[AudioManager] Web Audio API 不支援:', e);
        }
    }
    
    /**
     * 播放單個音符
     */
    playTone(frequency, duration, type = 'square') {
        if (!this.audioContext || this.isMuted) return;
        
        if (frequency === 0) {
            // 休止符
            return new Promise(resolve => setTimeout(resolve, duration * 1000));
        }
        
        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(this.bgmGain);
        
        oscillator.type = type;
        oscillator.frequency.value = frequency;
        
        // ADSR 包絡
        const now = this.audioContext.currentTime;
        gainNode.gain.setValueAtTime(0, now);
        gainNode.gain.linearRampToValueAtTime(0.3, now + 0.01);
        gainNode.gain.exponentialRampToValueAtTime(0.1, now + duration - 0.05);
        gainNode.gain.linearRampToValueAtTime(0, now + duration);
        
        oscillator.start(now);
        oscillator.stop(now + duration);
        
        return new Promise(resolve => {
            oscillator.onended = () => resolve();
        });
    }
    
    /**
     * 開始播放背景音樂 (循環)
     */
    startBGM(fastMode = false) {
        if (this.isPlaying) return;
        
        this.init();
        this.isPlaying = true;
        this.currentNote = 0;
        
        const melody = fastMode ? this.fastMelody : this.melody;
        
        const playNextNote = () => {
            if (!this.isPlaying) return;
            
            const noteData = melody[this.currentNote];
            this.playTone(noteData.note, noteData.duration);
            
            this.currentNote = (this.currentNote + 1) % melody.length;
            
            // 安排下一個音符
            this.noteInterval = setTimeout(playNextNote, noteData.duration * 1000);
        };
        
        playNextNote();
        console.log('[AudioManager] 背景音樂開始播放');
    }
    
    /**
     * 停止背景音樂
     */
    stopBGM() {
        this.isPlaying = false;
        if (this.noteInterval) {
            clearTimeout(this.noteInterval);
            this.noteInterval = null;
        }
        console.log('[AudioManager] 背景音樂停止');
    }
    
    /**
     * 切換靜音狀態
     */
    toggleMute() {
        this.isMuted = !this.isMuted;
        if (this.masterGain) {
            this.masterGain.gain.setValueAtTime(
                this.isMuted ? 0 : 0.5, 
                this.audioContext.currentTime
            );
        }
        console.log('[AudioManager] 靜音狀態:', this.isMuted);
        return this.isMuted;
    }
    
    /**
     * 設置靜音
     */
    setMute(muted) {
        this.isMuted = muted;
        if (this.masterGain) {
            this.masterGain.gain.setValueAtTime(
                muted ? 0 : 0.5, 
                this.audioContext.currentTime
            );
        }
    }
    
    /**
     * 獲取靜音狀態
     */
    getMute() {
        return this.isMuted;
    }
    
    /**
     * 播放吃豆子的音效
     */
    playEatSound() {
        if (!this.audioContext || this.isMuted) return;
        
        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(this.sfxGain);
        
        oscillator.type = 'sine';
        oscillator.frequency.setValueAtTime(880, this.audioContext.currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(440, this.audioContext.currentTime + 0.1);
        
        gainNode.gain.setValueAtTime(0.3, this.audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.1);
        
        oscillator.start(this.audioContext.currentTime);
        oscillator.stop(this.audioContext.currentTime + 0.1);
    }
    
    /**
     * 播放能量球音效
     */
    playPowerPelletSound() {
        if (!this.audioContext || this.isMuted) return;
        
        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(this.sfxGain);
        
        oscillator.type = 'sawtooth';
        oscillator.frequency.setValueAtTime(220, this.audioContext.currentTime);
        oscillator.frequency.linearRampToValueAtTime(880, this.audioContext.currentTime + 0.2);
        
        gainNode.gain.setValueAtTime(0.4, this.audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.2);
        
        oscillator.start(this.audioContext.currentTime);
        oscillator.stop(this.audioContext.currentTime + 0.2);
    }
    
    /**
     * 播放死亡音效
     */
    playDeathSound() {
        if (!this.audioContext || this.isMuted) return;
        
        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(this.sfxGain);
        
        oscillator.type = 'sawtooth';
        oscillator.frequency.setValueAtTime(880, this.audioContext.currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(110, this.audioContext.currentTime + 0.5);
        
        gainNode.gain.setValueAtTime(0.5, this.audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.5);
        
        oscillator.start(this.audioContext.currentTime);
        oscillator.stop(this.audioContext.currentTime + 0.5);
    }
    
    /**
     * 播放勝利音效
     */
    playWinSound() {
        if (!this.audioContext || this.isMuted) return;
        
        const notes = [
            { freq: 523.25, duration: 0.15 },  // C5
            { freq: 659.25, duration: 0.15 },  // E5
            { freq: 783.99, duration: 0.15 },  // G5
            { freq: 1046.50, duration: 0.4 },  // C6
        ];
        
        notes.forEach((note, index) => {
            const oscillator = this.audioContext.createOscillator();
            const gainNode = this.audioContext.createGain();
            
            oscillator.connect(gainNode);
            gainNode.connect(this.sfxGain);
            
            const startTime = this.audioContext.currentTime + index * 0.15;
            
            oscillator.type = 'square';
            oscillator.frequency.setValueAtTime(note.freq, startTime);
            
            gainNode.gain.setValueAtTime(0, startTime);
            gainNode.gain.linearRampToValueAtTime(0.3, startTime + 0.02);
            gainNode.gain.exponentialRampToValueAtTime(0.01, startTime + note.duration);
            
            oscillator.start(startTime);
            oscillator.stop(startTime + note.duration);
        });
    }
    
    /**
     * 恢復音頻上下文 (瀏覽器自動暫停後)
     */
    resume() {
        if (this.audioContext && this.audioContext.state === 'suspended') {
            this.audioContext.resume();
        }
    }
}

// 單例導出
export const audioManager = new AudioManager();
