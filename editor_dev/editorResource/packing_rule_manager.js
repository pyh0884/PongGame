// 打包规则管理器 - 处理 packing_rule.json 文件
class PackingRuleManager {
    constructor() {
        this.rules = null;
        this.loadRules();
    }

    /**
     * 从 packing_rule.json 加载规则
     */
    async loadRules() {
        try {
            const response = await fetch('packing_rule.json');
            if (!response.ok) {
                throw new Error(`加载 packing_rule.json 失败: ${response.status}`);
            }
            this.rules = await response.json();
            console.log('打包规则加载成功:', this.rules);
        } catch (error) {
            console.error('加载打包规则失败:', error);
            // 使用默认规则作为后备
            this.rules = this.getDefaultRules();
        }
    }

    /**
     * 获取默认规则（后备方案）
     */
    getDefaultRules() {
        return {
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
                },
                editor: {
                    description: "编辑器相关文件",
                    patterns: [
                        "^editor\\.html$",
                        "^editor/.*$"
                    ]
                }
            }
        };
    }

    /**
     * 检查文件是否匹配指定规则
     */
    isFileType(filePath, ruleType) {
        if (!this.rules || !this.rules.rules[ruleType]) {
            console.warn(`规则类型 ${ruleType} 不存在`);
            return false;
        }

        const patterns = this.rules.rules[ruleType].patterns;
        return patterns.some(pattern => {
            const regex = new RegExp(pattern);
            return regex.test(filePath);
        });
    }

    /**
     * 检查是否为游戏文件
     */
    isGameFile(filePath) {
        return this.isFileType(filePath, 'game');
    }

    /**
     * 检查是否为MOD文件
     */
    isModFile(filePath) {
        return this.isFileType(filePath, 'mod');
    }

    /**
     * 检查是否为编辑器文件
     */
    isEditorFile(filePath) {
        return this.isFileType(filePath, 'editor');
    }

    /**
     * 获取所有游戏文件模式
     */
    getGameFilePatterns() {
        if (!this.rules || !this.rules.rules.game) {
            return [];
        }
        return this.rules.rules.game.patterns;
    }

    /**
     * 分类文件列表
     */
    classifyFiles(files) {
        const classification = {
            game: [],
            mod: [],
            editor: [],
            other: []
        };

        files.forEach(file => {
            const filePath = file.webkitRelativePath || file.name;
            
            if (this.isGameFile(filePath)) {
                classification.game.push(file);
            } else if (this.isModFile(filePath)) {
                classification.mod.push(file);
            } else if (this.isEditorFile(filePath)) {
                classification.editor.push(file);
            } else {
                classification.other.push(file);
            }
        });

        return classification;
    }

    /**
     * 获取规则信息
     */
    getRulesInfo() {
        return {
            version: this.rules?.version || 'unknown',
            description: this.rules?.description || 'No description',
            ruleTypes: Object.keys(this.rules?.rules || {})
        };
    }

    /**
     * 等待规则加载完成
     */
    async waitForRulesLoaded() {
        if (this.rules) return this.rules;
        
        // 等待最多5秒
        for (let i = 0; i < 50; i++) {
            if (this.rules) return this.rules;
            await new Promise(resolve => setTimeout(resolve, 100));
        }
        
        throw new Error('等待打包规则加载超时');
    }
}

// 全局实例
const packingRuleManager = new PackingRuleManager();

// 在浏览器环境下导出
if (typeof window !== 'undefined') {
    window.PackingRuleManager = PackingRuleManager;
    window.packingRuleManager = packingRuleManager;
}