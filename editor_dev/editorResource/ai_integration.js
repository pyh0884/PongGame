// AI 集成模块 - 处理 AI 生成 JSON 的界面交互
class AIIntegration {
    constructor() {
        this.generator = null;
        this.config = null;
        this.currentGeneratedData = null;
        this.loadConfig();
    }

    /**
     * 加载 AI 配置
     */
    async loadConfig() {
        try {
            const response = await fetch('editorResource/ai_config.json');
            this.config = await response.json();
            this.generator = new DeepSeekJSONGenerator(this.config);
        } catch (error) {
            console.error('加载 AI 配置失败:', error);
            this.showStatus('配置加载失败', 'error');
        }
    }

    /**
     * 显示状态信息
     */
    showStatus(message, type = 'loading') {
        const statusElement = document.getElementById('aiStatus');
        if (statusElement) {
            statusElement.textContent = message;
            statusElement.className = `ai-status ${type}`;
            statusElement.classList.remove('hidden');
        }
    }

    /**
     * 隐藏状态信息
     */
    hideStatus() {
        const statusElement = document.getElementById('aiStatus');
        if (statusElement) {
            statusElement.classList.add('hidden');
        }
    }

    /**
     * 生成敌人数据
     */
    async generateEnemyData() {
        const generateBtn = document.getElementById('generateAIBtn');
        const useBtn = document.getElementById('useAIDataBtn');
        const descriptionTextarea = document.getElementById('aiGameDescription');
        const previewTextarea = document.getElementById('jsonPreview');

        if (!this.generator) {
            this.showStatus('AI 配置未加载完成，请稍后重试', 'error');
            return;
        }

        const description = descriptionTextarea.value.trim();
        if (!description) {
            this.showStatus('请先描述你想要的游戏玩法', 'error');
            return;
        }

        try {
            // 禁用按钮
            generateBtn.disabled = true;
            generateBtn.textContent = '🤖 生成中...';
            useBtn.disabled = true;
            
            this.showStatus('正在连接 AI，尝试 Function Calling 方法...', 'loading');
            
            // 重写 console.log 来显示重试状态
            const originalLog = console.log;
            const originalWarn = console.warn;
            
            console.log = (message) => {
                originalLog(message);
                if (typeof message === 'string' && message.includes('尝试生成敌人数据')) {
                    const method = message.includes('Function Calling') ? 'Function Calling' : 'JSON Mode';
                    this.showStatus(`🔄 ${message.replace('尝试生成敌人数据', '正在尝试')} - ${method}`, 'loading');
                }
            };
            
            console.warn = (message, detail) => {
                originalWarn(message, detail);
                if (typeof message === 'string' && message.includes('次尝试失败')) {
                    this.showStatus(`⚠️ ${message}`, 'loading');
                }
            };
            
            // 调用 AI 生成
            const result = await this.generator.generateEnemySpawnJSON(description);
            
            // 恢复原始 console 方法
            console.log = originalLog;
            console.warn = originalWarn;

            if (result.success && result.data) {
                // 显示生成的 JSON
                const formattedJSON = JSON.stringify(result.data, null, 2);
                previewTextarea.value = formattedJSON;
                
                // 保存数据
                this.currentGeneratedData = result.data;
                
                // 启用使用按钮
                useBtn.disabled = false;
                
                // 显示详细的成功信息
                const method = result.method === 'function_calling' ? 'Function Calling' : 'JSON Mode';
                const eventCount = result.data.spawnEvents?.length || 0;
                const warnings = result.validation?.warnings?.length || 0;
                
                let statusMessage = `✅ 生成成功！方法: ${method}, 事件数: ${eventCount}`;
                if (warnings > 0) {
                    statusMessage += `, 警告: ${warnings}`;
                }
                
                this.showStatus(statusMessage, 'success');
                
                // 5秒后隐藏状态
                setTimeout(() => this.hideStatus(), 5000);
            } else {
                throw new Error(result.error || '生成失败');
            }

        } catch (error) {
            console.error('AI 生成失败:', error);
            this.showStatus(`生成失败: ${error.message}`, 'error');
            previewTextarea.value = '';
            this.currentGeneratedData = null;
        } finally {
            // 恢复按钮
            generateBtn.disabled = false;
            generateBtn.textContent = '🤖 AI 生成数据';
        }
    }

    // 参数解析功能已移除，直接使用配置文件中的 schema 约束

    /**
     * 使用生成的数据
     */
    useGeneratedData() {
        if (!this.currentGeneratedData) {
            this.showStatus('没有可用的数据', 'error');
            return;
        }

        try {
            // 存储到 localStorage
            localStorage.setItem('enemy_spawn_data.json', JSON.stringify(this.currentGeneratedData));
            
            // 更新游戏数据
            if (window.gameData) {
                window.gameData.enemySpawnData = this.currentGeneratedData;
            }
            
            this.showStatus('数据已保存到本地！', 'success');
            
            // 2秒后隐藏状态
            setTimeout(() => this.hideStatus(), 2000);
            
        } catch (error) {
            console.error('保存数据失败:', error);
            this.showStatus('保存失败: ' + error.message, 'error');
        }
    }

    /**
     * 获取当前生成的数据
     */
    getCurrentData() {
        return this.currentGeneratedData;
    }

    /**
     * 从 localStorage 加载数据
     */
    loadFromLocalStorage() {
        try {
            const saved = localStorage.getItem('enemy_spawn_data.json');
            if (saved) {
                const data = JSON.parse(saved);
                this.currentGeneratedData = data;
                
                // 显示在预览区域
                const previewTextarea = document.getElementById('jsonPreview');
                if (previewTextarea) {
                    previewTextarea.value = JSON.stringify(data, null, 2);
                }
                
                // 启用使用按钮
                const useBtn = document.getElementById('useAIDataBtn');
                if (useBtn) {
                    useBtn.disabled = false;
                }
                
                return data;
            }
        } catch (error) {
            console.error('加载本地数据失败:', error);
        }
        return null;
    }
}

// 全局实例
const aiIntegration = new AIIntegration();

// 全局函数
window.generateEnemyDataWithAI = function() {
    aiIntegration.generateEnemyData();
};

window.useGeneratedData = function() {
    aiIntegration.useGeneratedData();
};

// 页面加载完成后，尝试从本地存储加载数据
document.addEventListener('DOMContentLoaded', function() {
    setTimeout(() => {
        aiIntegration.loadFromLocalStorage();
    }, 1000);
});