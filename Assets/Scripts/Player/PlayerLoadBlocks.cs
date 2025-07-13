using System.Collections;
using System.Collections.Generic;
using UnityEngine;
public class PlayerLoadBlocks : MonoBehaviour
{
    string[] blocksName = { "SimpleBlocks", "ExplodeBlocks", "ShieldBlocks", "UnbreakableBlocks", "BallBlocks", "MageneticBlocks" };
    int[,] blocks;

    public GameManager GM;

    LevelCreater LC;
    

    float height;
    float width;
    float posX;

    public bool right;

    void loadBlocksAtPoint(Vector2 pos, int index)
    {
        pos.x += GM.PlayerSize.x / 2;
        pos.y -= GM.PlayerSize.y / 2;
        GameObject childTemp = Instantiate(Resources.Load("Blocks/" + blocksName[index]), new Vector3(pos.x, pos.y, 0f) + transform.position, Quaternion.identity) as GameObject;
        childTemp.transform.parent = gameObject.transform.Find("Blocks");
    }

    void loadBlocks()
    {
        //Debug.Log(GM.PlayerPos);
        transform.position = new Vector3((right ? 1 : -1) * GM.PlayerPos, 0, 0);
        int[,] BlockDic = LC.blocksArray;
        int col, row;
        row = BlockDic.GetLength(0);
        col = BlockDic.GetLength(1);
        int heightIndex = row / 2;
        int widthIndex = col;
        int index = right ? heightIndex : 0;
        width = widthIndex * GM.PlayerSize.x;
        height = heightIndex * GM.PlayerSize.y;
        Vector2 pos = new Vector2(-width / 2, height / 2);
        for (int y = index; y < index + heightIndex; y++)
        {
            for (int x = 0; x < widthIndex; x++)
            {
                loadBlocksAtPoint(pos, BlockDic[y, x]);
                pos += Vector2.right * GM.PlayerSize.x;
            }
            pos.x = -width / 2;
            pos += Vector2.down * GM.PlayerSize.y;
        }
    }

    //public void setblock()
    //{
    //    
   // }

    private void Start()
    {
        LC = FindObjectOfType<LevelCreater>();
        GM = FindObjectOfType<GameManager>();
        
        height = GM.PlayerSize.y;
        width = GM.PlayerSize.x;

        posX = GM.PlayerPos;
          if(FindObjectOfType<EnemyMode>() != null)
            loadBlocks();

    }
   

}