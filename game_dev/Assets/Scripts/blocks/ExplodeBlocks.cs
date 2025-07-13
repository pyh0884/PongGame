using System.Collections;
using System.Collections.Generic;
using UnityEngine;

public class ExplodeBlocks : Blocks
{
    Collider2D blocksCollider;

    private void Awake() {
        blocksCollider = GetComponent<BoxCollider2D>();
    }

    public override void DestroyThis()
    {
        if(destroying)
            return;
        destroying = true;
        StartCoroutine(explode());


    }

     IEnumerator explode()
    {
        Collider2D[] cols = Physics2D.OverlapCircleAll(transform.position, GameManager.instance.ExplodeRadius);
        foreach(Collider2D col in cols)
            if(col.gameObject.GetComponent<Blocks>()!=null)
            {
                col.gameObject.GetComponent<Blocks>().DestroyThis();
            }
        yield return null;
        Destroy(gameObject);
    }
}
