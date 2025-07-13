// 编辑器主要功能模块
class EditorMain {
    constructor() {
        this.initGameData();
        this.bindEvents();
    }

    /**
     * 初始化游戏数据
     */
    initGameData() {
        window.gameData = {
            title: '我的射击游戏',
            description: '一款刺激的射击游戏，击败所有敌人！',
            status: 'DRAFT',
            enemyFiles: [null, null, null, null],
            audioFile: null,
            gameFiles: [],
            enemySpawnData: null
        };
    }

    /**
     * 绑定事件
     */
    bindEvents() {
        // 页面加载完成后的初始化
        document.addEventListener('DOMContentLoaded', () => {
            this.initPage();
        });

        // 监听表单变化，自动保存
        document.addEventListener('input', (e) => {
            if (e.target.id === 'gameTitle' || e.target.id === 'gameDescription') {
                this.updateGameDataFromForm();
                this.autoSave();
            }
        });
    }

    /**
     * 初始化页面
     */
    initPage() {
        // 加载本地数据
        localStorageManager.loadAllDataToGameData();
        
        // 更新表单显示
        this.updateFormFromGameData();
        this.updateStatusDisplay();
        this.updatePreviewsFromGameData();
    }

    /**
     * 从 gameData 更新表单
     */
    updateFormFromGameData() {
        const titleInput = document.getElementById('gameTitle');
        const descInput = document.getElementById('gameDescription');
        
        if (titleInput) titleInput.value = window.gameData.title;
        if (descInput) descInput.value = window.gameData.description;
    }

    /**
     * 从表单更新 gameData
     */
    updateGameDataFromForm() {
        const titleInput = document.getElementById('gameTitle');
        const descInput = document.getElementById('gameDescription');
        
        if (titleInput) window.gameData.title = titleInput.value;
        if (descInput) window.gameData.description = descInput.value;
    }

    /**
     * 更新状态显示
     */
    updateStatusDisplay() {
        const statusElement = document.getElementById('gameStatus');
        if (!statusElement) return;

        if (window.gameData.status === 'PUBLISHED') {
            statusElement.textContent = '状态: 已发布';
            statusElement.className = 'status-published';
        } else {
            statusElement.textContent = '状态: 草稿';
            statusElement.className = 'status-draft';
        }
    }

    /**
     * 从 gameData 更新预览显示
     */
    updatePreviewsFromGameData() {
        // 更新敌人头像预览
        for (let i = 0; i < 4; i++) {
            if (window.gameData.enemyFiles[i]) {
                this.displayEnemyPreview(i, window.gameData.enemyFiles[i]);
            }
        }

        // 更新音频预览
        if (window.gameData.audioFile) {
            this.displayAudioPreview(window.gameData.audioFile);
        }
    }

    /**
     * 显示敌人头像预览
     */
    displayEnemyPreview(index, file) {
        const preview = document.getElementById(`enemyPreview${index}`);
        if (preview && file) {
            const img = document.createElement('img');
            img.src = URL.createObjectURL(file);
            preview.innerHTML = '';
            preview.appendChild(img);
            preview.classList.remove('empty');
        }
    }

    /**
     * 显示音频预览
     */
    displayAudioPreview(file) {
        const preview = document.getElementById('audioPreview');
        if (preview && file) {
            preview.innerHTML = `<span>已选择: ${file.name}</span>`;
            preview.classList.remove('empty');
        }
    }

    /**
     * 选择敌人头像文件
     */
    selectEnemyFile(index) {
        const input = document.getElementById(`enemyFileInput${index}`);
        if (input) input.click();
    }

    /**
     * 处理敌人头像文件变化
     */
    async handleEnemyFileChange(index) {
        const fileInput = document.getElementById(`enemyFileInput${index}`);
        const file = fileInput.files[0];
        
        if (!file) return;
        
        if (!file.type.startsWith('image/')) {
            alert('请选择图片文件');
            return;
        }

        // 图片尺寸检查和缩放
        const processedFile = await this.processImageFile(file);
        
        // 更新数据
        window.gameData.enemyFiles[index] = processedFile;
        
        // 更新预览
        this.displayEnemyPreview(index, processedFile);
        
        // 保存到本地
        await localStorageManager.saveEnemyFile(index, processedFile);
    }

    /**
     * 处理图片文件（缩放到256px）
     */
    processImageFile(file) {
        return new Promise((resolve) => {
            const img = new Image();
            img.onload = () => {
                const canvas = document.createElement('canvas');
                const ctx = canvas.getContext('2d');
                
                // 计算缩放比例
                const maxSize = 256;
                let { width, height } = img;
                
                if (width > maxSize || height > maxSize) {
                    const ratio = Math.min(maxSize / width, maxSize / height);
                    width *= ratio;
                    height *= ratio;
                }
                
                // 设置画布尺寸并绘制
                canvas.width = width;
                canvas.height = height;
                ctx.drawImage(img, 0, 0, width, height);
                
                // 转换为PNG文件
                canvas.toBlob((blob) => {
                    const processedFile = new File([blob], file.name.replace(/\.[^/.]+$/, '.png'), {
                        type: 'image/png'
                    });
                    resolve(processedFile);
                }, 'image/png');
            };
            img.src = URL.createObjectURL(file);
        });
    }

    /**
     * 选择音频文件
     */
    selectAudioFile() {
        const input = document.getElementById('audioFileInput');
        if (input) input.click();
    }

    /**
     * 处理音频文件变化
     */
    async handleAudioFileChange() {
        const fileInput = document.getElementById('audioFileInput');
        const file = fileInput.files[0];
        
        if (!file) return;
        
        if (!file.type.startsWith('audio/')) {
            alert('请选择音频文件');
            return;
        }

        // 检查文件大小 (10MB限制)
        if (file.size > 10 * 1024 * 1024) {
            alert('音频文件不能超过10MB');
            return;
        }
        
        // 更新数据
        window.gameData.audioFile = file;
        
        // 更新预览
        this.displayAudioPreview(file);
        
        // 保存到本地
        await localStorageManager.saveBGMFile(file);
    }

    /**
     * 自动保存
     */
    async autoSave() {
        try {
            await localStorageManager.saveAllDataFromGameData();
        } catch (error) {
            console.error('自动保存失败:', error);
        }
    }

    /**
     * 获取本地编辑数据并创建ZIP包
     */
    async getLocalEditData() {
        // 更新游戏数据
        this.updateGameDataFromForm();
        
        // 创建ZIP包
        const zip = new JSZip();
        const modFolder = zip.folder("mod");
        const textureFolder = modFolder.folder("texture");
        const audioFolder = modFolder.folder("audio");
        
        // 添加敌人生成数据
        let enemySpawnData = window.gameData.enemySpawnData;
        if (!enemySpawnData) {
            // 如果没有AI生成的数据，使用默认数据
            enemySpawnData = {
                spawnEvents: [
                    { timestamp: 2.5, spawnPosIndex: 0, enemyType: 0 },
                    { timestamp: 5.0, spawnPosIndex: 1, enemyType: 1 },
                    { timestamp: 8.0, spawnPosIndex: 0, enemyType: 2 },
                    { timestamp: 12.0, spawnPosIndex: 1, enemyType: 0 },
                    { timestamp: 15.0, spawnPosIndex: 0, enemyType: 3 }
                ]
            };
        }
        modFolder.file("enemy_spawn_data.json", JSON.stringify(enemySpawnData, null, 2));
        
        // 添加敌人头像到texture文件夹
        for (let i = 0; i < 4; i++) {
            const file = window.gameData.enemyFiles[i];
            if (file) {
                textureFolder.file(`enemy${i}.png`, file);
            }
        }
        
        // 添加背景音乐
        if (window.gameData.audioFile) {
            audioFolder.file("bgm.mp3", window.gameData.audioFile);
        }
        
        // 生成ZIP文件
        const zipBlob = await zip.generateAsync({type: "blob"});
        
        return {
            title: window.gameData.title,
            description: window.gameData.description,
            zipBlob: zipBlob,
        };
    }

    /**
     * 导出配置
     */
    async exportLocalEdit() {
        try {
            const btn = document.getElementById('exportBtn');
            btn.disabled = true;
            btn.textContent = '导出中...';
            
            const data = await this.getLocalEditData();
            
            const url = URL.createObjectURL(data.zipBlob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `${data.title || 'game'}-mod.zip`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            
            btn.disabled = false;
            btn.textContent = '导出配置';
            
        } catch (error) {
            console.error('导出失败:', error);
            alert('导出失败: ' + error.message);
            
            const btn = document.getElementById('exportBtn');
            btn.disabled = false;
            btn.textContent = '导出配置';
        }
    }

    // publishLocalEdit 函数已移至 editor.html 中由后端同事维护
}

// 全局实例
const editorMain = new EditorMain();

// 全局函数绑定
window.selectEnemyFile = function(index) {
    editorMain.selectEnemyFile(index);
};

window.handleEnemyFileChange = function(index) {
    editorMain.handleEnemyFileChange(index);
};

window.selectAudioFile = function() {
    editorMain.selectAudioFile();
};

window.handleAudioFileChange = function() {
    editorMain.handleAudioFileChange();
};

window.exportLocalEdit = function() {
    editorMain.exportLocalEdit();
};

// publishLocalEdit 函数在 editor.html 中定义，由后端同事维护
// 监听来自父页面的消息功能也在 editor.html 中处理