using UnityEditor;
using UnityEngine;

namespace UnityBuilderAction
{
    /// <summary>
    /// 简化的构建菜单
    /// 只提供WebGL的Release和Debug构建选项
    /// </summary>
    public static class BuildScriptMenu
    {
        [MenuItem("构建/WebGL Debug构建")]
        public static void BuildWebGLDebug()
        {
            string buildPath = EditorUtility.SaveFolderPanel("选择WebGL Debug构建输出文件夹", "../build", "WebGL_Debug");
            
            if (!string.IsNullOrEmpty(buildPath))
            {
                BuildScript.BuildWebGL(buildPath, false);
            }
        }
        
        [MenuItem("构建/WebGL Release构建")]
        public static void BuildWebGLRelease()
        {
            string buildPath = EditorUtility.SaveFolderPanel("选择WebGL Release构建输出文件夹", "../build", "WebGL_Release");
            
            if (!string.IsNullOrEmpty(buildPath))
            {
                BuildScript.BuildWebGL(buildPath, true);
            }
        }
        
        [MenuItem("构建/快速Debug构建")]
        public static void QuickDebugBuild()
        {
            string buildPath = "../build/WebGL_Debug";
            Debug.Log($"快速Debug构建到: {buildPath}");
            BuildScript.BuildWebGL(buildPath, false);
        }
        
        [MenuItem("构建/快速Release构建")]
        public static void QuickReleaseBuild()
        {
            string buildPath = "../build/WebGL_Release";
            Debug.Log($"快速Release构建到: {buildPath}");
            BuildScript.BuildWebGL(buildPath, true);
        }
    }
} 