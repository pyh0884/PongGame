using UnityEngine;

namespace LudAI.Game.Core
{
    /// <summary>
    /// 一个经典的、以稳定性为优先的 MonoBehaviour 单例实现。
    /// </summary>
    /// <typeparam name="T">要成为单例的 MonoBehaviour 类型。</typeparam>
    public abstract class Singleton<T> : MonoBehaviour where T : MonoBehaviour
    {
        private static T _instance;
        private static readonly object _lock = new object();

        public static T Instance
        {
            get
            {
                // 加锁以处理多线程环境下的访问
                lock (_lock)
                {
                    // 注意：这里我们不再检查 ApplicationIsQuitting 标志

                    if (_instance == null)
                    {
                        // 优先在场景中查找已存在的实例
                        _instance = (T)FindObjectOfType(typeof(T));

                        // 如果场景中仍然没有，则动态创建一个新的
                        if (_instance == null)
                        {
                            var singletonObject = new GameObject();
                            _instance = singletonObject.AddComponent<T>();
                            singletonObject.name = $"{typeof(T)} (Singleton)";
                        }
                    }
                    return _instance;
                }
            }
        }

        protected virtual void Awake()
        {
            // 这是保证单例模式健壮性的核心逻辑
            if (_instance == null)
            {
                // 如果静态实例还未被赋值（通常在场景第一次加载时），
                // 则将当前实例作为单例实例，并标记为切换场景时不销毁。
                _instance = this as T;
                DontDestroyOnLoad(this.gameObject);
            }
            else if (_instance != this)
            {
                // 如果场景中已经存在一个单例实例，
                // 那么这个新出现的、重复的实例就应该被立即销毁。
                // 这通常发生在加载一个已经包含该单例的场景时。
                Destroy(gameObject);
            }
        }
    }
}