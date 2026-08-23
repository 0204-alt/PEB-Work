import os
import glob

loads_dir = r"c:\Users\lenovo\Desktop\New folder\packages\engineering-core\src\loads"

for filepath in glob.glob(os.path.join(loads_dir, "*.ts")):
    with open(filepath, "r") as f:
        content = f.read()

    new_content = content.replace("LoadApplication", 'LoadCase["applications"][0]')
    if content != new_content:
        with open(filepath, "w") as f:
            f.write(new_content)
