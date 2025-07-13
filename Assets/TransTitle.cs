using System.Collections;
using System.Collections.Generic;
using UnityEngine;
using UnityEngine.UI;
using UnityEngine.SceneManagement;

public class TransTitle : MonoBehaviour
{
    public Image logo;
    public float totaltime;

    // Start is called before the first frame update
    void Start()
    {
        StartCoroutine(nextScene());
    }

    IEnumerator nextScene()
    {
        Color col;
        for(float i=0;i<=1;i+=.05f)
        {
            col = logo.color;
            col.a = i;
            logo.color = col;
            yield return new WaitForSeconds(totaltime*.05f*.4f);
        }
        yield return new WaitForSeconds(totaltime*.4f);
        for(float i=0;i<=1;i+=.05f)
        {
            col = logo.color;
            col.a = 1-i;
            logo.color = col;
            yield return new WaitForSeconds(totaltime*.05f*.2f);
        }
        SceneManager.LoadScene(1);

    }
}
