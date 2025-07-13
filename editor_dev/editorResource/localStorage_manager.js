// localStorage 管理器 - 处理本地数据存储和加载
class LocalStorageManager {
    constructor() {
        this.storageKeys = {
            gameData: 'gameData',
            enemySpawnData: 'enemy_spawn_data.json',
            enemy0: 'enemy0.png',
            enemy1: 'enemy1.png',
            enemy2: 'enemy2.png',
            enemy3: 'enemy3.png',
            bgm: 'bgm.mp3'
        };
    }

    /**
     * 保存文件到 localStorage (转换为 base64)
     */
    saveFile(key, file) {
        if (!file) return Promise.resolve();
        
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (e) => {
                try {
                    const fileData = {
                        name: file.name,
                        type: file.type,
                        size: file.size,
                        lastModified: file.lastModified,
                        data: e.target.result
                    };
                    localStorage.setItem(key, JSON.stringify(fileData));
                    resolve();
                } catch (error) {
                    reject(error);
                }
            };
            reader.onerror = reject;
            reader.readAsDataURL(file);
        });
    }

    /**
     * 从 localStorage 加载文件
     */
    loadFile(key) {
        try {
            const stored = localStorage.getItem(key);
            if (!stored) return null;
            
            const fileData = JSON.parse(stored);
            // 将 base64 转换回 File 对象
            const byteString = atob(fileData.data.split(',')[1]);
            const arrayBuffer = new ArrayBuffer(byteString.length);
            const view = new Uint8Array(arrayBuffer);
            for (let i = 0; i < byteString.length; i++) {
                view[i] = byteString.charCodeAt(i);
            }
            
            return new File([arrayBuffer], fileData.name, { 
                type: fileData.type,
                lastModified: fileData.lastModified 
            });
        } catch (error) {
            console.error('加载文件失败:', error);
            return null;
        }
    }

    /**
     * 保存游戏基本信息
     */
    saveGameData(gameData) {
        const dataToSave = {
            title: gameData.title,
            description: gameData.description,
            status: gameData.status,
            lastSaved: new Date().toISOString()
        };
        localStorage.setItem(this.storageKeys.gameData, JSON.stringify(dataToSave));
    }

    /**
     * 加载游戏基本信息
     */
    loadGameData() {
        try {
            const saved = localStorage.getItem(this.storageKeys.gameData);
            if (saved) {
                return JSON.parse(saved);
            }
        } catch (error) {
            console.error('加载游戏数据失败:', error);
        }
        return null;
    }

    /**
     * 保存敌人生成数据
     */
    saveEnemySpawnData(data) {
        localStorage.setItem(this.storageKeys.enemySpawnData, JSON.stringify(data));
    }

    /**
     * 加载敌人生成数据
     */
    loadEnemySpawnData() {
        try {
            const saved = localStorage.getItem(this.storageKeys.enemySpawnData);
            if (saved) {
                return JSON.parse(saved);
            }
        } catch (error) {
            console.error('加载敌人数据失败:', error);
        }
        return null;
    }

    /**
     * 保存敌人头像文件
     */
    async saveEnemyFile(index, file) {
        const key = this.storageKeys[`enemy${index}`];
        await this.saveFile(key, file);
    }

    /**
     * 加载敌人头像文件
     */
    loadEnemyFile(index) {
        const key = this.storageKeys[`enemy${index}`];
        return this.loadFile(key);
    }

    /**
     * 保存背景音乐文件
     */
    async saveBGMFile(file) {
        await this.saveFile(this.storageKeys.bgm, file);
    }

    /**
     * 加载背景音乐文件
     */
    loadBGMFile() {
        return this.loadFile(this.storageKeys.bgm);
    }

    /**
     * 加载所有数据到 gameData
     */
    loadAllDataToGameData() {
        if (!window.gameData) return;

        // 加载基本信息
        const basicData = this.loadGameData();
        if (basicData) {
            window.gameData.title = basicData.title || window.gameData.title;
            window.gameData.description = basicData.description || window.gameData.description;
            window.gameData.status = basicData.status || window.gameData.status;
        }

        // 加载敌人头像
        for (let i = 0; i < 4; i++) {
            const file = this.loadEnemyFile(i);
            if (file) {
                window.gameData.enemyFiles[i] = file;
            }
        }

        // 加载背景音乐
        const bgmFile = this.loadBGMFile();
        if (bgmFile) {
            window.gameData.audioFile = bgmFile;
        }

        // 加载敌人生成数据
        const enemyData = this.loadEnemySpawnData();
        if (enemyData) {
            window.gameData.enemySpawnData = enemyData;
        }
    }

    /**
     * 保存所有数据从 gameData
     */
    async saveAllDataFromGameData() {
        if (!window.gameData) return;

        // 保存基本信息
        this.saveGameData(window.gameData);

        // 保存敌人头像
        for (let i = 0; i < 4; i++) {
            if (window.gameData.enemyFiles[i]) {
                await this.saveEnemyFile(i, window.gameData.enemyFiles[i]);
            }
        }

        // 保存背景音乐
        if (window.gameData.audioFile) {
            await this.saveBGMFile(window.gameData.audioFile);
        }

        // 保存敌人生成数据
        if (window.gameData.enemySpawnData) {
            this.saveEnemySpawnData(window.gameData.enemySpawnData);
        }
    }

    /**
     * 清除所有数据
     */
    clearAllData() {
        Object.values(this.storageKeys).forEach(key => {
            localStorage.removeItem(key);
        });
    }

    /**
     * 获取存储使用情况
     */
    getStorageInfo() {
        const info = {
            total: 0,
            items: {}
        };

        Object.entries(this.storageKeys).forEach(([name, key]) => {
            const data = localStorage.getItem(key);
            if (data) {
                const size = new Blob([data]).size;
                info.items[name] = {
                    size: size,
                    sizeFormatted: this.formatBytes(size)
                };
                info.total += size;
            }
        });

        info.totalFormatted = this.formatBytes(info.total);
        return info;
    }

    /**
     * 格式化字节大小
     */
    formatBytes(bytes) {
        if (bytes === 0) return '0 B';
        const k = 1024;
        const sizes = ['B', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }
}

// 全局实例
const localStorageManager = new LocalStorageManager();

// 全局便捷函数
window.saveAllLocalData = function() {
    return localStorageManager.saveAllDataFromGameData();
};

window.loadAllLocalData = function() {
    return localStorageManager.loadAllDataToGameData();
};

window.clearAllLocalData = function() {
    return localStorageManager.clearAllData();
};

// 在浏览器环境下导出
if (typeof window !== 'undefined') {
    window.LocalStorageManager = LocalStorageManager;
    window.localStorageManager = localStorageManager;
}