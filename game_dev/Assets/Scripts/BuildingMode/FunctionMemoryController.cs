using UnityEngine;
using System.Collections.Generic;
using UnityEngine.SceneManagement;
public class FunctionMemoryController : MonoBehaviour/*功能存储控制器*/
{

    /*blocks为后面生成砖块所用的矩阵
     -1为普通砖块
     0-4对应爆炸、护盾、不可破坏、分裂以及黑洞砖块*/

    public static List<int> functionKind = new List<int>();//砖块的功能
    public static int[,] blocks = new int[18, 4];//用于生成砖块的矩阵
    private int[] line = { 1, 6, 8, 3, 4, 7, 11, 16, 9, 14, 13, 10 };//特殊砖块所在行
    private int[] row = { 3, 3, 2, 1, 0, 0, 0, 0, 1, 2, 3, 3 };//特殊砖块所在列
    private int place = 0;//遍历到次序

    private void Start()
    {
        //if (SceneManager.GetActiveScene().rootCount != 0)
            DontDestroyOnLoad(gameObject);//设定不随场景销毁
       
        for (int i = 0; i < 18; i++)//对于整个矩阵的行
        {
            for (int j = 0; j < 4; j++)//对于整个矩阵的列
            {
                blocks[i, j] = -1;//全部填充为-1(普通砖块)
            }
        }
    }

    private void Update()
    {
        if (InstantiateController.confirm)//当确认了某砖块之后
        {
            blocks[line[place], row[place]] = functionKind[functionKind.Count - 1];//记录最新加进来的元素
            place++;//选择下一个矩阵位置
        }

        /*测试用*/
        //for (int i = 0; i < 18; i++)//对于整个矩阵的行
        //{
        //    for (int j = 0; j < 4; j++)//对于整个矩阵的列
        //    {
        //        Debug.Log(i+" "+j +"  "+blocks[i, j]);
        //    }
        //}

    }
}