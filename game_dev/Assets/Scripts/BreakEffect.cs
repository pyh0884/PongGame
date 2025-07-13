using System.Collections;
using System.Collections.Generic;
using UnityEngine;

public class BreakEffect : MonoBehaviour
{
    bool endup = false;
    public void EndEffect()
    {
        endup = true;
    }

    private void FixedUpdate() {
        if(endup)
            Destroy(gameObject);
    }
}
