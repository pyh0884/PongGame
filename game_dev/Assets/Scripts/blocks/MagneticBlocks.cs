using System.Collections;
using System.Collections.Generic;
using UnityEngine;

public class MagneticBlocks : Blocks
{
    Collider2D blocksCollider;

    void CheckManitude()
    {
        Collider2D[] cols = Physics2D.OverlapCircleAll(transform.position, GameManager.instance.MagnitudeSize);
        foreach(Collider2D col in cols)
            if(col.gameObject.GetComponent<Ball>()!=null)
            {
                Vector2 dir = transform.position - col.gameObject.transform.position;
                dir.Normalize();
                dir *= GameManager.instance.MagnitudeForce;
                col.gameObject.GetComponent<Rigidbody2D>().AddForce(dir);
            }
    }

    private void FixedUpdate() {
        CheckManitude();
    }
}
