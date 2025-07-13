using System.Collections;
using System.Collections.Generic;
using UnityEngine;
using UnityEngine.UI;

public class PongManager : ModeManager
{
    public static PongManager instance;

    float timer;

    public float timeCount;

    public Bound leftBound, rightBound;

    public Text timerText;    
       
    private void Start() {
        instance = this;
        timer = timeCount;
        StartCoroutine(StartTimer());
    }

    public void GameEnd(bool right)
    {
        SetWin(right);
        FindObjectOfType<AudioManager>().Play("Winning BGM");
        Time.timeScale=0;
    }

    IEnumerator StartTimer()
    {
        while(timer > 0)
        {
            timerText.text = "" + (int)timer--; 
            yield return new WaitForSeconds(1f);
        }
        GameEnd(leftBound.score > rightBound.score ? false : true);
    }

}
