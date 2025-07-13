using System.Collections;
using System.Collections.Generic;
using UnityEngine;

public class Pause : MonoBehaviour
{
    private bool paused = false;
    public GameObject PauseMenu;
    // Start is called before the first frame update
    void Start()
    {
        
    }

    // Update is called once per frame
    void Update()
    {
        if (Input.GetKeyDown(KeyCode.Escape) && !paused)
        {
            FindObjectOfType<AudioManager>().Play("Menu Open");
            Time.timeScale = 0;            
            PauseMenu.SetActive(true);
            paused = true;
        }
        else if (Input.GetKeyDown(KeyCode.Escape) && paused)
        {
            FindObjectOfType<AudioManager>().Play("Menu Close");
            //FindObjectOfType<AudioManager>().Play("Click");
            PauseMenu.SetActive(false);
            Time.timeScale = 1;
            paused = false;
        }
    }
    public void resume()
    {
        FindObjectOfType<AudioManager>().Play("Menu Close");
        PauseMenu.SetActive(false);
        Time.timeScale = 1;
        paused = false;
    }
}
