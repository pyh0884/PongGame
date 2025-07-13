using UnityEngine.Audio;
using UnityEngine;
using System;
using UnityEngine.SceneManagement;

public class AudioManager : MonoBehaviour
{
    
    public Audio[] audios;
    public static AudioManager cur;
    void Awake()
    {

        if (cur == null)
        {
            cur = this;
        }
        else
        {
            Destroy(gameObject);
            return;
        }
            DontDestroyOnLoad(gameObject);
        foreach (Audio s in audios)
        {
            s.source = gameObject.AddComponent<AudioSource>();
            s.source.clip = s.clip;
            s.source.pitch = s.pitch;
            s.source.volume = s.volume;
            s.source.loop = s.loop;
            s.source.mute = s.mute;
            s.source.outputAudioMixerGroup = s.mixer;
        }
    }


        void Start()
    {
            Play("Main Theme");
    }
    public void Mute(string name)
    {

        Audio s = Array.Find(audios, sound => sound.name == name);
        if (s == null)
        {
            //Debug.Log(name + "没找到啊");
            return;
        }
        s.source.mute = true;
    }

    public void UnMute(string name)
    {

        Audio s = Array.Find(audios, sound => sound.name == name);
        if (s == null)
        {
            //Debug.Log(name + "没找到啊");
            return;
        }
        s.source.mute = false;
    }

    public void Play(string name)
    {

        Audio s = Array.Find(audios, sound => sound.name == name);
        if (s == null)
        {
            //Debug.Log(name + "没找到啊");
            //return;
        }
        s.source.Play();
    }
}
