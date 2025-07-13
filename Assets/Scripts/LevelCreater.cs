using System.Collections;
using System.Collections.Generic;
using UnityEngine;

public class LevelCreater : MonoBehaviour
{
    public int width, height;
    public int[,] blocksArray;
    public int[,] posD = { { 1, 3 }, { 3, 1 }, { 4, 0 }, { 6, 3 }, { 7, 0 }, { 8, 2 } };
    int[] BlockType = new int[6];

    void instantiateType()
    {
        blocksArray = new int[height*2, width];
        for (int i = 1; i <= 5; i++)
        {
            bool _in = false;
            while(!_in)
            {
                int pos = (int)Random.Range(0, 5.999f);
                if (BlockType[pos] == 0)
                {
                    BlockType[pos] = i;
                    _in = true;
                }
            }
        }
        int lastType = (int)Random.Range(1, 5.999f);
        for (int i = 0; i < BlockType.Length; i++)
            if (BlockType[i] == 0)
            {
                BlockType[i] = lastType;
                break;
            }
        for (int i = 0; i < posD.GetLength(0); i++)
        {
            blocksArray[posD[i, 0], posD[i, 1]] = BlockType[i];
            blocksArray[posD[i, 0] + height, width - posD[i, 1] -1] = BlockType[i];
        }
        //Debug.Log(blocksArray);

    }

    private void Awake()
    {
        instantiateType();
    }

    // Start is called before the first frame update
    void Start()
    {
        
    }

    // Update is called once per frame
    void Update()
    {
        
    }
}
