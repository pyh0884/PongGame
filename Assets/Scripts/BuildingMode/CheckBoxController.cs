using UnityEngine;
public class CheckBoxController : MonoBehaviour/*选择框控制器*/
{
    public float interval;//选择框移动间隔
    public static bool leftPlayer, rightPlayer;//左侧还是右侧的玩家在进行选择
    public float maxHeight, minHeight;//选择框可以到达的最大及最小高度
    private enum Direction { up, down };//选择向上还是向下移动的枚举
    public enum FunctionKind { explode, shield, unbreakable, fork, magnet }//五种砖块的枚举
    public static FunctionKind currentFunction;//当前选择的砖块功能

    private void Start()//初始化
    {
        currentFunction = FunctionKind.explode;//默认从爆炸功能开始
    }

    private void Update()//每帧更新的部分
    {
        if (leftPlayer)//如果是左侧的玩家在操作
        {
            if (GetComponent<SpriteRenderer>().sprite != Resources.Load<Sprite>("BuildingMode/Icon/Red"))//如果选择框不是红色
            {
                GetComponent<SpriteRenderer>().sprite = Resources.Load<Sprite>("BuildingMode/Icon/Red");//替换为红色选择框
            }

            if (Input.GetKeyUp(KeyCode.W))//如果按下W键
            {
                ChangePosition(Direction.up);//向上移动选择框
            }
            else if (Input.GetKeyUp(KeyCode.S))//如果按下S键
            {
                ChangePosition(Direction.down);//向下移动选择框
            }
        }
        else if (rightPlayer)//如果是右侧的玩家在操作
        {
            if (GetComponent<SpriteRenderer>().sprite != Resources.Load<Sprite>("BuildingMode/Icon/Blue"))//如果选择框不是蓝色
            {
                GetComponent<SpriteRenderer>().sprite = Resources.Load<Sprite>("BuildingMode/Icon/Blue");//替换为蓝色选择框
            }

            if (Input.GetKeyUp(KeyCode.UpArrow))//如果按下键盘上键
            {
                ChangePosition(Direction.up);//向上移动选择框
            }
            else if (Input.GetKeyUp(KeyCode.DownArrow))//如果按下键盘下键
            {
                ChangePosition(Direction.down);//向下移动选择框
            }
        }
    }

    private void ChangePosition(Direction direction)//改变选择框位置
    {
        if (direction == Direction.up)//如果选择向上移动选择框
        {
            transform.position += new Vector3(0, (Mathf.Abs(transform.position.y - maxHeight) < 0.1f) ? (-interval * 4) : interval);//如果不是选择第一个功能，选择框上移，否则回到最后一个
            if (currentFunction == FunctionKind.explode)//如果是第一种功能
            {
                currentFunction = FunctionKind.magnet;//回到最后一种功能
            }
            else
            {
                currentFunction--;//选择上一种功能
            }
        }
        else if (direction == Direction.down)//如果选择向下移动选择框
        {
            transform.position += new Vector3(0, (Mathf.Abs(transform.position.y - minHeight) < 0.1f) ? (interval * 4) : -interval);//如果不是选择最后一个功能，选择框下移，否则回到第一个
            if (currentFunction == FunctionKind.magnet)//如果是最后一种功能
            {
                currentFunction = FunctionKind.explode;//回到第一种功能
            }
            else
            {
                currentFunction++;//选择下一种功能
            }
        }
    }
}
