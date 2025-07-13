using System;
using System.IO;
using UnityEditor;
using UnityEditor.Build.Reporting;
using UnityEngine;
using UnityEngine.Rendering;

namespace UnityBuilderAction
{
    /// <summary>
    /// 简化的WebGL2构建脚本
    /// 只支持Release和Debug两种构建模式
    /// </summary>
    public static class BuildScript
    {
        /// <summary>
        /// 从命令行构建
        /// </summary>
        public static void BuildFromCommandLine()
        {
            string buildPath = GetCommandLineArgument("-buildPath") ?? "../build";
            string buildType = GetCommandLineArgument("-buildType") ?? "development";
            
            // 支持 "release" 和 "development" 参数
            bool isRelease = buildType.ToLower() == "release";
            
            Debug.Log($"命令行参数 - buildPath: {buildPath}, buildType: {buildType}, isRelease: {isRelease}");
            
            BuildWebGL(buildPath, isRelease);
        }
        
        /// <summary>
        /// 构建WebGL
        /// </summary>
        /// <param name="buildPath">构建输出路径</param>
        /// <param name="isRelease">是否为Release构建</param>
        public static void BuildWebGL(string buildPath, bool isRelease = false)
        {
            Debug.Log($"开始构建WebGL - 模式: {(isRelease ? "Release" : "Debug")}, 路径: {buildPath}");
            
            // 配置WebGL设置
            ConfigureWebGLSettings(isRelease);
            
            // 设置构建选项
            BuildPlayerOptions buildOptions = new BuildPlayerOptions
            {
                scenes = GetEnabledScenes(),
                locationPathName = buildPath,
                target = BuildTarget.WebGL,
                options = isRelease ? BuildOptions.None : BuildOptions.Development
            };
            
            // 执行构建
            BuildReport report = BuildPipeline.BuildPlayer(buildOptions);
            
            // 检查构建结果
            if (report.summary.result == BuildResult.Succeeded)
            {
                Debug.Log($"构建成功! 输出路径: {buildPath}");
                Debug.Log($"构建大小: {FormatBytes(report.summary.totalSize)}");
                Debug.Log($"构建时间: {report.summary.totalTime}");
            }
            else
            {
                Debug.LogError($"构建失败: {report.summary.result}");
                if (Application.isBatchMode)
                {
                    EditorApplication.Exit(1);
                }
            }
        }
        
        /// <summary>
        /// 配置WebGL设置
        /// </summary>
        /// <param name="isRelease">是否为Release构建</param>
        private static void ConfigureWebGLSettings(bool isRelease)
        {
            // 设置图形API为WebGL2
            PlayerSettings.SetGraphicsAPIs(BuildTarget.WebGL, new[] { GraphicsDeviceType.OpenGLES3 });
            
            // 设置脚本后端为IL2CPP
            PlayerSettings.SetScriptingBackend(BuildTargetGroup.WebGL, ScriptingImplementation.IL2CPP);
            
            // 设置API兼容性级别
            PlayerSettings.SetApiCompatibilityLevel(BuildTargetGroup.WebGL, ApiCompatibilityLevel.NET_Standard_2_0);
            
            if (isRelease)
            {
                // Release配置
                PlayerSettings.WebGL.template = "PROJECT:Release";
                PlayerSettings.WebGL.exceptionSupport = WebGLExceptionSupport.None;
                PlayerSettings.WebGL.compressionFormat = WebGLCompressionFormat.Gzip;
                
                // 设置IL2CPP编译器配置为Master（Release优化）
                PlayerSettings.SetIl2CppCompilerConfiguration(BuildTargetGroup.WebGL, Il2CppCompilerConfiguration.Master);
                
                Debug.Log("配置为Release模式 - 优化大小，关闭异常支持");
            }
            else
            {
                // Debug配置
                PlayerSettings.WebGL.template = "PROJECT:Develop";
                PlayerSettings.WebGL.exceptionSupport = WebGLExceptionSupport.FullWithStacktrace;
                PlayerSettings.WebGL.compressionFormat = WebGLCompressionFormat.Disabled;
                
                // 设置IL2CPP编译器配置为Debug
                PlayerSettings.SetIl2CppCompilerConfiguration(BuildTargetGroup.WebGL, Il2CppCompilerConfiguration.Debug);
                
                // 启用调试符号
                PlayerSettings.WebGL.debugSymbolMode = WebGLDebugSymbolMode.Embedded;
                
                // 显示诊断信息
                PlayerSettings.WebGL.showDiagnostics = true;
                
                Debug.Log("配置为Debug模式 - 开启调试符号和异常支持");
            }
        }
        
        /// <summary>
        /// 获取启用的场景列表
        /// </summary>
        /// <returns>场景路径数组</returns>
        private static string[] GetEnabledScenes()
        {
            var scenes = new string[EditorBuildSettings.scenes.Length];
            for (int i = 0; i < EditorBuildSettings.scenes.Length; i++)
            {
                scenes[i] = EditorBuildSettings.scenes[i].path;
            }
            return scenes;
        }
        
        /// <summary>
        /// 从命令行获取参数
        /// </summary>
        /// <param name="name">参数名</param>
        /// <returns>参数值</returns>
        private static string GetCommandLineArgument(string name)
        {
            string[] args = Environment.GetCommandLineArgs();
            for (int i = 0; i < args.Length; i++)
            {
                if (args[i].Equals(name, StringComparison.OrdinalIgnoreCase) && i + 1 < args.Length)
                {
                    return args[i + 1];
                }
            }
            return null;
        }
        
        /// <summary>
        /// 格式化字节大小
        /// </summary>
        /// <param name="bytes">字节数</param>
        /// <returns>格式化后的字符串</returns>
        private static string FormatBytes(ulong bytes)
        {
            string[] sizes = { "B", "KB", "MB", "GB" };
            double len = bytes;
            int order = 0;
            while (len >= 1024 && order < sizes.Length - 1)
            {
                order++;
                len = len / 1024;
            }
            return $"{len:0.##} {sizes[order]}";
        }
    }
}