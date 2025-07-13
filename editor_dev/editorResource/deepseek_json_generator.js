// DeepSeek API 集成器 - 生成敌人生成数据JSON
class DeepSeekJSONGenerator {
    constructor(config) {
        this.apiKey = config.apiKey;
        this.baseURL = config.apiUrl;
        this.model = config.model;
        this.apiSettings = config.apiSettings;
        this.schemaConstraints = config.schemaConstraints;
        this.validator = new EnemySpawnValidator();
    }

    /**
     * 生成优化的Prompt，确保AI直接返回JSON
     */
    generateOptimizedPrompt(gameDescription = '') {
        const schema = this.validator.getSchema();
        const constraints = this.schemaConstraints;
        
        // 关键：以JSON开头，明确指示格式
        const prompt = `{
  "spawnEvents": [
    
Generate a complete enemy spawn data JSON that continues from the above format. Requirements:
- Game description: ${gameDescription || '射击游戏'}
- timestamp: ${constraints.timestamp.minimum}-${constraints.timestamp.maximum} seconds, must be in ascending order
- spawnPosIndex: ${constraints.spawnPosIndex.minimum}-${constraints.spawnPosIndex.maximum} (${constraints.spawnPosIndex.description})
- enemyType: ${constraints.enemyType.minimum}-${constraints.enemyType.maximum} (${constraints.enemyType.description})
- Generate 10-25 spawn events for good gameplay
- Vary enemy types and positions for diversity
- Distribute events throughout the time range

Schema validation:
${JSON.stringify(schema, null, 2)}

IMPORTANT: 
- Return ONLY the complete JSON object
- Start with { and end with }
- No explanations or markdown
- No text before or after JSON`;

        return prompt;
    }

    /**
     * 调用DeepSeek API生成JSON（优先使用 Function Calling）
     */
    async generateEnemySpawnJSON(gameDescription = '', maxRetries = 3) {
        // 首先尝试 Function Calling 方法
        for (let attempt = 1; attempt <= maxRetries; attempt++) {
            try {
                console.log(`尝试生成敌人数据 (${attempt}/${maxRetries}) - Function Calling`);
                const result = await this.generateWithFunctionCalling(gameDescription);
                if (result.success) {
                    return result;
                }
                console.warn(`Function Calling 第 ${attempt} 次尝试失败:`, result.error);
            } catch (error) {
                console.warn(`Function Calling 第 ${attempt} 次尝试出错:`, error.message);
            }
        }

        // Function Calling 失败后，尝试 JSON Mode
        for (let attempt = 1; attempt <= maxRetries; attempt++) {
            try {
                console.log(`尝试生成敌人数据 (${attempt}/${maxRetries}) - JSON Mode`);
                const result = await this.generateWithJSONMode(gameDescription);
                if (result.success) {
                    return result;
                }
                console.warn(`JSON Mode 第 ${attempt} 次尝试失败:`, result.error);
            } catch (error) {
                console.warn(`JSON Mode 第 ${attempt} 次尝试出错:`, error.message);
            }
        }

        // 所有方法都失败，返回错误
        return {
            success: false,
            error: `所有生成方法均失败，已尝试 Function Calling 和 JSON Mode 各 ${maxRetries} 次`,
            data: null,
            validation: null
        };
    }

    /**
     * 使用 Function Calling 生成敌人数据
     */
    async generateWithFunctionCalling(gameDescription = '') {
        const tools = [{
            type: "function",
            function: {
                name: "generate_enemy_spawn_data",
                description: "Generate enemy spawn data for a shooting game based on game description",
                parameters: {
                    type: "object",
                    properties: {
                        spawnEvents: {
                            type: "array",
                            description: "Array of enemy spawn events",
                            items: {
                                type: "object",
                                properties: {
                                    timestamp: {
                                        type: "number",
                                        minimum: this.schemaConstraints.timestamp.minimum,
                                        maximum: this.schemaConstraints.timestamp.maximum,
                                        description: this.schemaConstraints.timestamp.description
                                    },
                                    spawnPosIndex: {
                                        type: "integer", 
                                        minimum: this.schemaConstraints.spawnPosIndex.minimum,
                                        maximum: this.schemaConstraints.spawnPosIndex.maximum,
                                        description: this.schemaConstraints.spawnPosIndex.description
                                    },
                                    enemyType: {
                                        type: "integer",
                                        minimum: this.schemaConstraints.enemyType.minimum,
                                        maximum: this.schemaConstraints.enemyType.maximum,
                                        description: this.schemaConstraints.enemyType.description
                                    }
                                },
                                required: ["timestamp", "spawnPosIndex", "enemyType"]
                            },
                            minItems: 10,
                            maxItems: 25
                        }
                    },
                    required: ["spawnEvents"]
                }
            }
        }];

        try {
            const response = await fetch(`${this.baseURL}/v1/chat/completions`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${this.apiKey}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    model: this.model,
                    messages: [
                        {
                            role: 'system',
                            content: 'You are a game data generator that creates enemy spawn data for shooting games. Use the provided function to generate data.'
                        },
                        {
                            role: 'user',
                            content: `Generate enemy spawn data for this game: ${gameDescription || '射击游戏'}. Create 10-25 spawn events with varied timing, positions (0-1), and enemy types (0-3). Ensure timestamps are in ascending order within 0-180 seconds.`
                        }
                    ],
                    tools: tools,
                    tool_choice: {type: "function", function: {name: "generate_enemy_spawn_data"}},
                    temperature: this.apiSettings.temperature,
                    max_tokens: this.apiSettings.maxTokens
                })
            });

            if (!response.ok) {
                throw new Error(`DeepSeek API 错误: ${response.status} ${response.statusText}`);
            }

            const data = await response.json();
            const message = data.choices[0].message;

            if (message.tool_calls && message.tool_calls.length > 0) {
                const functionCall = message.tool_calls[0];
                const generatedData = JSON.parse(functionCall.function.arguments);
                
                // 验证生成的数据
                const validationResult = this.validator.validateEnemySpawnData(generatedData);
                
                if (validationResult.valid) {
                    return {
                        success: true,
                        data: generatedData,
                        validation: validationResult,
                        method: 'function_calling'
                    };
                } else {
                    return {
                        success: false,
                        error: `验证失败: ${validationResult.errors.map(e => e.message).join(', ')}`,
                        data: generatedData,
                        validation: validationResult
                    };
                }
            } else {
                throw new Error('没有收到 function call 响应');
            }

        } catch (error) {
            return {
                success: false,
                error: error.message,
                data: null,
                validation: null
            };
        }
    }

    /**
     * 使用 JSON Mode 生成敌人数据
     */
    async generateWithJSONMode(gameDescription = '') {
        const prompt = this.generateOptimizedPrompt(gameDescription);
        
        try {
            const response = await fetch(`${this.baseURL}/v1/chat/completions`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${this.apiKey}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    model: this.model,
                    messages: [
                        {
                            role: 'system',
                            content: 'You are a JSON data generator. Return only valid JSON without any explanations, markdown formatting, or additional text.'
                        },
                        {
                            role: 'user',
                            content: prompt
                        }
                    ],
                    response_format: { type: 'json_object' },
                    temperature: this.apiSettings.temperature,
                    max_tokens: this.apiSettings.maxTokens
                })
            });

            if (!response.ok) {
                throw new Error(`DeepSeek API 错误: ${response.status} ${response.statusText}`);
            }

            const data = await response.json();
            const aiResponse = data.choices[0].message.content;

            if (!aiResponse || aiResponse.trim() === '') {
                throw new Error('API 返回空内容');
            }

            // 解析 JSON
            let generatedData;
            try {
                generatedData = JSON.parse(aiResponse);
            } catch (parseError) {
                // 尝试清洗数据后再解析
                generatedData = this.cleanAIResponse(aiResponse);
            }

            // 验证生成的数据
            const validationResult = this.validator.validateEnemySpawnData(generatedData);

            if (validationResult.valid) {
                return {
                    success: true,
                    data: generatedData,
                    validation: validationResult,
                    method: 'json_mode'
                };
            } else {
                return {
                    success: false,
                    error: `验证失败: ${validationResult.errors.map(e => e.message).join(', ')}`,
                    data: generatedData,
                    validation: validationResult
                };
            }

        } catch (error) {
            return {
                success: false,
                error: error.message,
                data: null,
                validation: null
            };
        }
    }

    /**
     * 清洗AI返回的数据，提取JSON部分
     */
    cleanAIResponse(aiResponse) {
        // 去除常见的前缀说明
        let cleaned = aiResponse.trim();
        
        // 移除markdown代码块标记
        cleaned = cleaned.replace(/```json\s*/gi, '');
        cleaned = cleaned.replace(/```\s*/g, '');
        
        // 移除常见的说明性文字
        const commonPrefixes = [
            /^.*?以下是.*?JSON.*?[：:]\s*/i,
            /^.*?这是.*?数据.*?[：:]\s*/i,
            /^.*?根据要求.*?[：:]\s*/i,
            /^.*?生成的.*?JSON.*?[：:]\s*/i,
            /^.*?here.*?is.*?json.*?[：:]\s*/i,
            /^.*?以下.*?[：:]\s*/i
        ];

        commonPrefixes.forEach(pattern => {
            cleaned = cleaned.replace(pattern, '');
        });

        // 查找第一个 { 到最后一个 } 之间的内容
        const firstBrace = cleaned.indexOf('{');
        const lastBrace = cleaned.lastIndexOf('}');
        
        if (firstBrace !== -1 && lastBrace !== -1 && firstBrace < lastBrace) {
            cleaned = cleaned.substring(firstBrace, lastBrace + 1);
        }

        // 尝试解析JSON
        try {
            return JSON.parse(cleaned);
        } catch {
            // 如果解析失败，尝试修复常见问题
            return this.repairJSON(cleaned);
        }
    }

    /**
     * 尝试修复损坏的JSON
     */
    repairJSON(jsonString) {
        let repaired = jsonString;

        // 修复常见问题
        // 1. 添加缺失的closing brace
        const openBraces = (repaired.match(/\{/g) || []).length;
        const closeBraces = (repaired.match(/\}/g) || []).length;
        if (openBraces > closeBraces) {
            repaired += '}'.repeat(openBraces - closeBraces);
        }

        // 2. 修复末尾逗号
        repaired = repaired.replace(/,(\s*[}\]])/g, '$1');

        // 3. 修复引号问题
        repaired = repaired.replace(/([{,]\s*)(\w+)(\s*:)/g, '$1"$2"$3');

        try {
            return JSON.parse(repaired);
        } catch {
            // 如果还是失败，返回默认数据
            console.warn('JSON修复失败，使用默认数据');
            return this.validator.generateExample();
        }
    }

    /**
     * 批量生成多个方案
     */
    async generateMultipleOptions(gameDescription = '', count = 3) {
        const results = [];
        
        for (let i = 0; i < count; i++) {
            const result = await this.generateEnemySpawnJSON(gameDescription);
            results.push({
                ...result,
                option: i + 1
            });
            
            // 避免API频率限制
            await this.sleep(1000);
        }
        
        return results;
    }

    /**
     * 延迟函数
     */
    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    /**
     * 获取用于AI的prompt模板
     */
    getPromptTemplate() {
        return this.generateOptimizedPrompt('[游戏描述]');
    }
}

// 浏览器环境下的便捷函数
if (typeof window !== 'undefined') {
    window.DeepSeekJSONGenerator = DeepSeekJSONGenerator;
    
    // 全局便捷函数
    window.generateEnemySpawnData = async function(config, gameDescription = '') {
        const generator = new DeepSeekJSONGenerator(config);
        return await generator.generateEnemySpawnJSON(gameDescription);
    };
}

// Node.js环境下的导出
if (typeof module !== 'undefined' && module.exports) {
    module.exports = DeepSeekJSONGenerator;
} 