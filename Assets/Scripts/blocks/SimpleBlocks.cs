using System.Collections;
using System.Collections.Generic;
using UnityEngine;

public class SimpleBlocks : Blocks
{
    float ranNum;
    public override void DestroyThis(){ //子类无需再写OnCollision,不同砖块可重写被撞击后的代码
        if(destroying)
            return;
        destroying = true;
        ranNum = Random.Range(0, 100);
        if (ranNum<50)
        FindObjectOfType<AudioManager>().Play("Regular Block Break");
        else
            FindObjectOfType<AudioManager>().Play("Regular Block Break2");
        Instantiate(Resources.Load("BreakEffect"),transform.position,Quaternion.identity);
        Destroy(gameObject);
    }

}
