我需要完成这样的功能：
1. editor.html 里面要保留 getLocalEditData() 函数和 exportLocalEdit()函数（这是未来与网站后端对齐的接口）；
2. editor.html 是为手机竖屏用户制作的。请尊重手机用户的使用习惯。
3. editor.html 里面尽量减少直接的js写作。全部利用相对目录引用到editorResource下的其他js文件或资源。
4. editor.html 里面需要完成这样的功能：
    1. 利用AI自然语言生成一个 enemy_spawn_data.json文件，并存储在 localStorage或者其他用户的本地缓存系统之中；
        1. 这里可以做一个左右两栏或上下两栏页面，其中一栏是用户的自然语言输入栏，另一栏用来呈现生成后的 json。
        2. 生成后的json需要满足ajv规则的约束。
        3. API key 和 prompt 均为常数，目前demo期不要求安全性，可以以一个json的方式保存在 editorResource里面，我们后续处理。
        4. 这个json的存储名称应当为 enemy_spawn_data.json
    2. 用户可以上传四张png图片，用于 替换游戏中敌人的头像。这些内容也可以存储在上述所称的本地缓存系统之中。
        1. 用户可以上传常见的图片，我们在前端转换为png。如果这部分很难，就要求用户只能上传png图片。
        2. 不得太大：如果用户上传超过256px，将其按比例缩放，保证其最长的边为256px。
        3. 这四个图片最终保存的名称应当为 enemy0.png, enemy1.png, enemy2.png
    3. 用户可以上传一段mp3音频，用于替换游戏中的音频。
        1. 用户上传的文件大小不得超过10mb
        2. 这个音频文件的保存名称应当为 bgm.mp3
5. editor.html 的 getLocalEditData()函数会试图将上述的 enemy_spawn_data.json, enemy0.png, ..., bgm.mp3 等均压缩为zip，并按blob发送出去。同时协议里带有 game name 和 game description。
    1. 压缩目录应当在 mod下面，texture文件和audio文件各自存在自己的文件夹。
    2. 也即：
        - mod/
            - enemy_spawn_data.json
            - /audio/
                - bgm.mp3
            - /texture/
                - enemy0.png
                - enemy1.png
                - enemy2.png
                - enemy3.png
    3. 要求这个zipblob 解压后直接出来的是 mod 文件夹。
    4. 缺失文件也没有关系。游戏会自己处理丢失文件的fallback。
6. 由于发布按钮协议暂且没有完成，需要存在一个【测试发布流程】的按钮。测试发布流程按钮会做这些事情：
    1. 按照 packing_rule.json 文件的内容，将game相关的文件全部收集起来；
    2. 将mod相关的本地缓存的文件也全部收集起来。
    3. 将这些文件按层级统一打包，并下载。认为这个包体名称如果叫做【game_name】的话，其文件目录应该为：
        - game_name/
            - index.html
            - （一些packing_rule.json 指示的 game 文件）
            ...
            - mod/
                - enemy_spawn_data.json
                - /audio/
                    - bgm.mp3
                - /texture/
                    - enemy0.png
                    - enemy1.png
                    - enemy2.png
                    - enemy3.png
    4. 将收集后的文件按zip打包并提示用户下载存储（用户可选择存储在哪里）
    

