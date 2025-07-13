using System.Collections;
using System.Collections.Generic;
using UnityEngine;
using UnityEngine.SceneManagement;

public class MainMenu : MonoBehaviour
{
    public GameObject PauseMenu;
    public void Play(int number)
    {
        if (PauseMenu != null)
            {
            PauseMenu.SetActive(false);
            }

            Time.timeScale = 1;
        SceneManager.LoadScene(number);
    }

    public void ExitGame()
    {
        Application.Quit();
    }
    public void ContinuePlay()
        {if (PauseMenu != null)
        {
            PauseMenu.SetActive(false);
        }
        Time.timeScale = 1;
        }
}
