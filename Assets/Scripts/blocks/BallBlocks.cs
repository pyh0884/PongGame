using System.Collections;
using System.Collections.Generic;
using UnityEngine;

public class BallBlocks : Blocks
{
    public Vector2[] dirs;

    public override void DestroyThis()
    {
        destroying = true;
        GetComponent<BoxCollider2D>().enabled = false;
        GameManager.instance.newBall(transform.position, 5f);
        GameManager.instance.newBall(transform.position, 5f);
        Destroy(gameObject);
    }
}
