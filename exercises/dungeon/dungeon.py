import os

if os.getcwd() == "/dungeon":
    print("The chains rattle and the door swings open!")
    print("Your code: CHAINS-6048")
else:
    print(f"You are lost in {os.getcwd()!r}. The dungeon is at /dungeon. Check your WORKDIR!")
