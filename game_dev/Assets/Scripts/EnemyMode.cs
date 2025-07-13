using System.Collections;
using System.Collections.Generic;
using UnityEngine;

public class EnemyMode : ModeManager
{
    float time;

    public void CheckPlayer()
    {
        int num = player1.transform.Find("Blocks").transform.childCount;
        if (num == 0)
        {
            FindObjectOfType<AudioManager>().Play("Winning BGM");
            SetWin(true);
        }
        num = player2.transform.Find("Blocks").transform.childCount;
        if (num == 0)
        {
            FindObjectOfType<AudioManager>().Play("Winning BGM");
            SetWin(false);
        }    
    }

    private void Start()
    {

        time = Time.time;
    }

    private void FixedUpdate() {
        //if(Time.time - time > 2f)
            CheckPlayer();
    }
}
