using System.Collections;
using System.Collections.Generic;
using UnityEngine;

public class UnbreakableBlock : Blocks
{

    public override void DestroyThis()
    {
        return;
    }

    bool CheckBlendTree()
    {
        bool b = false;
        foreach (var dir in GameManager.instance.blendTree)
        {
            Vector2 setD = dir * GameManager.instance.PlayerSize;
            Collider2D[] Besides = Physics2D.OverlapPointAll(setD + (Vector2)transform.position);
            foreach (var item in Besides)
            {
                if (item.GetComponent<Blocks>() != null)
                {
                    b = true;
                }
            }
        } 
        return b;
    }

    private void Update() {
        if(!CheckBlendTree())
            Destroy(gameObject);
    }

}