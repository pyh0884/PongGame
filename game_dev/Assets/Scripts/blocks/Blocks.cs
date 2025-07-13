using System.Collections;
using System.Collections.Generic;
using UnityEngine;

public class Blocks : MonoBehaviour
{
    bool shield = false;
    GameObject shieldOBJ;

    public virtual void SetShield()
    {
        shield = true;
        loadShield();
    }

    Collider2D blocksCollider;
    public bool destroying = false; //防止在加入一些其他功能后会导致销毁代码反复调用，比如两个相邻爆炸砖块在播放爆炸动画时来回触发

    private void Awake() {
        blocksCollider = GetComponent<BoxCollider2D>();
    }

    public virtual void DestroyThis(){ //子类无需再写OnCollision,不同砖块可重写被撞击后的代码
        if(destroying)
            return;
        destroying = true;
        Destroy(gameObject);
    }

    private void OnCollisionEnter2D(Collision2D collision)
    {
        GameObject obj = collision.gameObject;
        if (obj.GetComponent<Ball>() != null)
        {
            if(shield){
                shield = false;
                Destroy(shieldOBJ);
            }
            else
                DestroyThis();
        }
    }

    public void loadShield()
    {
        shieldOBJ=Instantiate(Resources.Load("Blocks/shield"),transform.position, Quaternion.identity) as GameObject;
        shieldOBJ.transform.parent = transform;

    }


}
