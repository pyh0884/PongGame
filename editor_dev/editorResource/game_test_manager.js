// 游戏测试管理器
class GameTestManager {
    constructor() {
        this.gameFiles = [];
        this.packingRules = null;
        this.loadPackingRules();
    }

    // 加载打包规则
    async loadPackingRules() {
        try {
            const response = await fetch('./packing_rule.json');
            if (response.ok) {
                const rules = await response.json();
                this.packingRules = rules;
                console.log('打包规则加载成功:', rules);
            } else {
                console.warn('未找到 packing_rule.json，使用默认规则');
                this.useDefaultRules();
            }
        } catch (error) {
            console.warn('加载打包规则失败，使用默认规则:', error);
            this.useDefaultRules();
        }
    }

    // 使用默认规则
    useDefaultRules() {
        this.packingRules = {
            version: "2.0.0",
            description: "默认文件分类规则",
            rules: {
                game: {
                    description: "游戏核心文件（运行时必需）",
                    patterns: [
                        "^index\\.html$",
                        "^Build/.*$",
                        "^GameContainerData/.*$"
                    ]
                },
                mod: {
                    description: "MOD扩展文件（由用户通过编辑器生成）",
                    patterns: [
                        "^mod/.*$"
                    ]
                }
            }
        };
    }

    // 检查文件是否符合游戏规则
    isGameFile(filePath) {
        if (!this.packingRules) {
            return false;
        }
        
        const gamePatterns = this.packingRules.rules.game.patterns;
        return gamePatterns.some(pattern => {
            const regex = new RegExp(pattern);
            return regex.test(filePath);
        });
    }

    // 选择游戏文件
    selectGameFiles() {
        document.getElementById('gameFilesInput').click();
    }

    // 处理游戏文件变化
    handleGameFilesChange() {
        const fileInput = document.getElementById('gameFilesInput');
        const files = Array.from(fileInput.files);
        
        if (files.length === 0) {
            this.gameFiles = [];
            window.gameData.gameFiles = [];
            document.getElementById('gameFilesStatus').textContent = '请选择游戏目录中的所有文件';
            return;
        }
        
        // 根据打包规则自动分类文件
        const gameFiles = [];
        const otherFiles = [];
        
        files.forEach(file => {
            let filePath = file.name;
            
            // 处理相对路径
            if (file.webkitRelativePath) {
                filePath = file.webkitRelativePath;
            }
            
            if (this.isGameFile(filePath)) {
                gameFiles.push(file);
            } else {
                otherFiles.push(file);
            }
        });
        
        this.gameFiles = gameFiles;
        window.gameData.gameFiles = gameFiles;
        
        // 更新状态显示
        let statusText = `已选择 ${files.length} 个文件，其中 ${gameFiles.length} 个游戏文件`;
        
        if (otherFiles.length > 0) {
            statusText += `，${otherFiles.length} 个其他文件（将被忽略）`;
        }
        
        document.getElementById('gameFilesStatus').textContent = statusText;
        
        // 检查游戏文件完整性
        const hasIndex = gameFiles.some(file => {
            const path = file.webkitRelativePath || file.name;
            return path === 'index.html' || path.endsWith('/index.html');
        });
        
        const hasBuildFiles = gameFiles.some(file => {
            const path = file.webkitRelativePath || file.name;
            return path.includes('Build/') && (path.includes('.wasm') || path.includes('.data') || path.includes('.framework.js'));
        });
        
        if (!hasIndex) {
            document.getElementById('gameFilesStatus').textContent += ' (警告: 未找到 index.html)';
        } else if (!hasBuildFiles) {
            document.getElementById('gameFilesStatus').textContent += ' (警告: 未找到 Build 文件)';
        } else {
            document.getElementById('gameFilesStatus').textContent += ' (文件完整)';
        }
        
        // 显示分类详情
        if (gameFiles.length > 0) {
            console.log('游戏文件:', gameFiles.map(f => f.webkitRelativePath || f.name));
        }
        if (otherFiles.length > 0) {
            console.log('其他文件:', otherFiles.map(f => f.webkitRelativePath || f.name));
        }
    }

    // 生成UUID
    generateUUID() {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
            const r = Math.random() * 16 | 0;
            const v = c === 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        });
    }

    // 将图片转换为PNG格式
    convertImageToPng(file) {
        return new Promise((resolve) => {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            const img = new Image();
            
            img.onload = function() {
                canvas.width = img.width;
                canvas.height = img.height;
                ctx.drawImage(img, 0, 0);
                canvas.toBlob(resolve, 'image/png');
            };
            
            img.src = URL.createObjectURL(file);
        });
    }

    // 测试用下载 - 打包游戏文件和MOD文件
    async testDownloadGame() {
        try {
            const btn = document.getElementById('testDownloadBtn');
            btn.disabled = true;
            btn.textContent = '打包中...';
            
            // 检查是否选择了游戏文件
            if (!window.gameData.gameFiles || window.gameData.gameFiles.length === 0) {
                alert('请先选择游戏文件');
                btn.disabled = false;
                btn.textContent = '测试用下载';
                return;
            }
            
            // 更新游戏数据
            window.gameData.title = document.getElementById('gameTitle').value;
            window.gameData.description = document.getElementById('gameDescription').value;
            
            // 生成UUID作为文件夹名称
            const uuid = this.generateUUID();
            
            // 创建ZIP包
            const zip = new JSZip();
            const gameFolder = zip.folder(uuid);
            
            // 添加游戏文件
            for (const file of window.gameData.gameFiles) {
                let filePath = file.webkitRelativePath || file.name;
                
                // 如果没有相对路径，根据文件名推断路径
                if (!file.webkitRelativePath) {
                    if (file.name.includes('.wasm') || file.name.includes('.data') || 
                        file.name.includes('.framework.js') || file.name.includes('.loader.js')) {
                        filePath = `Build/${file.name}`;
                    } else if (file.name.includes('favicon.ico') || file.name.includes('logo.svg')) {
                        filePath = `GameContainerData/${file.name}`;
                    }
                }
                
                gameFolder.file(filePath, file);
            }
            
            // 创建mod文件夹
            const modFolder = gameFolder.folder("mod");
            const textureFolder = modFolder.folder("texture");
            const audioFolder = modFolder.folder("audio");
            
            // 创建敌人生成数据
            const enemySpawnData = {
                gameInfo: {
                    title: window.gameData.title,
                    description: window.gameData.description,
                    version: "1.0.0",
                    createTime: new Date().toISOString()
                },
                spawnEvents: [],
                enemies: []
            };
            
            // 添加敌人头像到texture文件夹
            let enemyCount = 0;
            for (let i = 0; i < 4; i++) {
                const file = window.gameData.enemyFiles[i];
                if (file) {
                    const pngBlob = await this.convertImageToPng(file);
                    textureFolder.file(`enemy${i}.png`, pngBlob);
                    
                    enemySpawnData.enemies.push({
                        id: i,
                        name: `敌人${i}`,
                        texture: `enemy${i}.png`,
                        health: 100 + i * 20,
                        speed: 50 + i * 10,
                        damage: 10 + i * 5
                    });
                    
                    enemyCount++;
                }
            }
            
            // 生成默认的spawn events（示例数据）
            if (enemyCount > 0) {
                for (let i = 0; i < 20; i++) {
                    enemySpawnData.spawnEvents.push({
                        timestamp: i * 2000 + Math.random() * 1000, // 每2秒左右生成一个敌人
                        spawnPosIndex: Math.random(), // 0-1之间的随机位置
                        enemyType: Math.floor(Math.random() * enemyCount) // 随机敌人类型
                    });
                }
                
                // 按时间排序
                enemySpawnData.spawnEvents.sort((a, b) => a.timestamp - b.timestamp);
            }
            
            // 添加敌人生成数据JSON
            modFolder.file("enemy_spawn_data.json", JSON.stringify(enemySpawnData, null, 2));
            
            // 添加背景音乐
            if (window.gameData.audioFile) {
                audioFolder.file("bgm.mp3", window.gameData.audioFile);
            }
            
            // 生成ZIP文件
            const zipBlob = await zip.generateAsync({type: "blob"});
            
            // 下载ZIP文件
            const url = URL.createObjectURL(zipBlob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `${window.gameData.title || 'game'}-test-${uuid.substring(0, 8)}.zip`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            
            btn.disabled = false;
            btn.textContent = '测试用下载';
            
            alert('测试包已下载完成！\n' + 
                  `文件结构：${uuid}/index.html, ${uuid}/Build/..., ${uuid}/mod/...\n` +
                  `包含 ${window.gameData.gameFiles.length} 个游戏文件和 ${enemyCount} 个敌人头像`);
            
        } catch (error) {
            console.error('打包失败:', error);
            alert('打包失败: ' + error.message);
            
            const btn = document.getElementById('testDownloadBtn');
            btn.disabled = false;
            btn.textContent = '测试用下载';
        }
    }
}

// 创建全局实例
window.gameTestManager = new GameTestManager();

// 全局函数，供HTML调用
window.selectGameFiles = function() {
    window.gameTestManager.selectGameFiles();
};

window.handleGameFilesChange = function() {
    window.gameTestManager.handleGameFilesChange();
};

window.testDownloadGame = function() {
    window.gameTestManager.testDownloadGame();
}; 