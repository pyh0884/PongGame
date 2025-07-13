using System.Collections;
using System.Collections.Generic;
using UnityEngine;

public class ShieldBlocks : Blocks
{
    public override void SetShield()
    {
        return;
    }

    private void Start() {
        for (float i = -1; i <= 1; i++)
            for (float j = -1; j <= 1; j++)
            {
                if (i == 0 && j == 0)
                    continue;
                Vector2 dir = new Vector2(i, j) * GameManager.instance.PlayerSize + (Vector2)transform.position;
                Collider2D[] Besides = Physics2D.OverlapPointAll(dir);
                foreach (var item in Besides)
                {
                    if ((item.GetComponent<Blocks>() != null)&&(item.GetComponent<ExplodeBlocks>() == null) && (item.GetComponent<MagneticBlocks>() == null) && (item.GetComponent<UnbreakableBlock>() == null) && (item.GetComponent<BallBlocks>() == null))
                    {
                        item.GetComponent<Blocks>().SetShield();
                    }
                }
            }
    }

    void Shield()
    {
        
    }
}
