using System.Collections;
using System.Collections.Generic;
using UnityEngine;
using UnityEngine.SceneManagement;


public class Trans : MonoBehaviour
{
    public GameObject PauseMenu;
    public void LoadScene(int number) 
    {
        StartCoroutine(LoadSceneFunction(number));      
    }

    IEnumerator LoadSceneFunction(int number) 
    {

        if (PauseMenu != null)
        {
            PauseMenu.SetActive(false);
        }

        Time.timeScale = 1;
        
        SceneManager.LoadScene(number);
        yield return new WaitForSeconds (1);
    }

    public void QuickLoad(int number)
    {
        SceneManager.LoadScene(number);
    }
}
