using UnityEngine;
public class InstantiateController : MonoBehaviour/*实例化控制器*/
{
    public GameObject[] instantiateBlock;//需要实例化的砖块
    public Transform[] instantiatePosition;//需要实例化的位置
    public bool leftFirst, rightFirst;//左侧玩家先选择还是右侧？
    private int instantiatePlace = 0;//需要实例化的次序
    private bool instantiated = false;//是否已经实例化了砖块？
    public static bool confirm = false;//是否确认选择了功能？
    private GameObject currentBlock;//当前的砖块
    private GameObject numberChecker;//数量检测器
    private float timer = 0.5f;

    private void Start()//初始化
    {
        CheckBoxController.leftPlayer = leftFirst;//设定左侧玩家操作先后手
        CheckBoxController.rightPlayer = rightFirst;//设定右侧玩家操作先后手
        numberChecker = GameObject.FindWithTag("NumberChecker");//获取数量检测器
    }

    private void Update()//每帧更新的部分
    {
        if (!instantiated)//如果未实例化砖块
        {
            if (confirm)//如果设定砖块已确认放置
            {
                confirm = false;//设定未确认砖块放置
            }
            if (numberChecker.GetComponent<NumberCheckerController>().remainedNumber[(int)CheckBoxController.currentFunction] != 0)//如果该砖块的剩余数量不为0
            {
                currentBlock = Instantiate(instantiateBlock[(int)CheckBoxController.currentFunction], instantiatePosition[instantiatePlace].position, Quaternion.identity);//instantiatePosition[instantiatePlace]位置实例化砖块   
                instantiated = true;//设定已经实例化了砖块
            }
        }
        else//如果已经实例化砖块
        {
            if (((Input.GetKeyUp(KeyCode.W) || Input.GetKeyUp(KeyCode.S)) && CheckBoxController.leftPlayer) || ((Input.GetKeyUp(KeyCode.UpArrow) || Input.GetKeyUp(KeyCode.DownArrow)) && CheckBoxController.rightPlayer))//如果两侧玩家按下自己一方的移动选择框的按键
            {
                Destroy(currentBlock);//销毁当前的砖块
                instantiated = false;//设定未实例化砖块
            }

            if (Input.GetKeyUp(KeyCode.Space) && CheckBoxController.leftPlayer)//如果左侧玩家按下空格
            {
                FunctionMemoryController.functionKind.Add((int)CheckBoxController.currentFunction);//记录砖块的功能
                CheckBoxController.rightPlayer = !(CheckBoxController.leftPlayer = false);//换到右侧玩家进行选择
                instantiatePlace++;//移动到下一个位置实例化
                confirm = !(instantiated = false);//设定未实例化砖块，已确认上一个砖块
            }
            if ((Input.GetKeyUp(KeyCode.KeypadEnter) || Input.GetKeyUp(KeyCode.Return)) && CheckBoxController.rightPlayer)//如果右侧玩家按下回车键
            {
                FunctionMemoryController.functionKind.Add((int)CheckBoxController.currentFunction);//记录砖块的功能
                CheckBoxController.leftPlayer = !(CheckBoxController.rightPlayer = false);//换到左侧玩家进行选择
                instantiatePlace++;//移动到下一个位置实例化
                confirm = !(instantiated = false);//设定未实例化砖块，已确认上一个砖块
            }
        }
    }
}