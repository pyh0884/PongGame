// 敌人生成数据JSON验证器
// 使用AJV库进行JSON Schema验证

// 引入AJV库 (如果在Node.js环境中)
// const Ajv = require('ajv');

// 敌人生成数据的JSON Schema
const enemySpawnDataSchema = {
  type: "object",
  properties: {
    spawnEvents: {
      type: "array",
      items: {
        type: "object",
        properties: {
          timestamp: {
            type: "number",
            minimum: 0,
            maximum: 180,
            description: "敌人生成的时间戳（秒）"
          },
          spawnPosIndex: {
            type: "integer",
            minimum: 0,
            maximum: 1,
            description: "生成位置索引（0-1）"
          },
          enemyType: {
            type: "integer",
            minimum: 0,
            maximum: 3,
            description: "敌人类型（0-3对应enemy0-enemy3）"
          }
        },
        required: ["timestamp", "spawnPosIndex", "enemyType"],
        additionalProperties: false
      },
      minItems: 1,
      description: "敌人生成事件列表"
    }
  },
  required: ["spawnEvents"],
  additionalProperties: false
};

// 创建AJV验证器实例
class EnemySpawnValidator {
  constructor() {
    // 如果在浏览器环境，确保AJV已加载
    if (typeof window.ajv2019 === 'undefined' && typeof window.Ajv === 'undefined' && typeof Ajv === 'undefined') {
      throw new Error('AJV库未加载，请确保已引入AJV库');
    }
    
    // 尝试使用不同的AJV全局变量 (ajv7.min.js 使用 ajv2019)
    const AjvConstructor = window.ajv2019 || window.Ajv || Ajv;
    this.ajv = new AjvConstructor({
      allErrors: true,        // 收集所有错误
      verbose: true,          // 详细错误信息
      strict: false           // 宽松模式，兼容旧版本schema
    });
    
    // 编译Schema
    this.validate = this.ajv.compile(enemySpawnDataSchema);
  }

  /**
   * 验证敌人生成数据JSON
   * @param {Object} data - 要验证的数据对象
   * @returns {Object} 验证结果
   */
  validateEnemySpawnData(data) {
    const isValid = this.validate(data);
    
    const result = {
      valid: isValid,
      errors: [],
      warnings: []
    };

    if (!isValid) {
      result.errors = this.validate.errors.map(error => ({
        path: error.instancePath || error.dataPath,
        message: error.message,
        value: error.data,
        keyword: error.keyword,
        params: error.params
      }));
    }

    // 添加逻辑验证
    if (isValid) {
      const logicValidation = this.validateLogic(data);
      result.warnings = logicValidation.warnings;
      if (logicValidation.errors.length > 0) {
        result.valid = false;
        result.errors.push(...logicValidation.errors);
      }
    }

    return result;
  }

  /**
   * 业务逻辑验证
   * @param {Object} data - 验证的数据
   * @returns {Object} 逻辑验证结果
   */
  validateLogic(data) {
    const errors = [];
    const warnings = [];

    const spawnEvents = data.spawnEvents;

    // 检查时间戳是否按顺序排列
    for (let i = 1; i < spawnEvents.length; i++) {
      if (spawnEvents[i].timestamp < spawnEvents[i - 1].timestamp) {
        warnings.push({
          message: `时间戳顺序建议：第${i + 1}个事件的时间戳(${spawnEvents[i].timestamp})小于前一个事件(${spawnEvents[i - 1].timestamp})`,
          path: `/spawnEvents/${i}/timestamp`
        });
      }
    }

    // 检查是否有重复的时间戳
    const timestamps = spawnEvents.map(event => event.timestamp);
    const duplicateTimestamps = timestamps.filter((timestamp, index) => 
      timestamps.indexOf(timestamp) !== index
    );
    
    if (duplicateTimestamps.length > 0) {
      warnings.push({
        message: `发现重复的时间戳: ${[...new Set(duplicateTimestamps)].join(', ')}`,
        path: '/spawnEvents'
      });
    }

    // 检查敌人类型分布
    const enemyTypes = spawnEvents.map(event => event.enemyType);
    const enemyTypeCount = enemyTypes.reduce((acc, type) => {
      acc[type] = (acc[type] || 0) + 1;
      return acc;
    }, {});

    // 如果只有一种敌人类型，给出警告
    if (Object.keys(enemyTypeCount).length === 1) {
      warnings.push({
        message: '建议使用多种敌人类型以增加游戏趣味性',
        path: '/spawnEvents'
      });
    }

    // 检查游戏时长
    const maxTimestamp = Math.max(...timestamps);
    const minTimestamp = Math.min(...timestamps);
    const gameDuration = maxTimestamp - minTimestamp;

    if (gameDuration < 10) {
      warnings.push({
        message: `游戏时长较短 (${gameDuration.toFixed(1)}秒)，建议增加更多敌人生成事件`,
        path: '/spawnEvents'
      });
    }

    if (gameDuration > 300) {
      warnings.push({
        message: `游戏时长较长 (${gameDuration.toFixed(1)}秒)，可能影响玩家体验`,
        path: '/spawnEvents'
      });
    }

    return { errors, warnings };
  }

  /**
   * 生成示例数据
   * @returns {Object} 示例数据
   */
  generateExample() {
    return {
      spawnEvents: [
        { timestamp: 2.5, spawnPosIndex: 0, enemyType: 0 },
        { timestamp: 3.1, spawnPosIndex: 1, enemyType: 0 },
        { timestamp: 5.2, spawnPosIndex: 0, enemyType: 1 },
        { timestamp: 8.7, spawnPosIndex: 1, enemyType: 0 },
        { timestamp: 10.1, spawnPosIndex: 0, enemyType: 2 },
        { timestamp: 12.3, spawnPosIndex: 1, enemyType: 1 },
        { timestamp: 15.8, spawnPosIndex: 0, enemyType: 0 },
        { timestamp: 16.4, spawnPosIndex: 1, enemyType: 3 },
        { timestamp: 18.2, spawnPosIndex: 0, enemyType: 1 },
        { timestamp: 20.6, spawnPosIndex: 1, enemyType: 2 }
      ]
    };
  }

  /**
   * 获取Schema定义
   * @returns {Object} JSON Schema
   */
  getSchema() {
    return enemySpawnDataSchema;
  }
}

// 浏览器环境下的便捷函数
if (typeof window !== 'undefined') {
  window.EnemySpawnValidator = EnemySpawnValidator;
  
  // 全局验证函数
  window.validateEnemySpawnData = function(data) {
    try {
      const validator = new EnemySpawnValidator();
      return validator.validateEnemySpawnData(data);
    } catch (error) {
      return {
        valid: false,
        errors: [{
          message: error.message,
          path: 'validator'
        }],
        warnings: []
      };
    }
  };
}

// Node.js环境下的导出
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    EnemySpawnValidator,
    enemySpawnDataSchema,
    validateEnemySpawnData: function(data) {
      const validator = new EnemySpawnValidator();
      return validator.validateEnemySpawnData(data);
    }
  };
} 